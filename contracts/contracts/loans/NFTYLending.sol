// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "./NFTYNotes.sol";
import "./NFTYShopKey.sol";
import "../interfaces/INFTYLending.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract NFTYLending is
    INFTYLending,
    Initializable,
    OwnableUpgradeable,
    ERC721HolderUpgradeable,
    ERC1155HolderUpgradeable,
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
    Counters.Counter private liquidityShopIdCounter;
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
     * @notice The address of the ERC721 to generate promissory notes for lenders
     */
    address public promissoryNote;

    /**
     * @notice The address of the ERC721 to generate obligation receipts for borrowers
     */
    address public obligationReceipt;

    /**
     * @notice The address of the liquidity shop ownership ERC721
     */
    address public shopKey;

    /**
     * @notice The percentage of fees that the borrower will pay for each loan
     */
    uint256 public loanOriginationFee;

    /**
     * @notice The amount of platform fees per token that can be withdrawn by an admin
     */
    mapping(address => uint256) public platformBalance;

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
     */
    event LiquidityShopCreated(
        address indexed owner,
        address indexed erc20,
        address indexed nftCollection,
        bool nftCollectionIsErc1155,
        uint256 interestA,
        uint256 interestB,
        uint256 interestC,
        uint256 maxOffer,
        uint256 amount,
        uint256 id,
        string name
    );

    /**
     * @notice Event that will be emitted every time a liquidity shop is updated
     * @param id The liquidity shop ID
     * @param name The name of the liquidity shop
     * @param interestA The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration A; e.g. `15` means 15%, and so on
     * @param interestB The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration B
     * @param interestC The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration C
     * @param maxOffer The max offer set for the NFT collection, valued in the ERC20 tokens set for the liquidity shop
     */
    event LiquidityShopUpdated(
        uint256 id,
        string name,
        uint256 interestA,
        uint256 interestB,
        uint256 interestC,
        uint256 maxOffer
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
     * @param amount Amount withdrawn
     * @param balance New balance after cash out
     */
    event LiquidityShopCashedOut(
        address indexed owner,
        uint256 id,
        uint256 amount,
        uint256 balance
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
     */
    event OfferAccepted(
        address indexed lender,
        address indexed borrower,
        uint256 liquidityShopId,
        uint256 loanId
    );

    /**
     * @notice Event that will be emitted every time a loan is liquidated when the obligation receipt holder did not pay it back in time
     *
     * @param promissoryNoteOwner The address of the promissory note owner
     * @param liquidityShopId The unique identifier of the liquidity shop
     * @param loanId The unique identifier of the loan
     * @param nftCollateralId The collateral NFT ID that was sent to the promissory note holder
     */
    event LiquidatedOverdueLoan(
        address indexed promissoryNoteOwner,
        uint256 liquidityShopId,
        uint256 loanId,
        uint256 nftCollateralId
    );

    /**
     * @notice Event that will be emitted every time an obligation receipt holder pays back a loan
     *
     * @param obligationReceiptOwner The address of the owner of the obligation receipt, actor who pays back a loan
     * @param promissoryNoteOwner The address of the owner of the promissory note, actor who receives the payment loan fees
     * @param loanId The unique identifier of the loan
     * @param paidAmount The amount of currency paid back to the promissory note holder
     *
     */
    event PaymentMade(
        address indexed obligationReceiptOwner,
        address indexed promissoryNoteOwner,
        uint256 loanId,
        uint256 paidAmount
    );

    /**
     * @notice Event that will be emitted every time an obligation receipt holder fully pays back a loan
     *
     * @param obligationReceiptOwner The address of the owner of the obligation receipt, actor who pays back the loan and receives the collateral
     * @param promissoryNoteOwner The address of the owner of the promissory note, actor who receives the paid loan fees
     * @param liquidityShopId The unique identifier of the liquidity shop
     * @param loanId The unique identifier of the loan
     * @param paidAmount The total amount of currency paid back to the promissory note holder, including interests
     * @param nftCollateralId The collateral NFT ID that was sent to the obligation receipt holder
     */
    event PaidBackLoan(
        address indexed obligationReceiptOwner,
        address indexed promissoryNoteOwner,
        uint256 liquidityShopId,
        uint256 loanId,
        uint256 paidAmount,
        uint256 nftCollateralId
    );

    /**
     * @notice Event that will be emitted every time an admin updates protocol parameters
     *
     * @param loanOriginationFees The percentage of fees in tokens that the borrower will have to pay for a loan
     */
    event ProtocolParamsSet(uint256 loanOriginationFees);

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
     * @param _promissoryNote Promissory note ERC721 address
     * @param _obligationReceipt Obligation receipt ERC721 address
     */
    function initialize(
        address _promissoryNote,
        address _obligationReceipt,
        address _shopKey
    ) public initializer {
        __Ownable_init();
        __Pausable_init();

        require(_promissoryNote != address(0), "promissory note is zero addr");
        promissoryNote = _promissoryNote;

        require(
            _obligationReceipt != address(0),
            "obligation receipt is zero addr"
        );
        obligationReceipt = _obligationReceipt;

        require(_shopKey != address(0), "shop key is zero addr");
        shopKey = _shopKey;

        // Set default protocol params
        setProtocolParams(1);
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
     * @notice This function allows the admin of the contract to modify protocol level params.
     *
     * @param _loanOriginationFee Percentage of fees that the lender will receive in tokens once an offer is accepted.
     * Emits an {FeeExpirationSet} event.
     */
    function setProtocolParams(uint256 _loanOriginationFee) public onlyOwner {
        // Set loan origination fees
        require(_loanOriginationFee <= 10, "fee > 10%");
        loanOriginationFee = _loanOriginationFee;

        emit ProtocolParamsSet(_loanOriginationFee);
    }

    /**
     * @notice Creates a new liquidity shop
     * @param _name The name of this liquidity shop
     * @param _erc20 The ERC20 that will be accepted for loans in this liquidity shop
     * @param _nftCollection The NFT contract address that will be accepted as collateral for loans in this liquidity shop
     * @param _nftCollectionIsErc1155 Whether the NFT collection is an ERC1155 contract or ERC721 contract
     * @param _liquidityAmount The initial balance of this liquidity shop
     * @param _interestA The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration A; e.g. `15` means 15%, and so on
     * @param _interestB The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration B
     * @param _interestC The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration C
     * @param _maxOffer The max offer for this collection set by its owner in tokens in the same currency used in this liquidity shop
     * @dev Emits an `LiquidityShopCreated` event.
     */
    function createLiquidityShop(
        string calldata _name,
        address _erc20,
        address _nftCollection,
        bool _nftCollectionIsErc1155,
        uint256 _liquidityAmount,
        uint256 _interestA,
        uint256 _interestB,
        uint256 _interestC,
        uint256 _maxOffer
    ) external whenNotPaused nonReentrant {
        require(bytes(_name).length > 0, "empty shop name");
        require(_maxOffer > 0, "max offer = 0");
        require(_interestA > 0, "interestA = 0");
        require(_interestB > 0, "interestB = 0");
        require(_interestC > 0, "interestC = 0");
        require(_erc20 != address(0), "invalid erc20");
        require(_nftCollection != address(0), "invalid nft collection");

        if (_nftCollectionIsErc1155)
            require(
                ERC165Checker.supportsInterface(
                    _nftCollection,
                    type(IERC1155).interfaceId
                ),
                "invalid nft collection"
            );
        else
            require(
                ERC165Checker.supportsInterface(
                    _nftCollection,
                    type(IERC721).interfaceId
                ),
                "invalid nft collection"
            );

        liquidityShopIdCounter.increment();
        uint256 liquidityShopId = liquidityShopIdCounter.current();

        LiquidityShop memory newLiquidityShop = LiquidityShop({
            erc20: _erc20,
            nftCollection: _nftCollection,
            nftCollectionIsErc1155: _nftCollectionIsErc1155,
            interestA: _interestA,
            interestB: _interestB,
            interestC: _interestC,
            maxOffer: _maxOffer,
            balance: _liquidityAmount,
            status: LiquidityShopStatus.Active,
            name: _name
        });
        liquidityShops[liquidityShopId] = newLiquidityShop;

        // mint shop ownership NFT
        NFTYShopKey(shopKey).mint(msg.sender, liquidityShopId);

        emit LiquidityShopCreated(
            msg.sender,
            newLiquidityShop.erc20,
            newLiquidityShop.nftCollection,
            newLiquidityShop.nftCollectionIsErc1155,
            newLiquidityShop.interestA,
            newLiquidityShop.interestB,
            newLiquidityShop.interestC,
            newLiquidityShop.maxOffer,
            newLiquidityShop.balance,
            liquidityShopId,
            newLiquidityShop.name
        );

        IERC20Upgradeable(_erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _liquidityAmount
        );
    }

    /**
     * @notice Updates a liquidity shop
     * @param _id ID of the liquidity shop to be updated
     * @param _name The new name of the liquidity shop
     * @param _interestA The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration A; e.g. `15` means 15%, and so on
     * @param _interestB The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration B
     * @param _interestC The interest percentage that borrowers will pay when asking for loans for this liquidity shop that match loan duration C
     * @param _maxOffer The max offer for this collection set by its owner in tokens in the same currency used in this liquidity shop
     * @dev Emits an `LiquidityShopUpdated` event.
     */
    function updateLiquidityShop(
        uint256 _id,
        string calldata _name,
        uint256 _interestA,
        uint256 _interestB,
        uint256 _interestC,
        uint256 _maxOffer
    ) external override whenNotPaused nonReentrant {
        LiquidityShop storage liquidityShop = liquidityShops[_id];

        require(liquidityShop.erc20 != address(0), "invalid shop id");
        require(
            NFTYShopKey(shopKey).ownerOf(_id) == msg.sender,
            "not shop owner"
        );

        require(bytes(_name).length > 0, "empty shop name");
        require(_maxOffer > 0, "max offer = 0");
        require(_interestA > 0, "interestA = 0");
        require(_interestB > 0, "interestB = 0");
        require(_interestC > 0, "interestC = 0");

        liquidityShop.maxOffer = _maxOffer;
        liquidityShop.name = _name;
        liquidityShop.interestA = _interestA;
        liquidityShop.interestB = _interestB;
        liquidityShop.interestC = _interestC;

        emit LiquidityShopUpdated(
            _id,
            _name,
            _interestA,
            _interestB,
            _interestC,
            _maxOffer
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

        require(liquidityShop.erc20 != address(0), "invalid shop id");
        require(
            NFTYShopKey(shopKey).ownerOf(_id) == msg.sender,
            "not shop owner"
        );

        liquidityShop.balance = liquidityShop.balance + (_amount);

        emit LiquidityAddedToShop(
            msg.sender,
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
     * @param _amount Amount to withdraw from the liquidity shop
     *
     * Emits an {LiquidityShopCashOut} event.
     */
    function cashOutLiquidityShop(
        uint256 _id,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        LiquidityShop storage liquidityShop = liquidityShops[_id];

        require(liquidityShop.erc20 != address(0), "invalid shop id");
        require(
            NFTYShopKey(shopKey).ownerOf(_id) == msg.sender,
            "not shop owner"
        );
        require(liquidityShop.balance > _amount, "insufficient shop balance");

        liquidityShop.balance = liquidityShop.balance - _amount;

        emit LiquidityShopCashedOut(
            msg.sender,
            _id,
            _amount,
            liquidityShop.balance
        );

        IERC20Upgradeable(liquidityShop.erc20).safeTransfer(
            msg.sender,
            _amount
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

        require(liquidityShop.erc20 != address(0), "invalid shop id");
        require(
            NFTYShopKey(shopKey).ownerOf(_id) == msg.sender,
            "not shop owner"
        );
        require(
            liquidityShop.status == LiquidityShopStatus.Active,
            "shop not active"
        );

        liquidityShop.status = LiquidityShopStatus.Frozen;

        emit LiquidityShopFrozen(msg.sender, _id, liquidityShop.balance);
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

        require(liquidityShop.erc20 != address(0), "invalid shop id");
        require(
            NFTYShopKey(shopKey).ownerOf(_id) == msg.sender,
            "not shop owner"
        );
        require(
            liquidityShop.status == LiquidityShopStatus.Frozen,
            "shop not frozen"
        );

        liquidityShop.status = LiquidityShopStatus.Active;

        emit LiquidityShopUnfrozen(msg.sender, _id, liquidityShop.balance);
    }

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _loanId ID of the loan
     *
     * Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateOverdueLoan(
        uint256 _loanId
    ) external override whenNotPaused nonReentrant {
        require(
            NFTYNotes(promissoryNote).exists(_loanId),
            "invalid promissory note"
        );

        Loan storage loan = loans[_loanId];

        require(loan.liquidityShopId > 0, "loan does not exist");
        require(loan.status == LoanStatus.Active, "loan not active");

        require(
            NFTYNotes(promissoryNote).ownerOf(_loanId) == msg.sender,
            "not promissory note owner"
        );

        uint256 loanDurationInDays = loan.duration * (1 days);
        require(
            block.timestamp >= loan.startTime + (loanDurationInDays),
            "loan not yet expired"
        );

        loan.status = LoanStatus.Resolved;

        emit LiquidatedOverdueLoan(
            msg.sender,
            loan.liquidityShopId,
            _loanId,
            loan.nftCollateralId
        );

        LiquidityShop storage liquidityShop = liquidityShops[
            loan.liquidityShopId
        ];

        if (liquidityShop.nftCollectionIsErc1155)
            IERC1155(liquidityShop.nftCollection).safeTransferFrom(
                address(this),
                msg.sender,
                loan.nftCollateralId,
                1,
                ""
            );
        else
            IERC721(liquidityShop.nftCollection).safeTransferFrom(
                address(this),
                msg.sender,
                loan.nftCollateralId
            );

        // burn both promissory note and obligation receipt
        NFTYNotes(promissoryNote).burn(_loanId);
        if (NFTYNotes(obligationReceipt).exists(_loanId))
            NFTYNotes(obligationReceipt).burn(_loanId);
    }

    /**
     * @notice This function can be called by a borrower to create a loan
     *
     * @param _shopId ID of the shop related to this offer
     * @param _nftCollateralId ID of the NFT to be used as collateral
     * @param _duration Loan duration in days
     * @param _amount Amount to ask on this loan in ERC20
     */
    function createLoan(
        uint256 _shopId,
        uint256 _nftCollateralId,
        uint256 _duration,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        LiquidityShop memory liquidityShop = liquidityShops[_shopId];

        require(liquidityShop.erc20 != address(0), "invalid shop id");

        require(
            liquidityShop.status == LiquidityShopStatus.Active,
            "shop must be active"
        );
        require(_duration != 0, "loan duration = 0");

        uint256 shopInterest = 0;
        if (_duration == 30) {
            shopInterest = liquidityShop.interestA;
        } else if (_duration == 60) {
            shopInterest = liquidityShop.interestB;
        } else if (_duration == 90) {
            shopInterest = liquidityShop.interestC;
        } else {
            revert("unallowed loan duration");
        }

        require(_amount <= liquidityShop.balance, "insufficient shop balance");

        require(_amount > 0, "amount = 0");
        require(_amount <= liquidityShop.maxOffer, "amount > max offer");

        uint fees = (loanOriginationFee * _amount) / 100;

        liquidityShop.balance = liquidityShop.balance - _amount;

        Loan memory newLoan = Loan({
            amount: _amount,
            amountPaidBack: 0,
            duration: _duration,
            startTime: block.timestamp,
            nftCollateralId: _nftCollateralId,
            fee: fees,
            status: LoanStatus.Active,
            liquidityShopId: _shopId
        });
        loans[loanIdCounter.current()] = newLoan;

        emit OfferAccepted(
            msg.sender,
            msg.sender,
            _shopId,
            loanIdCounter.current()
        );

        NFTYNotes(promissoryNote).mint(msg.sender, loanIdCounter.current());

        NFTYNotes(obligationReceipt).mint(msg.sender, loanIdCounter.current());

        // transfer Nft to escrow
        if (liquidityShop.nftCollectionIsErc1155)
            IERC1155(liquidityShop.nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftCollateralId,
                1,
                ""
            );
        else
            IERC721(liquidityShop.nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftCollateralId
            );

        // transfer amount minus fees to borrower
        IERC20Upgradeable(liquidityShop.erc20).safeTransfer(
            msg.sender,
            _amount - fees
        );
    }

    /**
     * @notice This function can be called by the obligation receipt holder to pay a loan and get the collateral back
     * @param _loanId ID of the loan
     * @param _amount The amount to be paid, in erc20 tokens
     *
     * Emits an {PaidBackLoan} event.
     */
    function payBackLoan(
        uint256 _loanId,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        require(
            NFTYNotes(obligationReceipt).exists(_loanId),
            "invalid obligation receipt"
        );
        require(
            NFTYNotes(promissoryNote).exists(_loanId),
            "invalid promissory note"
        );

        Loan storage loan = loans[_loanId];
        require(loan.liquidityShopId > 0, "non-existent loan");
        require(loan.status == LoanStatus.Active, "loan not active");

        address obligationReceiptHolder = NFTYNotes(obligationReceipt).ownerOf(
            _loanId
        );
        address promissoryNoteHolder = NFTYNotes(promissoryNote).ownerOf(
            _loanId
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

        // calculate accumulated interest
        uint256 interest = 0;
        if (loan.duration == 30) {
            interest = (loan.amount * liquidityShop.interestA) / 100;
        } else if (loan.duration == 60) {
            interest = (loan.amount * liquidityShop.interestB) / 100;
        } else if (loan.duration == 90) {
            interest = (loan.amount * liquidityShop.interestC) / 100;
        }

        loan.amountPaidBack = loan.amountPaidBack + _amount;
        uint256 totalAmount = loan.amount + interest;

        require(totalAmount > loan.amountPaidBack, "payment amount > debt");

        emit PaymentMade(
            obligationReceiptHolder,
            promissoryNoteHolder,
            _loanId,
            _amount
        );

        if (totalAmount == loan.amountPaidBack) {
            loan.status = LoanStatus.Resolved;

            emit PaidBackLoan(
                obligationReceiptHolder,
                promissoryNoteHolder,
                loan.liquidityShopId,
                _loanId,
                _amount,
                loan.nftCollateralId
            );

            // send NFT collateral to obligation receipt holder
            if (liquidityShop.nftCollectionIsErc1155)
                IERC1155(liquidityShop.nftCollection).safeTransferFrom(
                    address(this),
                    obligationReceiptHolder,
                    loan.nftCollateralId,
                    1,
                    ""
                );
            else
                IERC721(liquidityShop.nftCollection).safeTransferFrom(
                    address(this),
                    obligationReceiptHolder,
                    loan.nftCollateralId
                );

            // burn both promissory note and obligation receipt
            NFTYNotes(obligationReceipt).burn(_loanId);
            NFTYNotes(promissoryNote).burn(_loanId);
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
        address _erc20,
        address _receiver
    ) external onlyOwner nonReentrant {
        require(_receiver != address(0), "invalid receiver");
        require(_erc20 != address(0), "invalid erc20");

        uint256 amount = platformBalance[_erc20];
        require(amount > 0, "collected platform fees = 0");

        platformBalance[_erc20] = 0;

        IERC20Upgradeable(_erc20).safeTransfer(_receiver, amount);
    }
}
