// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "./NFTYNotes.sol";
import "../interfaces/INFTYLending.sol";
import "../interfaces/IDIAOracleV2.sol";

import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract NFTYLending is
    INFTYLending,
    Initializable,
    OwnableUpgradeable,
    ERC721HolderUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.AddressSet;

    /* ******* */
    /* STORAGE */
    /* ******* */

    /**
     * @notice Unique identifier for liquidity shops
     */
    Counters.Counter private shopIdCounter;
    /**
     * @notice Unique identifier for loans
     */
    Counters.Counter private loanIdCounter;

    /**
     * @notice Mapping to store liquidity shops
     */
    mapping(uint256 => LiquidityShop) public liquidityShops;

    /**
     * @notice Mapping to store loans on this contract
     */
    mapping(uint256 => Loan) public loans;

    /**
     * @notice Mapping for registered ERC20s which can be used as currency in liquidity shops
     */
    mapping(address => Erc20) public erc20s;

    /**
     * @notice Enumerable Set that stores all currently whitelisted ERC20 addresses
     */
    EnumerableSet.AddressSet private whitelistedErc20s;

    /**
     * @notice Mapping for registered NFT collections which can be used as collaterals in liquidity shops
     */
    mapping(address => Nft) public nfts;

    /**
     * @notice Enumerable Set that stores all currently whitelisted NFTs addresses
     */
    EnumerableSet.AddressSet private whitelistedNfts;

    /**
     * @notice The address of the ERC721 to generate promissory notes for lenders
     */
    address public promissoryNoteToken;

    /**
     * @notice The address of the ERC721 to generate obligation receipts for borrowers
     */
    address public obligationReceiptToken;

    /**
     * @notice The address of the oracle to be used for fees
     */
    address public oracle;

    /**
     * @notice The address of the NFTY Token contract to use for borrower fees
     */
    address public nftyTokenContract;

    /**
     * @notice The percentage of fees that the borrower will pay for each loan
     */
    uint256 private loanOriginationFeePercentage;

    /**
     * @notice The percentage of fees that will be used when asking for a loan
     */
    PlatformFees public platformFees;

    /**
     * @notice The amount of platform fees (in NFTY tokens) that can be withdrawn by an admin
     */
    uint256 private platformBalance;

    /* @notice Mapping that keeps a record of nonces used by borrowers
     * An uint256 number that should uniquely identify each signature for each user (i.e. each user should only create one
     * off-chain signature for each nonce, with a nonce being any arbitrary
     * uint256 value that they have not used yet for an off-chain Nfty signature).
     */
    mapping(address => mapping(uint256 => bool))
        private nonceHasBeenUsedForUser;

    /**
     * @notice The maximum acceptable amount of time passed since the oracle price was last updated in seconds for it to remain valid
     */
    uint256 public feeExpirationTime;

    /* *********** */
    /* EVENTS */
    /* *********** */

    /**
     * @notice Event that will be emitted every time a liquidity shop is created
     * @param owner The address of the owner of the created liquidity shop
     * @param erc20 The ERC20 allowed as currency on the liquidity shop
     * @param nftCollection The NFT Collection allowed as collateral for loans on the liquidity shop
     * @param maxOffer The max offer set for the NFT collection, valued in the ERC20 tokens set for the liquidity shop
     * @param interestA The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration A; e.g. `15` means 15%, and so on
     * @param interestB The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration B
     * @param interestC The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration C
     * @param amount The current balance of the liquidity shop
     * @param id A unique liquidity shop ID
     * @param name The name of the liquidity shop
     * @param automaticApproval Whether or not this liquidity shop will accept offers automatically
     * @param allowRefinancingTerms Whether or not this liquidity shop will accept refinancing terms. NOTE: Not currently implemented
     */
    event LiquidityShopCreated(
        address indexed owner,
        address indexed erc20,
        address indexed nftCollection,
        uint256 interestA,
        uint256 interestB,
        uint256 interestC,
        uint256 maxOffer,
        uint256 amount,
        uint256 id,
        string name,
        bool automaticApproval,
        bool allowRefinancingTerms
    );

    /**
     * @notice Event that will be emitted every time liquidity is added to a shop
     *
     * @param owner The address of the owner of the liquidity shop
     * @param id Identifier for the liquidity shop
     * @param balance Current balance for the liquidity shop
     * @param liquidityAdded Amount of liquidity added to the shop
     */
    event LiquidityAddedToShop(
        address indexed owner,
        uint256 id,
        uint256 balance,
        uint256 liquidityAdded
    );

    /**
     * @notice Event that will be emitted every time there is a cash out on a liquidity shop
     *
     * @param owner The address of the owner of the liquidity shop
     * @param id Identifier for the liquidity shop
     * @param cashoutAmount Balance withdrawn for this shop
     */
    event LiquidityShopCashOut(
        address indexed owner,
        uint256 id,
        uint256 cashoutAmount
    );

    /**
     * @notice Event that will be emitted every time a liquidity shop is frozen
     *
     * @param owner The address of the owner of the frozen liquidity shop
     * @param id Identifier for the liquidity shop
     * @param balance Current balance for the liquidity shop
     */
    event LiquidityShopFrozen(
        address indexed owner,
        uint256 id,
        uint256 balance
    );

    /**
     * @notice Event that will be emitted every time a liquidity shop is unfrozen
     *
     * @param owner The address of the owner of the unfrozen liquidity shop
     * @param id Identifier for the liquidity shop
     * @param balance Current balance for the liquidity shop
     */
    event LiquidityShopUnfrozen(
        address indexed owner,
        uint256 id,
        uint256 balance
    );

    /**
     * @notice Event that will be emitted every time a new offer is accepted
     *
     * @param lender The address of the owner
     * @param borrower The address of the borrower
     * @param liquidityShopId A unique identifier that determines the liquidity shop to which this offer belongs
     * @param loanId A unique identifier for the loan created
     * @param nftyNotesId A unique identifier of the NFTY Notes promissory and obligation note ids
     */
    event OfferAccepted(
        address indexed lender,
        address indexed borrower,
        uint256 liquidityShopId,
        uint256 loanId,
        uint256 nftyNotesId
    );

    /**
     * @notice Event that will be emitted every time a loan is liquidated when the obligation receipt holder did not pay it back in time
     *
     * @param promissoryNoteOwner The address of the promissory note owner
     * @param liquidityShopId The unique identifier of the liquidity shop
     * @param loanId The unique identifier of the loan
     * @param nftyNotesId The token ID for both the promissory note and obligation receipt tokens, burned in the process
     * @param nftCollateralId The collateral NFT ID that was sent to the promissory note holder
     */
    event LiquidatedOverdueLoan(
        address indexed promissoryNoteOwner,
        uint256 liquidityShopId,
        uint256 loanId,
        uint256 nftyNotesId,
        uint256 nftCollateralId
    );

    /**
     * @notice Event that will be emitted every time an obligation receipt holder pays back a loan
     *
     * @param obligationReceiptOwner The address of the owner of the obligation receipt, actor who pays back a loan
     * @param promissoryNoteOwner The address of the owner of the promissory note, actor who receives the payment loan fees
     * @param loanId The unique identifier of the loan
     * @param paidAmount The amount of currency paid back to the promissory note holder
     * @param remainder The amount of currency remaining to be paid
     *
     */
    event PaymentMade(
        address indexed obligationReceiptOwner,
        address indexed promissoryNoteOwner,
        uint256 loanId,
        uint256 paidAmount,
        uint256 remainder
    );

    /**
     * @notice Event that will be emitted every time an obligation receipt holder fully pays back a loan
     *
     * @param obligationReceiptOwner The address of the owner of the obligation receipt, actor who pays back the loan and receives the collateral
     * @param promissoryNoteOwner The address of the owner of the promissory note, actor who receives the paid loan fees
     * @param liquidityShopId The unique identifier of the liquidity shop
     * @param loanId The unique identifier of the loan
     * @param paidAmount The total amount of currency paid back to the promissory note holder, including interests
     * @param borrowerFees The amount of fees paid back to the obligation receipt holder
     * @param nftyNotesId The token ID for both the promissory note and obligation receipt tokens, burned in the process
     * @param nftCollateralId The collateral NFT ID that was sent to the obligation receipt holder
     */
    event PaidBackLoan(
        address indexed obligationReceiptOwner,
        address indexed promissoryNoteOwner,
        uint256 liquidityShopId,
        uint256 loanId,
        uint256 paidAmount,
        uint256 borrowerFees,
        uint256 nftyNotesId,
        uint256 nftCollateralId
    );

    /**
     * @notice Event that will be emitted every time there is a change on the registered ERC20s applied by an admin
     *
     * @param addr The address of the ERC20 contract
     * @param allowed Value that indicates whether the collection is whitelisted or not
     * @param minimumBasketSize The minimum amount of tokens that a lender should send to create a liquidity shop
     * @param minimumPaymentAmount The minimum amount of tokens that a borrower should send to pay back a loan
     */
    event Erc20Set(
        address indexed addr,
        bool allowed,
        uint256 minimumBasketSize,
        uint256 minimumPaymentAmount
    );

    /**
    Event that will be emitted every time there is a change on the registered NFTs applied by an admin
    *
    * @param addr The address of the NFT contract
    * @param allowed Value that indicates whether the collection is whitelisted or not
    * @param image The url of the image that will be shown for that NFT collection
    */
    event NftSet(address indexed addr, bool allowed, string image);

    /**
     * @notice Event that will be emitted every time an admin changes contract fees
     *
     * @param platformFees The percentage of fees for each participant
     */
    event PlatformFeesSet(PlatformFees platformFees);

    /**
     * @notice Event that will be emitted every time an admin changes the contract loan origination fee
     *
     * @param loanOriginationFees The percentage of fees in tokens that the borrower will have to pay for a loan
     */
    event LoanOriginationFeesSet(uint256 loanOriginationFees);

    /**
     * @notice Event that will be emitted every time an admin changes the expiration time for token conversions obtained through an oracle
     *
     * @param feeExpirationTime The maximum acceptable amount of time passed since the oracle price was last updated in seconds for it to remain valid
     */
    event FeeExpirationSet(uint256 feeExpirationTime);

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets the admin of the contract.
     *
     * @param _whitelistedErc20s Whitelisted ERC20s
     * @param _whitelistedNfts Whitelisted NFTs
     * @param _promissoryNoteToken Promissory note ERC721 address
     * @param _obligationReceiptToken Obligation receipt ERC721 address
     * @param _nftyTokenContract Address of the contract to be used for fees on this contract
     * @param _oracle Address of the oracle to be used for fee calculation
     */
    function initialize(
        WhitelistedErc20[] memory _whitelistedErc20s,
        WhitelistedNft[] memory _whitelistedNfts,
        address _promissoryNoteToken,
        address _obligationReceiptToken,
        address _nftyTokenContract,
        address _oracle
    ) public initializer {
        __Ownable_init();
        __Pausable_init();

        loanOriginationFeePercentage = 1;
        require(_nftyTokenContract != address(0), "nfty contract is zero addr");
        nftyTokenContract = _nftyTokenContract;

        for (uint256 i = 0; i < _whitelistedErc20s.length; i++) {
            setErc20(
                _whitelistedErc20s[i].addr,
                Erc20(
                    true,
                    _whitelistedErc20s[i].minBasket,
                    _whitelistedErc20s[i].minPayment
                )
            );
        }
        for (uint256 i = 0; i < _whitelistedNfts.length; i++) {
            setNft(
                _whitelistedNfts[i].addr,
                Nft(true, _whitelistedNfts[i].img)
            );
        }

        require(
            _promissoryNoteToken != address(0),
            "promissory note is zero addr"
        );
        promissoryNoteToken = _promissoryNoteToken;

        require(
            _obligationReceiptToken != address(0),
            "obligation receipt is zero addr"
        );
        obligationReceiptToken = _obligationReceiptToken;

        require(_oracle != address(0), "oracle is zero addr");
        oracle = _oracle;

        feeExpirationTime = 480;

        setPlatformFees(
            PlatformFees({
                lenderPercentage: 30,
                borrowerPercentage: 30,
                platformPercentage: 40
            })
        );
    }

    /**
     * @notice This function returns whether or not an ERC20 is allowed on this contract
     *
     * @param _address Address of the ERC20 to be added or changed
     * @param _erc20 Registered data for the ERC20: whitelist status, minimum basket size and minimum pay back amount
     * @return ret Returns true if the whitelisted ERC20s set was changed, false otherwise
     *
     * Emits an {Erc20Set} event.
     */
    function setErc20(
        address _address,
        Erc20 memory _erc20
    ) public onlyOwner returns (bool ret) {
        require(_address != address(0), "erc20 is zero addr");
        require(_erc20.minimumBasketSize != 0, "basketSize = 0");
        require(_erc20.minimumPaymentAmount != 0, "paymentAmount = 0");

        erc20s[_address] = _erc20;

        if (_erc20.allowed) {
            ret = whitelistedErc20s.add(_address);
        } else {
            ret = whitelistedErc20s.remove(_address);
        }

        emit Erc20Set(
            _address,
            _erc20.allowed,
            _erc20.minimumBasketSize,
            _erc20.minimumPaymentAmount
        );
    }

    /**
     * @notice Function that allows the admin of the platform to pause and unpause the protocol
     *
     * @param _paused Whether or not the protocol should be paused
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    /**
     * @notice An internal function that checks if the oracle price is too old.
     *
     * @param key A string specifying the asset.
     * @param maxTimePassed The max acceptable amount of time passed since the oracle price was last updated.
     *
     * @return price The price returned by the oracle.
     * @return inTime A boolean that is true if the price was updated at most maxTimePassed seconds ago, otherwise false.
     */
    function getPriceIfNotOlderThan(
        string memory key,
        uint128 maxTimePassed
    ) internal view returns (uint256 price, bool inTime) {
        uint128 oracleTimestamp;
        (price, oracleTimestamp) = IDIAOracleV2(oracle).getValue(key);
        inTime = ((block.timestamp - oracleTimestamp) < maxTimePassed)
            ? true
            : false;
        return (price, inTime);
    }

    /**
     * @notice This function returns all currently whitelisted ERC20s on this contract
     */
    function getWhitelistedErc20s()
        external
        view
        returns (WhitelistedErc20[] memory)
    {
        WhitelistedErc20[]
            memory whitelistedErc20Result = new WhitelistedErc20[](
                whitelistedErc20s.length()
            );

        for (uint256 i = 0; i < whitelistedErc20s.length(); i++) {
            Erc20 memory erc20 = erc20s[whitelistedErc20s.at(i)];
            whitelistedErc20Result[i] = WhitelistedErc20(
                whitelistedErc20s.at(i),
                erc20.minimumBasketSize,
                erc20.minimumPaymentAmount
            );
        }

        return whitelistedErc20Result;
    }

    /**
     * @notice This function allows the admin of the contract to add or remove NFTs from the contract whitelist,
     * as well as set or update their image
     *
     * @param _address Address of the NFT to be added or changed
     * @param _nft Registered data for the NFT: whitelist status and image URL
     * @return ret Returns true if the whitelisted NFTs set was changed, false otherwise
     *
     * Emits an {NFTSet} event.
     */
    function setNft(
        address _address,
        Nft memory _nft
    ) public onlyOwner returns (bool ret) {
        require(_address != address(0), "nft is zero addr");
        require(bytes(_nft.image).length > 0, "empty image");

        nfts[_address] = _nft;

        if (_nft.allowed) {
            ret = whitelistedNfts.add(_address);
        } else {
            ret = whitelistedNfts.remove(_address);
        }

        emit NftSet(_address, _nft.allowed, _nft.image);
    }

    /**
     * @notice This function returns all currently whitelisted NFTs on this contract
     */
    function getWhitelistedNfts()
        external
        view
        returns (WhitelistedNft[] memory)
    {
        WhitelistedNft[] memory whitelistedNftsResult = new WhitelistedNft[](
            whitelistedNfts.length()
        );

        for (uint256 i = 0; i < whitelistedNfts.length(); i++) {
            Nft memory nft = nfts[whitelistedNfts.at(i)];
            whitelistedNftsResult[i] = WhitelistedNft(
                whitelistedNfts.at(i),
                nft.image
            );
        }

        return whitelistedNftsResult;
    }

    /**
     * @notice This function allows the admin of the contract to modify the max acceptable amount of time passed since the oracle price was last updated.
     *
     * @param _feeExpirationTime The new max acceptable amount of time passed in seconds
     *
     * Emits an {FeeExpirationSet} event.
     */
    function setFeeExpiration(uint256 _feeExpirationTime) external onlyOwner {
        require(_feeExpirationTime > 0, "expiration = 0");
        // TODO: Uncomment the following in production.
        // require(_feeExpirationTime <= 24 hours, "expiration > 24hs");
        feeExpirationTime = _feeExpirationTime;
        emit FeeExpirationSet(_feeExpirationTime);
    }

    /**
     * @notice Function that allows admins to change the percentage of lender, platform and borrowers fees
     *
     * @param _platformFees Percentage of fees that each participant will receive once a loan is accepted
     *
     * Emits an {PlatformFeesSet} event.
     */
    function setPlatformFees(
        PlatformFees memory _platformFees
    ) public onlyOwner {
        require(
            _platformFees.lenderPercentage +
                (_platformFees.borrowerPercentage) +
                (_platformFees.platformPercentage) ==
                100,
            "fees do not add up to 100%"
        );
        require(_platformFees.lenderPercentage > 0, "lender fee < 1%");
        require(_platformFees.borrowerPercentage > 0, "borrower fee < 1%");
        require(_platformFees.platformPercentage > 0, "platform fee < 1%");

        platformFees.lenderPercentage = _platformFees.lenderPercentage;
        platformFees.borrowerPercentage = _platformFees.borrowerPercentage;
        platformFees.platformPercentage = _platformFees.platformPercentage;

        emit PlatformFeesSet(platformFees);
    }

    /**
     * @notice Function that returns loan origination fee
     */
    function getLoanOriginationFees() external view returns (uint256) {
        return loanOriginationFeePercentage;
    }

    /**
     * @notice Function that allows admins to change the percentage of lender, platform and borrowers' fees
     *
     * @param _loanOriginationFees Percentage of fees that the lender will receive in tokens once an offer is accepted.
     * Maximum value is 10%.
     *
     * Emits an {LoanOriginationFeesSet} event.
     */
    function setLoanOriginationFees(
        uint256 _loanOriginationFees
    ) external onlyOwner {
        require(_loanOriginationFees <= 10, "fee > 10%");
        loanOriginationFeePercentage = _loanOriginationFees;

        emit LoanOriginationFeesSet(_loanOriginationFees);
    }

    /**
     * @notice Function that returns whether a nonce has been used by a user or not
     */
    function isValidNonce(uint256 nonce) external view returns (bool) {
        return !nonceHasBeenUsedForUser[msg.sender][nonce];
    }

    /**
     * @notice Creates a new liquidity shop
     * @param _name The name of this liquidity shop
     * @param _erc20 The ERC20 that will be accepted for loans in this liquidity shop
     * @param _nftCollection The NFT contract address that will be accepted as collateral for loans in this liquidity shop
     * @param _liquidityAmount The initial balance of this liquidity shop
     * @param _interestA The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration A; e.g. `15` means 15%, and so on
     * @param _interestB The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration B
     * @param _interestC The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration C
     * @param _maxOffer The max offer for this collection set by its owner in tokens in the same currency used in this liquidity shop
     * @param _automaticApproval Whether or not this liquidity shop will accept offers automatically
     * @param _allowRefinancingTerms Whether or not this liquidity shop will accept refinancing terms. NOTE: Not currently implemented
     * @dev Emits an `LiquidityShopCreated` event.
     */
    function createLiquidityShop(
        string calldata _name,
        address _erc20,
        address _nftCollection,
        uint256 _liquidityAmount,
        uint256 _interestA,
        uint256 _interestB,
        uint256 _interestC,
        uint256 _maxOffer,
        bool _automaticApproval,
        bool _allowRefinancingTerms
    ) external override whenNotPaused nonReentrant {
        require(erc20s[_erc20].allowed, "unallowed erc20");
        require(
            erc20s[_erc20].minimumBasketSize <= _liquidityAmount,
            "amount < min basket size"
        );
        require(nfts[_nftCollection].allowed, "unallowed nft");
        require(bytes(_name).length > 0, "empty shop name");
        require(_maxOffer > 0, "max offer = 0");
        require(_interestA > 0, "interestA = 0");
        require(_interestB > 0, "interestB = 0");
        require(_interestC > 0, "interestC = 0");

        shopIdCounter.increment();
        uint256 liquidityShopId = shopIdCounter.current();

        LiquidityShop memory newLiquidityShop = LiquidityShop({
            erc20: _erc20,
            nftCollection: _nftCollection,
            owner: msg.sender,
            interestA: _interestA,
            interestB: _interestB,
            interestC: _interestC,
            maxOffer: _maxOffer,
            balance: _liquidityAmount,
            automaticApproval: _automaticApproval,
            allowRefinancingTerms: _allowRefinancingTerms,
            status: LiquidityShopStatus.ACTIVE,
            name: _name
        });
        liquidityShops[liquidityShopId] = newLiquidityShop;

        emit LiquidityShopCreated(
            newLiquidityShop.owner,
            newLiquidityShop.erc20,
            newLiquidityShop.nftCollection,
            newLiquidityShop.interestA,
            newLiquidityShop.interestB,
            newLiquidityShop.interestC,
            newLiquidityShop.maxOffer,
            newLiquidityShop.balance,
            liquidityShopId,
            newLiquidityShop.name,
            newLiquidityShop.automaticApproval,
            newLiquidityShop.allowRefinancingTerms
        );

        IERC20Upgradeable(_erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _liquidityAmount
        );
    }

    /**
     * @notice This function is called to add liquidity to a shop
     * @param _id The id of the liquidity shop
     * @param _amount The balance to be transferred
     *
     * Emits an {LiquidityAddedToShop} event.
     */
    function addLiquidityToShop(
        uint256 _id,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        require(_amount > 0, "amount = 0");

        LiquidityShop storage liquidityShop = liquidityShops[_id];

        require(liquidityShop.owner != address(0), "invalid shop id");
        require(liquidityShop.owner == msg.sender, "caller is not owner");

        liquidityShop.balance = liquidityShop.balance + (_amount);

        emit LiquidityAddedToShop(
            liquidityShop.owner,
            _id,
            liquidityShop.balance,
            _amount
        );

        IERC20Upgradeable(liquidityShop.erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
    }

    /**
     * @notice This function is called to cash out a liquidity shop
     * @param _id The id of the liquidity shop to be cashout
     *
     * Emits an {LiquidityShopCashOut} event.
     */
    function liquidityShopCashOut(
        uint256 _id
    ) external override whenNotPaused nonReentrant {
        LiquidityShop storage liquidityShop = liquidityShops[_id];

        require(liquidityShop.owner != address(0), "invalid shop id");
        require(msg.sender == liquidityShop.owner, "caller is not owner");
        require(liquidityShop.balance > 0, "shop balance = 0");

        uint256 cashoutAmount = liquidityShop.balance;
        liquidityShop.balance = 0;

        emit LiquidityShopCashOut(liquidityShop.owner, _id, cashoutAmount);

        IERC20Upgradeable(liquidityShop.erc20).safeTransfer(
            liquidityShop.owner,
            cashoutAmount
        );
    }

    /**
     * @notice This function can be called by the liquidity shop owner in order to freeze it
     * @param _id ID of the liquidity shop to be frozen
     *
     * Emits an {LiquidityShopFrozen} event.
     */
    function freezeLiquidityShop(uint256 _id) external override whenNotPaused {
        LiquidityShop storage liquidityShop = liquidityShops[_id];

        require(liquidityShop.owner != address(0), "invalid shop id");
        require(msg.sender == liquidityShop.owner, "caller is not owner");
        require(
            liquidityShop.status == LiquidityShopStatus.ACTIVE,
            "shop not active"
        );

        liquidityShop.status = LiquidityShopStatus.FROZEN;

        emit LiquidityShopFrozen(
            liquidityShop.owner,
            _id,
            liquidityShop.balance
        );
    }

    /**
     * @notice This function can be called by the liquidity shop owner in order to unfreeze it
     * @param _id ID of the liquidity shop to be unfrozen
     *
     * Emits an {LiquidityShopUnfrozen} event.
     */
    function unfreezeLiquidityShop(
        uint256 _id
    ) external override whenNotPaused {
        LiquidityShop storage liquidityShop = liquidityShops[_id];

        require(liquidityShop.owner != address(0), "invalid shop id");
        require(msg.sender == liquidityShop.owner, "caller is not owner");
        require(
            liquidityShop.status == LiquidityShopStatus.FROZEN,
            "shop not frozen"
        );

        liquidityShop.status = LiquidityShopStatus.ACTIVE;

        emit LiquidityShopUnfrozen(
            liquidityShop.owner,
            _id,
            liquidityShop.balance
        );
    }

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _nftyNotesId ID of the nftyNotesId associated to a loan
     *
     * Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateOverdueLoan(
        uint256 _nftyNotesId
    ) external override whenNotPaused nonReentrant {
        require(
            NFTYNotes(promissoryNoteToken).exists(_nftyNotesId),
            "invalid promissory note"
        );

        (address loanCoordinator, uint256 loanId) = NFTYNotes(
            promissoryNoteToken
        ).notes(_nftyNotesId);
        require(address(this) == loanCoordinator, "not loan coordinator");

        Loan storage loan = loans[loanId];

        require(loan.liquidityShopId > 0, "non-existent loan");
        require(loan.status == LoanStatus.ACTIVE, "loan not active");
        require(
            loan.nftyNotesId == _nftyNotesId,
            "loan does not match NFTYNote"
        );
        require(
            NFTYNotes(promissoryNoteToken).ownerOf(_nftyNotesId) == msg.sender,
            "not promissory note owner"
        );

        uint256 loanDurationInDays = loan.duration * (1 days);
        require(
            block.timestamp >= loan.startTime + (loanDurationInDays),
            "loan not yet expired"
        );

        loan.status = LoanStatus.RESOLVED;

        uint256 borrowerFees = (loan.fee *
            (loan.platformFees.borrowerPercentage)) / (100);
        platformBalance += borrowerFees;

        emit LiquidatedOverdueLoan(
            msg.sender,
            loan.liquidityShopId,
            loanId,
            _nftyNotesId,
            loan.nftCollateralId
        );

        IERC721(liquidityShops[loan.liquidityShopId].nftCollection)
            .safeTransferFrom(address(this), msg.sender, loan.nftCollateralId);

        // burn both promissory note and obligation receipt
        NFTYNotes(promissoryNoteToken).burn(_nftyNotesId);
        if (NFTYNotes(obligationReceiptToken).exists(_nftyNotesId)) {
            NFTYNotes(obligationReceiptToken).burn(_nftyNotesId);
        }
    }

    /**
     * @notice Function reused for both accept offer for lender and create loan for borrower.
     * It performs some validation checks, transfer the NFT, fees and amount to the corresponding part, creates and stores the loan
     * and emits the OfferAccepted event.
     *
     * @param _offer The offer made by the borrower
     * @param _borrower The address of the borrower
     *
     * Emits an {OfferAccepted} event.
     */
    function _acceptOffer(Offer memory _offer, address _borrower) internal {
        LiquidityShop storage liquidityShop = liquidityShops[_offer.shopId];
        require(liquidityShop.owner != address(0), "invalid shop id");

        require(
            liquidityShop.status == LiquidityShopStatus.ACTIVE,
            "shop must be active"
        );
        require(_offer.loanDuration != 0, "loan duration = 0");

        uint256 shopInterest = 0;
        if (_offer.loanDuration == 30) {
            shopInterest = liquidityShop.interestA;
        } else if (_offer.loanDuration == 60) {
            shopInterest = liquidityShop.interestB;
        } else if (_offer.loanDuration == 90) {
            shopInterest = liquidityShop.interestC;
        } else {
            revert("unallowed loan duration");
        }

        require(
            _offer.amount <= liquidityShop.balance,
            "insufficient shop balance"
        );

        require(_offer.amount > 0, "amount = 0");
        require(_offer.amount <= liquidityShop.maxOffer, "amount > max offer");

        uint256 feesToSend = getOfferFees(_offer.amount, liquidityShop.erc20);

        loanIdCounter.increment();

        uint64 nftyNotesId = uint64(
            uint256(
                keccak256(
                    abi.encodePacked(address(this), loanIdCounter.current())
                )
            )
        );

        uint256 borrowerFees = (feesToSend *
            (platformFees.borrowerPercentage)) / (100);
        uint256 escrowFees = (feesToSend * (platformFees.platformPercentage)) /
            (100);
        uint256 lenderFees = (feesToSend * (platformFees.lenderPercentage)) /
            (100);
        uint256 interest = (_offer.amount * (shopInterest)) / (100);

        liquidityShop.balance = liquidityShop.balance - (_offer.amount);
        platformBalance += escrowFees;

        // Using helper function to avoid `Stack too deep` error
        _storeLoan(
            loanIdCounter.current(),
            _offer,
            interest,
            nftyNotesId,
            feesToSend
        );

        emit OfferAccepted(
            liquidityShop.owner,
            _borrower,
            _offer.shopId,
            loanIdCounter.current(),
            nftyNotesId
        );

        NFTYNotes(promissoryNoteToken).mint(
            liquidityShop.owner,
            nftyNotesId,
            abi.encode(loanIdCounter.current())
        );

        NFTYNotes(obligationReceiptToken).mint(
            _borrower,
            nftyNotesId,
            abi.encode(loanIdCounter.current())
        );

        // transfer Nft to escrow
        IERC721(liquidityShop.nftCollection).safeTransferFrom(
            _borrower,
            address(this),
            _offer.nftCollateralId
        );

        // transfer lender fees to lender
        IERC20Upgradeable(nftyTokenContract).safeTransferFrom(
            _borrower,
            liquidityShop.owner,
            lenderFees
        );

        // transfer borrower and platform fees to escrow
        IERC20Upgradeable(nftyTokenContract).safeTransferFrom(
            _borrower,
            address(this),
            borrowerFees + (escrowFees)
        );

        // transfer amount to borrower
        IERC20Upgradeable(liquidityShop.erc20).safeTransfer(
            _borrower,
            _offer.amount
        );
    }

    /**
     * @notice Helper function to store loan information on the contract
     *
     * @param _id The ID used to store the loan in the contract state
     * @param _offer The offer made by the borrower
     * @param _interest The interest percentage that the borrower has to pay
     * @param _nftyNotesId The id of the nftyNotes related to this loan
     * @param _fees The fees that the borrower has to pay
     */
    function _storeLoan(
        uint256 _id,
        Offer memory _offer,
        uint256 _interest,
        uint64 _nftyNotesId,
        uint256 _fees
    ) internal {
        Loan memory newLoan = Loan({
            amount: _offer.amount,
            remainder: _offer.amount + (_interest),
            duration: _offer.loanDuration,
            startTime: block.timestamp,
            nftCollateralId: _offer.nftCollateralId,
            fee: _fees,
            status: LoanStatus.ACTIVE,
            liquidityShopId: _offer.shopId,
            nftyNotesId: _nftyNotesId,
            platformFees: PlatformFees({
                lenderPercentage: platformFees.lenderPercentage,
                platformPercentage: platformFees.platformPercentage,
                borrowerPercentage: platformFees.borrowerPercentage
            })
        });

        loans[_id] = newLoan;
    }

    /**
     * @notice Helper function to calculate fees to pay based on a loan.
     * Fees are calculated based on the ERC20/NFTY token conversion, plus the loan origination fee and amount.
     *
     * @param amount loan amount, in erc20 tokens.
     * @param currency token contract address used for the loan.
     */
    function getOfferFees(
        uint256 amount,
        address currency
    ) public view returns (uint256) {
        (uint256 nftyToUSD, bool nftyInTime) = getPriceIfNotOlderThan(
            string(
                abi.encodePacked(
                    IERC20Metadata(nftyTokenContract).symbol(),
                    "/USD"
                )
            ),
            uint128(feeExpirationTime)
        );
        require(nftyToUSD != 0, "missing NFTY price");
        require(nftyInTime, "NFTY price too old");

        (uint256 erc20ToUSD, bool erc20InTime) = getPriceIfNotOlderThan(
            string(abi.encodePacked(IERC20Metadata(currency).symbol(), "/USD")),
            uint128(feeExpirationTime)
        );
        require(erc20ToUSD != 0, "missing ERC20 price");
        require(erc20InTime, "ERC20 price too old");

        return
            ((amount * (erc20ToUSD)) *
                (loanOriginationFeePercentage) *
                (10 ** 18)) /
            (10 ** (IERC20Metadata(currency).decimals()) * (nftyToUSD) * (100));
    }

    /**
     * @notice This function can be called by a borrower to create a loan for shops that accepts it automatically
     *
     * @param _offer The offer made by the borrower
     */
    function createLoan(
        Offer memory _offer
    ) external override whenNotPaused nonReentrant {
        LiquidityShop memory liquidityShop = liquidityShops[_offer.shopId];

        require(
            liquidityShop.automaticApproval,
            "automatic approval not accepted"
        );
        _acceptOffer(_offer, msg.sender);
    }

    /**
     * @notice This function can be called liquidity shop owner to accept offers made by borrowers
     *
     * @param _offer The offer made by the borrower
     * @param _signature The components of the borrower signature
     */
    function acceptOffer(
        Offer memory _offer,
        Signature memory _signature
    ) external override whenNotPaused nonReentrant {
        LiquidityShop memory liquidityShop = liquidityShops[_offer.shopId];

        require(msg.sender == liquidityShop.owner, "caller is not shop owner");

        require(validateSignature(_signature, _offer), "invalid signature");

        require(
            !nonceHasBeenUsedForUser[_signature.signer][_signature.nonce],
            "nonce invalid"
        );

        nonceHasBeenUsedForUser[_signature.signer][_signature.nonce] = true;

        _acceptOffer(_offer, _signature.signer);
    }

    /**
     * @notice This function is used to validate a signature
     *
     * @param _signature The signature struct containing:
     * - signer: The address of the signer. The borrower address for `acceptOffer`
     * - nonce: It can be any uint256 value that the user has not previously used to sign an
     * off-chain offer. Each nonce can be used at most once per user within this contract
     * - expiry: Date when the signature expires
     * - signature: The ECDSA signature of the borrower, obtained off-chain ahead of time, signing the following
     * combination of parameters:
     * - Offer.shopId
     * - Offer.nftCollateralId
     * - Offer.loanDuration
     * - Offer.amount
     * - Signature.signer
     * - Signature.nonce
     * - Signature.expiry
     * - chainId
     * @param _offer The offer struct containing:
     * - Offer.shopId: ID of the shop related to this offer
     * - Offer.nftCollateralId: ID of the NFT to be used as collateral
     * - Offer.loanDuration: Loan duration in days
     * - Offer.amount: Amount asked on this loan in the same currency of the liquidity shop
     */
    function validateSignature(
        Signature memory _signature,
        Offer memory _offer
    ) private view returns (bool) {
        require(block.timestamp <= _signature.expiry, "signature has expired");
        if (_signature.signer == address(0)) {
            return false;
        } else {
            // Encode offer to validate signature
            bytes memory offerHash = abi.encodePacked(
                _offer.shopId,
                _offer.nftCollateralId,
                _offer.loanDuration,
                _offer.amount
            );

            // Encode signature parameters to validate it
            bytes memory signatureHash = abi.encodePacked(
                _signature.signer,
                _signature.nonce,
                _signature.expiry
            );

            bytes32 messagehash = keccak256(
                abi.encodePacked(offerHash, signatureHash, block.chainid)
            );

            return
                SignatureChecker.isValidSignatureNow(
                    _signature.signer,
                    ECDSA.toEthSignedMessageHash(messagehash),
                    _signature.signature
                );
        }
    }

    /**
     * @notice This function can be called by the obligation receipt holder to pay a loan and get the collateral back
     * @param _nftyNotesId ID of the nftyNotesId associated to a loan
     * @param _amount The amount to be paid, in erc20 tokens
     *
     * Emits an {PaidBackLoan} event.
     */
    function payBackLoan(
        uint256 _nftyNotesId,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        require(
            NFTYNotes(obligationReceiptToken).exists(_nftyNotesId),
            "invalid obligation receipt"
        );
        require(
            NFTYNotes(promissoryNoteToken).exists(_nftyNotesId),
            "invalid promissory note"
        );

        uint256 loanIdObligationReceipt;
        uint256 loanIdPromissoryNote;
        address loanCoordinator;

        (loanCoordinator, loanIdObligationReceipt) = NFTYNotes(
            obligationReceiptToken
        ).notes(_nftyNotesId);
        require(address(this) == loanCoordinator, "not loan coordinator");
        (loanCoordinator, loanIdPromissoryNote) = NFTYNotes(promissoryNoteToken)
            .notes(_nftyNotesId);
        require(address(this) == loanCoordinator, "not loan coordinator");
        require(
            loanIdObligationReceipt == loanIdPromissoryNote,
            "loan id mismatch"
        );

        Loan storage loan = loans[loanIdObligationReceipt];
        require(loan.liquidityShopId > 0, "non-existent loan");
        require(loan.status == LoanStatus.ACTIVE, "loan not active");
        require(
            loan.nftyNotesId == _nftyNotesId,
            "loan does not match NFTYNote"
        );

        address obligationReceiptHolder = NFTYNotes(obligationReceiptToken)
            .ownerOf(loan.nftyNotesId);
        address promissoryNoteHolder = NFTYNotes(promissoryNoteToken).ownerOf(
            loan.nftyNotesId
        );

        require(
            obligationReceiptHolder == msg.sender,
            "not obligation receipt owner"
        );

        uint256 loanDurationInSeconds = loan.duration * (1 days);
        require(
            block.timestamp <= loan.startTime + (loanDurationInSeconds),
            "loan has expired"
        );

        LiquidityShop memory liquidityShop = liquidityShops[
            loan.liquidityShopId
        ];

        require(loan.remainder >= _amount, "payment amount > debt");

        if (
            loan.remainder >= erc20s[liquidityShop.erc20].minimumPaymentAmount
        ) {
            require(
                _amount >= erc20s[liquidityShop.erc20].minimumPaymentAmount,
                "insufficient payment amount"
            );
        } else {
            require(_amount == loan.remainder, "insufficient payment amount");
        }

        loan.remainder = loan.remainder - (_amount);

        emit PaymentMade(
            obligationReceiptHolder,
            promissoryNoteHolder,
            loanIdObligationReceipt,
            _amount,
            loan.remainder
        );

        if (loan.remainder == 0) {
            loan.status = LoanStatus.RESOLVED;

            // calculate and send fees to obligation receipt holder
            uint256 borrowerFees = (loan.fee *
                (loan.platformFees.borrowerPercentage)) / (100);
            uint256 interest = 0;
            if (loan.duration == 30) {
                interest = (loan.amount * (liquidityShop.interestA)) / (100);
            } else if (loan.duration == 60) {
                interest = (loan.amount * (liquidityShop.interestB)) / (100);
            } else if (loan.duration == 90) {
                interest = (loan.amount * (liquidityShop.interestC)) / (100);
            }
            uint256 payBackAmount = loan.amount + (interest);

            emit PaidBackLoan(
                obligationReceiptHolder,
                promissoryNoteHolder,
                loan.liquidityShopId,
                loanIdObligationReceipt,
                payBackAmount,
                borrowerFees,
                loan.nftyNotesId,
                loan.nftCollateralId
            );

            IERC20Upgradeable(nftyTokenContract).safeTransfer(
                obligationReceiptHolder,
                borrowerFees
            );

            // send NFT collateral to obligation receipt holder
            IERC721(liquidityShop.nftCollection).safeTransferFrom(
                address(this),
                obligationReceiptHolder,
                loan.nftCollateralId
            );

            // burn both promissory note and obligation receipt
            NFTYNotes(obligationReceiptToken).burn(loan.nftyNotesId);
            NFTYNotes(promissoryNoteToken).burn(loan.nftyNotesId);
        }

        IERC20Upgradeable(liquidityShop.erc20).safeTransferFrom(
            msg.sender,
            promissoryNoteHolder,
            _amount
        );
    }

    /**
     * @notice This function can be called by an owner to withdraw collected platform funds.
     * The funds consists of all platform fees generated at the time of loan creation,
     * in addition to collected borrower fees for liquidated loans which were not paid back.
     * @param _receiver the address that will receive the platform fees that can be withdrawn at the time
     *
     */
    function withdrawPlatformFees(
        address _receiver
    ) external onlyOwner nonReentrant {
        uint256 amount = platformBalance;
        require(amount > 0, "collected platform fees = 0");
        require(_receiver != address(0), "invalid receiver");

        platformBalance = 0;

        IERC20Upgradeable(nftyTokenContract).safeTransfer(_receiver, amount);
    }
}
