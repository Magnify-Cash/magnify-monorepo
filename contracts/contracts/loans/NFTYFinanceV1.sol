// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "../interfaces/INFTYFinanceV1.sol";
import "../interfaces/IERC721MintableBurnable.sol";

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

contract NFTYFinanceV1 is
    INFTYFinanceV1,
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

    /**
     * @notice Unique identifier for lending desks
     */
    Counters.Counter private lendingDeskIdCounter;
    /**
     * @notice Unique identifier for loans
     */
    Counters.Counter private loanIdCounter;

    /**
     * @notice Mapping to store lending desks
     */
    mapping(uint256 => LendingDesk) public lendingDesks;

    /**
     * @notice Mapping to store loans on this contract
     */
    mapping(uint256 => Loan) public loans;

    /**
     * @notice The address of the ERC721 to generate promissory notes for lenders
     */
    address public promissoryNote;

    /**
     * @notice The address of the ERC721 to generate obligation notes for borrowers
     */
    address public obligationNote;

    /**
     * @notice The address of the lending desk ownership ERC721
     */
    address public lendingKeys;

    /**
     * @notice The percentage of fees that the borrower will pay for each loan
     */
    uint256 public loanOriginationFee;

    /**
     * @notice The amount of platform fees per token that can be withdrawn by an admin
     */
    mapping(address => uint256) public platformFees;

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
     * @param _obligationNote Obligation receipt ERC721 address
     */
    function initialize(
        address _promissoryNote,
        address _obligationNote,
        address _lendingKeys,
        uint256 _loanOriginationFee
    ) public initializer {
        __Ownable_init();
        __Pausable_init();

        require(_promissoryNote != address(0), "promissory note is zero addr");
        promissoryNote = _promissoryNote;

        require(
            _obligationNote != address(0),
            "obligation receipt is zero addr"
        );
        obligationNote = _obligationNote;

        require(_lendingKeys != address(0), "shop key is zero addr");
        lendingKeys = _lendingKeys;

        // Set loan origination fee
        setLoanOriginationFee(_loanOriginationFee);
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
     * @notice Event that will be emitted every time an admin updates protocol parameters
     *
     * @param loanOriginationFee The percentage of fees in tokens that the borrower will have to pay for a loan
     */
    event LoanOriginationFeeSet(uint256 loanOriginationFee);

    /**
     * @notice This function allows the admin of the contract to modify loan origination fee.
     *
     * @param _loanOriginationFee Percentage fee the borrower will have to pay to the platform when borrowing loan
     * Emits an {LoanOriginationFeeSet} event.
     */
    function setLoanOriginationFee(
        uint256 _loanOriginationFee
    ) public onlyOwner {
        // Set loan origination fees
        require(_loanOriginationFee <= 10, "fee > 10%");
        loanOriginationFee = _loanOriginationFee;

        emit LoanOriginationFeeSet(_loanOriginationFee);
    }

    /**
     * @notice Event that will be emitted every time a lending desk is created
     * @param owner The address of the owner of the created liquidity shop
     * @param erc20 The ERC20 allowed as currency on the liquidity shop
     * @param id A unique liquidity shop ID
     */
    event NewLendingDeskInitialized(
        address indexed owner,
        address indexed erc20,
        uint256 id
    );

    /**
     * @notice Creates a new liquidity shop
     * @param _erc20 The ERC20 that will be accepted for loans in this liquidity shop
     * @param _depositAmount The initial balance of this liquidity shop
     * @param _loanConfigs Loan config for each NFT collection this shop will support
     * @dev Emits an `NewLendingDeskInitialized` event.
     */
    function initializeNewLendingDesk(
        address _erc20,
        uint256 _depositAmount,
        LoanConfig[] calldata _loanConfigs
    ) external whenNotPaused nonReentrant {
        require(_erc20 != address(0), "invalid erc20");

        lendingDeskIdCounter.increment();
        uint256 lendingDeskId = lendingDeskIdCounter.current();

        LendingDesk storage lendingDesk = lendingDesks[lendingDeskId];
        lendingDesk.erc20 = _erc20;
        lendingDesk.status = LendingDeskStatus.Active;

        emit NewLendingDeskInitialized(
            msg.sender,
            lendingDesk.erc20,
            lendingDeskId
        );

        // mint shop ownership NFT
        IERC721MintableBurnable(lendingKeys).mint(msg.sender, lendingDeskId);

        // add loan configs
        for (uint i = 0; i < _loanConfigs.length; i++) {
            setLendingDeskLoanConfig(
                lendingDeskId,
                _loanConfigs[i].nftCollection,
                _loanConfigs[i]
            );
        }

        // add liquidity
        depositLendingDeskLiquidity(lendingDeskId, _depositAmount);
    }

    event LendingDeskLoanConfigSet(
        uint256 shopId,
        address nftCollection,
        LoanConfig loanConfig
    );

    function setLendingDeskLoanConfig(
        uint256 _shopId,
        address _nftCollection,
        LoanConfig calldata _loanConfig
    ) public override whenNotPaused nonReentrant {
        LendingDesk storage lendingDesk = lendingDesks[_shopId];

        require(lendingDesk.erc20 != address(0), "invalid shop id");
        require(
            IERC721MintableBurnable(lendingKeys).ownerOf(_shopId) == msg.sender,
            "not shop owner"
        );

        require(_loanConfig.minAmount > 0, "min amount = 0");
        require(_loanConfig.maxAmount > 0, "max amount = 0");
        require(_loanConfig.minInterest > 0, "min interest = 0");
        require(_loanConfig.maxInterest > 0, "max interest = 0");
        require(_loanConfig.minDuration > 0, "min duration = 0");
        require(_loanConfig.maxDuration > 0, "max duration = 0");

        if (_loanConfig.nftCollectionIsErc1155)
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

        lendingDesk.loanConfigs[_nftCollection] = _loanConfig;

        emit LendingDeskLoanConfigSet({
            shopId: _shopId,
            nftCollection: _nftCollection,
            loanConfig: _loanConfig
        });
    }

    event LendingDeskLoanConfigRemoved(uint256 shopId, address nftCollection);

    function removeLendingDeskLoanConfig(
        uint256 _shopId,
        address _nftCollection
    ) external override whenNotPaused nonReentrant {
        LendingDesk storage lendingDesk = lendingDesks[_shopId];

        require(lendingDesk.erc20 != address(0), "invalid shop id");
        require(
            lendingDesk.loanConfigs[_nftCollection].nftCollection != address(0),
            "shop does not support NFT collection"
        );

        delete lendingDesk.loanConfigs[_nftCollection];

        emit LendingDeskLoanConfigRemoved({
            shopId: _shopId,
            nftCollection: _nftCollection
        });
    }

    /**
     * @notice Event that will be emitted every time liquidity is added to a shop
     *
     * @param owner The address of the owner of the liquidity shop
     * @param id Identifier for the liquidity shop
     * @param balance Current balance for the liquidity shop
     * @param liquidityAdded Amount of liquidity added to the shop
     */
    event LendingDeskLiquidityAdded(
        address indexed owner,
        uint256 id,
        uint256 balance,
        uint256 liquidityAdded
    );

    /**
     * @notice This function is called to add liquidity to a shop
     * @param _lendingDeskId The id of the liquidity shop
     * @param _amount The balance to be transferred
     *
     * Emits an {LiquidityAddedToShop} event.
     */
    function depositLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) public override whenNotPaused nonReentrant {
        require(_amount > 0, "amount = 0");

        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];

        require(lendingDesk.erc20 != address(0), "invalid shop id");
        require(
            IERC721MintableBurnable(lendingKeys).ownerOf(_lendingDeskId) ==
                msg.sender,
            "not shop owner"
        );

        lendingDesk.balance = lendingDesk.balance + _amount;

        emit LendingDeskLiquidityAdded(
            msg.sender,
            _lendingDeskId,
            lendingDesk.balance,
            _amount
        );

        IERC20Upgradeable(lendingDesk.erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
    }

    /**
     * @notice Event that will be emitted every time there is a cash out on a liquidity shop
     *
     * @param owner The address of the owner of the liquidity shop
     * @param id Identifier for the liquidity shop
     * @param amount Amount withdrawn
     * @param balance New balance after cash out
     */
    event LendingDeskLiquidityWithdrawn(
        address indexed owner,
        uint256 id,
        uint256 amount,
        uint256 balance
    );

    /**
     * @notice This function is called to cash out a liquidity shop
     * @param _lendingDeskId The id of the liquidity shop to be cashout
     * @param _amount Amount to withdraw from the liquidity shop
     *
     * Emits an {LiquidityShopCashOut} event.
     */
    function withdrawLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];

        require(lendingDesk.erc20 != address(0), "invalid shop id");
        require(
            IERC721MintableBurnable(lendingKeys).ownerOf(_lendingDeskId) ==
                msg.sender,
            "not shop owner"
        );
        require(lendingDesk.balance > _amount, "insufficient shop balance");

        lendingDesk.balance = lendingDesk.balance - _amount;

        emit LendingDeskLiquidityWithdrawn(
            msg.sender,
            _lendingDeskId,
            _amount,
            lendingDesk.balance
        );

        IERC20Upgradeable(lendingDesk.erc20).safeTransfer(msg.sender, _amount);
    }

    /**
     * @notice Event that will be emitted every time a liquidity shop is frozen// unfrozen
     *
     * @param lendingDeskId The ID of the lending desk
     * @param freeze Whether frozen// unfrozen
     */
    event LendingDeskStateSet(uint256 lendingDeskId, bool freeze);

    /**
     * @notice This function can be called by the liquidity shop owner in order to freeze it
     * @param _lendingDeskId ID of the liquidity shop to be frozen
     * @param _freeze Whether to freeze or unfreeze
     *
     * Emits an {LiquidityShopFrozen} event.
     */
    function setLendingDeskState(
        uint256 _lendingDeskId,
        bool _freeze
    ) external override whenNotPaused {
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];

        require(lendingDesk.erc20 != address(0), "invalid shop id");
        require(
            IERC721MintableBurnable(lendingKeys).ownerOf(_lendingDeskId) ==
                msg.sender,
            "not shop owner"
        );

        if (_freeze) {
            require(
                lendingDesk.status == LendingDeskStatus.Active,
                "shop not active"
            );
            lendingDesk.status = LendingDeskStatus.Frozen;
        } else {
            require(
                lendingDesk.status == LendingDeskStatus.Active,
                "shop not frozen"
            );
            lendingDesk.status = LendingDeskStatus.Active;
        }

        emit LendingDeskStateSet(_lendingDeskId, _freeze);
    }

    /**
     * @notice Event that will be emitted when a lending desk is dissolved
     *
     * @param lendingDeskId The ID of the lending desk
     */
    event LendingDeskDissolved(uint256 lendingDeskId);

    function dissolveLendingDesk(
        uint256 _lendingDeskId
    ) external override whenNotPaused nonReentrant {
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];

        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            IERC721MintableBurnable(lendingKeys).ownerOf(_lendingDeskId) ==
                msg.sender,
            "not lending desk owner"
        );

        lendingDesk.status = LendingDeskStatus.Dissolved;
        IERC721MintableBurnable(lendingKeys).burn(_lendingDeskId);

        emit LendingDeskDissolved(_lendingDeskId);
    }

    /**
     * @notice Event that will be emitted every time a loan is liquidated when the obligation receipt holder did not pay it back in time
     *
     * @param promissoryNoteOwner The address of the promissory note owner
     * @param liquidityShopId The unique identifier of the liquidity shop
     * @param loanId The unique identifier of the loan
     * @param nftCollateralId The collateral NFT ID that was sent to the promissory note holder
     */
    event DefaultedLoanLiquidated(
        address indexed promissoryNoteOwner,
        uint256 liquidityShopId,
        uint256 loanId,
        uint256 nftCollateralId
    );

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _loanId ID of the loan
     *
     * Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateDefaultedLoan(
        uint256 _loanId
    ) external override whenNotPaused nonReentrant {
        require(
            IERC721MintableBurnable(promissoryNote).exists(_loanId),
            "invalid promissory note"
        );

        Loan storage loan = loans[_loanId];

        require(loan.lendingDeskId > 0, "loan does not exist");
        require(loan.status == LoanStatus.Active, "loan not active");

        require(
            IERC721MintableBurnable(promissoryNote).ownerOf(_loanId) ==
                msg.sender,
            "not promissory note owner"
        );

        uint256 loanDurationInDays = loan.duration * (1 days);
        require(
            block.timestamp >= loan.startTime + (loanDurationInDays),
            "loan not yet expired"
        );

        loan.status = LoanStatus.Resolved;

        emit DefaultedLoanLiquidated(
            msg.sender,
            loan.lendingDeskId,
            _loanId,
            loan.nftId
        );

        if (loan.config.nftCollectionIsErc1155)
            IERC1155(loan.config.nftCollection).safeTransferFrom(
                address(this),
                msg.sender,
                loan.nftId,
                1,
                ""
            );
        else
            IERC721(loan.config.nftCollection).safeTransferFrom(
                address(this),
                msg.sender,
                loan.nftId
            );

        // burn both promissory note and obligation receipt
        IERC721MintableBurnable(promissoryNote).burn(_loanId);
        if (IERC721MintableBurnable(obligationNote).exists(_loanId))
            IERC721MintableBurnable(obligationNote).burn(_loanId);
    }

    /**
     * @notice Event that will be emitted every time a new offer is accepted
     *
     * @param lender The address of the owner
     * @param borrower The address of the borrower
     * @param lendingDeskId A unique identifier that determines the liquidity shop to which this offer belongs
     * @param loanId A unique identifier for the loan created
     */
    event NewLoanInitialized(
        address indexed lender,
        address indexed borrower,
        uint256 lendingDeskId,
        uint256 loanId
    );

    /**
     * @notice This function can be called by a borrower to create a loan
     *
     * @param _lendingDeskId ID of the shop related to this offer
     * @param _nftCollection The NFT collection address to be used as collateral
     * @param _nftId ID of the NFT to be used as collateral
     * @param _duration Loan duration in days
     * @param _amount Amount to ask on this loan in ERC20
     */
    function initializeNewLoan(
        uint256 _lendingDeskId,
        address _nftCollection,
        uint256 _nftId,
        uint256 _duration,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];

        require(lendingDesk.erc20 != address(0), "invalid shop id");
        require(
            lendingDesk.status == LendingDeskStatus.Active,
            "shop must be active"
        );
        require(
            lendingDesk.loanConfigs[_nftCollection].nftCollection != address(0),
            "shop does not support NFT collection"
        );

        require(_amount <= lendingDesk.balance, "insufficient shop balance");

        require(
            _amount >= lendingDesk.loanConfigs[_nftCollection].minAmount,
            "amount < min amount"
        );
        require(
            _amount <= lendingDesk.loanConfigs[_nftCollection].maxAmount,
            "amount > max offer"
        );
        require(
            _duration >= lendingDesk.loanConfigs[_nftCollection].minDuration,
            "duration < min duration"
        );
        require(
            _duration <= lendingDesk.loanConfigs[_nftCollection].maxDuration,
            "duration > max duration"
        );

        uint fees = (loanOriginationFee * _amount) / 100;

        lendingDesk.balance = lendingDesk.balance - _amount;

        Loan memory loan = Loan({
            amount: _amount,
            amountPaidBack: 0,
            duration: _duration,
            startTime: block.timestamp,
            nftId: _nftId,
            status: LoanStatus.Active,
            lendingDeskId: _lendingDeskId,
            config: lendingDesk.loanConfigs[_nftCollection]
        });
        loans[loanIdCounter.current()] = loan;

        emit NewLoanInitialized(
            msg.sender,
            msg.sender,
            _lendingDeskId,
            loanIdCounter.current()
        );

        IERC721MintableBurnable(promissoryNote).mint(
            msg.sender,
            loanIdCounter.current()
        );

        IERC721MintableBurnable(obligationNote).mint(
            msg.sender,
            loanIdCounter.current()
        );

        // transfer Nft to escrow
        if (lendingDesk.loanConfigs[_nftCollection].nftCollectionIsErc1155)
            IERC1155(_nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftId,
                1,
                ""
            );
        else
            IERC721(_nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftId
            );

        // transfer amount minus fees to borrower
        IERC20Upgradeable(lendingDesk.erc20).safeTransfer(
            msg.sender,
            _amount - fees
        );
    }

    /**
     * @notice Event that will be emitted every time an obligation receipt holder pays back a loan
     *
     * @param obligationReceiptOwner The address of the owner of the obligation receipt, actor who pays back a loan
     * @param promissoryNoteOwner The address of the owner of the promissory note, actor who receives the payment loan fees
     * @param loanId The unique identifier of the loan
     * @param amount The amount of currency paid back to the promissory note holder
     * @param resolved Whether the loan is fully paid back or not
     *
     */
    event LoanPaymentMade(
        address indexed obligationReceiptOwner,
        address indexed promissoryNoteOwner,
        uint256 loanId,
        uint256 amount,
        bool resolved
    );

    /**
     * @notice This function can be called by the obligation receipt holder to pay a loan and get the collateral back
     * @param _loanId ID of the loan
     * @param _amount The amount to be paid, in erc20 tokens
     *
     * Emits an {LoanPaymentMade} event.
     */
    function makeLoanPayment(
        uint256 _loanId,
        uint256 _amount
    ) external override whenNotPaused nonReentrant {
        require(
            IERC721MintableBurnable(obligationNote).exists(_loanId),
            "invalid obligation receipt"
        );
        require(
            IERC721MintableBurnable(promissoryNote).exists(_loanId),
            "invalid promissory note"
        );

        Loan storage loan = loans[_loanId];
        require(loan.lendingDeskId > 0, "non-existent loan");
        require(loan.status == LoanStatus.Active, "loan not active");

        address obligationReceiptHolder = IERC721MintableBurnable(
            obligationNote
        ).ownerOf(_loanId);
        address promissoryNoteHolder = IERC721MintableBurnable(promissoryNote)
            .ownerOf(_loanId);

        require(
            obligationReceiptHolder == msg.sender,
            "not obligation receipt owner"
        );

        uint256 loanDurationInSeconds = loan.duration * (1 days);
        require(
            block.timestamp <= loan.startTime + (loanDurationInSeconds),
            "loan has expired"
        );

        LendingDesk storage lendingDesk = lendingDesks[loan.lendingDeskId];

        // calculate accumulated interest
        uint256 interest = loan.config.minInterest +
            (((loan.amount - loan.config.minAmount) /
                (loan.config.maxAmount - loan.config.minAmount)) *
                ((loan.duration - loan.config.minDuration) /
                    (loan.config.maxDuration - loan.config.minDuration))) *
            (loan.config.maxInterest - loan.config.minInterest);

        loan.amountPaidBack = loan.amountPaidBack + _amount;
        uint256 totalAmount = loan.amount + interest;

        require(totalAmount > loan.amountPaidBack, "payment amount > debt");

        emit LoanPaymentMade(
            obligationReceiptHolder,
            promissoryNoteHolder,
            _loanId,
            _amount,
            // loan is fully paid back
            totalAmount == loan.amountPaidBack
        );

        if (totalAmount == loan.amountPaidBack) {
            loan.status = LoanStatus.Resolved;

            // send NFT collateral to obligation receipt holder
            if (loan.config.nftCollectionIsErc1155)
                IERC1155(loan.config.nftCollection).safeTransferFrom(
                    address(this),
                    obligationReceiptHolder,
                    loan.nftId,
                    1,
                    ""
                );
            else
                IERC721(loan.config.nftCollection).safeTransferFrom(
                    address(this),
                    obligationReceiptHolder,
                    loan.nftId
                );

            // burn both promissory note and obligation receipt
            IERC721MintableBurnable(obligationNote).burn(_loanId);
            IERC721MintableBurnable(promissoryNote).burn(_loanId);
        }

        IERC20Upgradeable(lendingDesk.erc20).safeTransferFrom(
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

        uint256 amount = platformFees[_erc20];
        require(amount > 0, "collected platform fees = 0");

        platformFees[_erc20] = 0;

        IERC20Upgradeable(_erc20).safeTransfer(_receiver, amount);
    }
}
