// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.22;

import "solady/src/auth/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {SafeCastLib} from "solady/src/utils/SafeCastLib.sol";

import "./interfaces/INFTYFinanceV1.sol";
import "./interfaces/INFTYERC721V1.sol";

contract NFTYFinanceV1 is
    INFTYFinanceV1,
    Ownable,
    Pausable,
    ERC721Holder,
    ERC1155Holder
{
    using SafeERC20 for IERC20;
    using SafeCastLib for uint256;

    /* *********** */
    /*   STORAGE   */
    /* *********** */
    /**
     * @notice Unique identifier for lending desks
     */
    uint256 public lendingDeskIdCounter;

    /**
     * @notice Unique identifier for loans
     */
    uint256 public loanIdCounter;

    /**
     * @notice Mapping to store lending desks
     */
    mapping(uint256 => LendingDesk) public lendingDesks;

    /**
     * @notice Mapping to store loan configs of lending desks
     */
    mapping(uint256 => mapping(address => LoanConfig))
        public lendingDeskLoanConfigs;

    /**
     * @notice Mapping to store loans
     */
    mapping(uint256 => Loan) public loans;

    /**
     * @notice The address of the ERC721 to generate promissory notes for lenders
     */
    address public immutable promissoryNotes;

    /**
     * @notice The address of the ERC721 to generate obligation notes for borrowers
     */
    address public immutable obligationNotes;

    /**
     * @notice The address of the lending desk ownership ERC721
     */
    address public immutable lendingKeys;

    /**
     * @notice The basis points of fees that the borrower will pay for each loan
     */
    uint256 public loanOriginationFee;

    /**
     * @notice The address of the platform wallet
     */
    address public platformWallet;

    // ERRORS
    error PromissoryNotesIsZeroAddr();
    error ObligationNotesIsZeroAddr();
    error LendingKeysIsZeroAddr();
    error ERC20IsZeroAddr();
    error InvalidLendingDeskId();
    error CallerIsNotLendingDeskOwner();
    error MinAmountIsZero();
    error MaxAmountIsLessThanMin();
    error MinInterestIsZero();
    error MaxInterestIsLessThanMin();
    error MinDurationIsZero();
    error MaxDurationIsLessThanMin();
    error InvalidInterest();
    error InvalidNFTCollection();
    error LendingDeskIsNotActive();
    error InsufficientLendingDeskBalance();
    error UnsupportedNFTCollection();
    error AmountIsZero();
    error LendingDeskIsNotFrozen();
    error InvalidLoanId();
    error LendingDeskIsNotEmpty();
    error LoanAmountTooLow();
    error LoanAmountTooHigh();
    error LoanDurationTooLow();
    error LoanDurationTooHigh();
    error LoanIsNotActive();
    error CallerIsNotBorrower();
    error CallerIsNotLender();
    error LoanHasNotDefaulted();
    error LoanHasDefaulted();
    error PlatformWalletIsZeroAddr();
    error LoanOriginationFeeMoreThan10Percent();
    error LoanMustBeActiveForMin1Hour();
    error LoanPaymentExceedsDebt();
    error InterestRateTooHigh();

    /* *********** */
    /*  EVENTS     */
    /* *********** */
    /**
     * @notice Event that will be emitted every time a lending desk is created
     *
     * @param lendingDeskId A unique lending desk ID
     * @param owner The address of the owner of the created lending desk
     * @param erc20 The ERC20 allowed as currency on the lending desk
     */
    event NewLendingDeskInitialized(
        uint256 lendingDeskId,
        address owner,
        address erc20,
        uint256 initialBalance
    );

    /**
     * @notice Event that will be emitted every time a lending desk config is created
     *
     * @param lendingDeskId Identifier for the lending desk
     * @param loanConfigs Loan config for each NFT collection this lending desk will support
     */
    event LendingDeskLoanConfigsSet(
        uint256 lendingDeskId,
        LoanConfig[] loanConfigs
    );

    /**
     * @notice Event that will be emitted every time a lending desk config is removed
     *
     * @param lendingDeskId Identifier for the lending desk
     * @param nftCollection Address for the NFT collection to remove supported config for
     */
    event LendingDeskLoanConfigRemoved(
        uint256 lendingDeskId,
        address nftCollection
    );

    /**
     * @notice Event that will be emitted every time liquidity is added to a lending desk
     *
     * @param lendingDeskId Identifier for the lending desk
     * @param amountDeposited Amount of liquidity added to the lending desk
     */
    event LendingDeskLiquidityDeposited(
        uint256 lendingDeskId,
        uint256 amountDeposited
    );

    /**
     * @notice Event that will be emitted every time there is a cash out on a lending desk
     *
     * @param lendingDeskId Identifier for the lending desk
     * @param amountWithdrawn Amount withdrawn
     */
    event LendingDeskLiquidityWithdrawn(
        uint256 lendingDeskId,
        uint256 amountWithdrawn
    );

    /**
     * @notice Event that will be emitted every time a lending desk is frozen// unfrozen
     *
     * @param lendingDeskId The ID of the lending desk
     * @param freeze Whether frozen// unfrozen
     */
    event LendingDeskStateSet(uint256 lendingDeskId, bool freeze);

    /**
     * @notice Event that will be emitted when a lending desk is dissolved
     *
     * @param lendingDeskId The ID of the lending desk
     */
    event LendingDeskDissolved(uint256 lendingDeskId);

    /**
     * @notice Event that will be emitted every time a new offer is accepted
     *
     * @param lendingDeskId A unique identifier that determines the lending desk to which this offer belongs
     * @param loanId A unique identifier for the loan created
     * @param borrower The address of the borrower
     */
    event NewLoanInitialized(
        uint256 lendingDeskId,
        uint256 loanId,
        address borrower,
        address nftCollection,
        uint256 nftId,
        uint256 amount,
        uint256 duration,
        uint256 interest,
        uint256 platformFee
    );

    /**
     * @notice Event that will be emitted every time a borrower pays back a loan
     *
     * @param loanId The unique identifier of the loan
     * @param amountPaid The amount of currency paid back to the lender
     * @param resolved Whether the loan is fully paid back or not
     *
     */
    event LoanPaymentMade(uint256 loanId, uint256 amountPaid, bool resolved);

    /**
     * @notice Event that will be emitted every time a loan is liquidated when the obligation note holder did not pay it back in time
     *
     * @param loanId The unique identifier of the loan
     */
    event DefaultedLoanLiquidated(uint256 loanId);

    /**
     * @notice Event that will be when the contract is deployed
     *
     * @param promissoryNotes The address of the ERC721 to generate promissory notes for lenders
     * @param obligationNotes The address of the ERC721 to generate obligation notes for borrowers
     * @param lendingKeys The address of the lending desk ownership ERC721
     */
    event ProtocolInitialized(
        address promissoryNotes,
        address obligationNotes,
        address lendingKeys
    );

    /**
     * @notice Event that will be emitted every time an admin updates loan origination fee
     *
     * @param loanOriginationFee The basis points of fees in tokens that the borrower will have to pay for a loan
     */
    event LoanOriginationFeeSet(uint256 loanOriginationFee);

    /**
     * @notice Event that will be emitted every time an admin updates the platform wallet
     *
     * @param platformWallet The address of the platform wallet
     */
    event PlatformWalletSet(address platformWallet);

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor(
        address _promissoryNotes,
        address _obligationNotes,
        address _lendingKeys,
        uint256 _loanOriginationFee,
        address _platformWallet,
        address _initialOwner
    ) {
        // Check & set peripheral contract addresses, emit event
        if (_promissoryNotes == address(0)) revert PromissoryNotesIsZeroAddr();
        if (_obligationNotes == address(0)) revert ObligationNotesIsZeroAddr();
        if (_lendingKeys == address(0)) revert LendingKeysIsZeroAddr();
        promissoryNotes = _promissoryNotes;
        obligationNotes = _obligationNotes;
        lendingKeys = _lendingKeys;

        // Set initial owner
        _initializeOwner(_initialOwner);
        // Set loan origination fee
        setLoanOriginationFee(_loanOriginationFee);
        // Set platform wallet
        setPlatformWallet(_platformWallet);

        // Emit event
        emit ProtocolInitialized(
            _promissoryNotes,
            _obligationNotes,
            _lendingKeys
        );
    }

    /* ******************** */
    /*  CORE FUNCTIONS      */
    /* ******************** */
    /**
     * @notice Creates a new lending desk
     *
     * @param _erc20 The ERC20 that will be accepted for loans in this lending desk
     * @param _depositAmount The initial balance of this lending desk
     * @param _loanConfigs Loan config for each NFT collection this lending desk will support
     * @dev Emits an {NewLendingDeskInitialized} event.
     */
    function initializeNewLendingDesk(
        address _erc20,
        uint256 _depositAmount,
        LoanConfig[] calldata _loanConfigs
    ) external whenNotPaused {
        // Check valid inputs
        if (_erc20 == address(0)) revert ERC20IsZeroAddr();

        uint256 lendingDeskId = lendingDeskIdCounter;
        unchecked {
            lendingDeskId++;
        }
        // Set new desk in storage and update related storage
        LendingDesk storage lendingDesk = lendingDesks[lendingDeskId];
        lendingDesk.erc20 = _erc20;
        lendingDesk.status = LendingDeskStatus.Active;
        lendingDeskIdCounter = lendingDeskId;

        // Set loan configs and deposit liquidity
        _setLendingDeskLoanConfigs(lendingDeskId, _loanConfigs);
        _depositLendingDeskLiquidity(lendingDeskId, _depositAmount);

        // Mint lending desk ownership NFT
        INFTYERC721V1(lendingKeys).mint(msg.sender, lendingDeskId);

        // Emit event
        emit NewLendingDeskInitialized(
            lendingDeskId,
            msg.sender,
            lendingDesk.erc20,
            _depositAmount
        );
    }

    /**
     * @notice Creates a new lending configuration
     *
     * @param _lendingDeskId Identifier for the lending desk
     * @param _loanConfigs Loan config for each NFT collection this lending desk will support
     * @dev Emits an {LendingDeskLoanConfigsSet} event.
     */
    function setLendingDeskLoanConfigs(
        uint256 _lendingDeskId,
        LoanConfig[] calldata _loanConfigs
    ) public whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) != msg.sender)
            revert CallerIsNotLendingDeskOwner();

        _setLendingDeskLoanConfigs(_lendingDeskId, _loanConfigs);
    }

    function _setLendingDeskLoanConfigs(
        uint256 _lendingDeskId,
        LoanConfig[] calldata _loanConfigs
    ) internal {
        // Note: Two loops over _loanConfigs to avoid re-entry
        // 1. Perform checks and update storage
        for (uint256 i; i < _loanConfigs.length; ) {
            if (_loanConfigs[i].minAmount == 0) revert MinAmountIsZero();
            if (_loanConfigs[i].maxAmount < _loanConfigs[i].minAmount)
                revert MaxAmountIsLessThanMin();
            if (_loanConfigs[i].minInterest == 0) revert MinInterestIsZero();
            if (_loanConfigs[i].maxInterest < _loanConfigs[i].minInterest)
                revert MaxInterestIsLessThanMin();
            if (_loanConfigs[i].minDuration == 0) revert MinDurationIsZero();
            if (_loanConfigs[i].maxDuration < _loanConfigs[i].minDuration)
                revert MaxDurationIsLessThanMin();
            // If both duration and amount are constant, interest must be constant, because interest is a function of both
            // In other words, if amount and duration are constant, we can not scale and adjust interest
            // In logical notation it's the following, => meaning "implies"
            // minAmount = maxAmount && minDuration = maxDuration => minInterest = maxInterest
            if (
                _loanConfigs[i].minAmount == _loanConfigs[i].maxAmount &&
                _loanConfigs[i].minDuration == _loanConfigs[i].maxDuration &&
                _loanConfigs[i].minInterest != _loanConfigs[i].maxInterest
            ) revert InvalidInterest();

            // Update loan config state
            lendingDeskLoanConfigs[_lendingDeskId][
                _loanConfigs[i].nftCollection
            ] = _loanConfigs[i];

            // Increment counter
            unchecked {
                i++;
            }
        }

        // Emit event
        emit LendingDeskLoanConfigsSet({
            lendingDeskId: _lendingDeskId,
            loanConfigs: _loanConfigs
        });

        // 2. Verify NFT collection is valid NFT
        for (uint256 i; i < _loanConfigs.length; ) {
            // 1155
            if (_loanConfigs[i].nftCollectionIsErc1155) {
                if (
                    !ERC165Checker.supportsInterface(
                        _loanConfigs[i].nftCollection,
                        type(IERC1155).interfaceId
                    )
                ) revert InvalidNFTCollection();
            }
            // 721
            else {
                if (
                    !ERC165Checker.supportsInterface(
                        _loanConfigs[i].nftCollection,
                        type(IERC721).interfaceId
                    )
                ) revert InvalidNFTCollection();
            }

            // Increment counter
            unchecked {
                i++;
            }
        }
    }

    /**
     * @notice Removes a new lending configuration
     *
     * @param _lendingDeskId Identifier for the lending desk
     * @param _nftCollection Address for the NFT collection to remove supported config for
     * @dev Emits an {LendingDeskLoanConfigsSet} event.
     */
    function removeLendingDeskLoanConfig(
        uint256 _lendingDeskId,
        address _nftCollection
    ) external whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (
            lendingDeskLoanConfigs[_lendingDeskId][_nftCollection]
                .nftCollection == address(0)
        ) revert UnsupportedNFTCollection();
        if (INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) != msg.sender)
            revert CallerIsNotLendingDeskOwner();

        // Delete loan config from lending desk
        delete lendingDeskLoanConfigs[_lendingDeskId][_nftCollection];

        // Emit event
        emit LendingDeskLoanConfigRemoved({
            lendingDeskId: _lendingDeskId,
            nftCollection: _nftCollection
        });
    }

    /**
     * @notice This function is called to add liquidity to a lending desk
     *
     * @param _lendingDeskId The id of the lending desk
     * @param _amount The balance to be transferred
     * @dev Emits an {LendingDeskLiquidityDeposited} event.
     */
    function depositLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) public whenNotPaused {
        // Ensure positive amount
        if (_amount == 0) revert AmountIsZero();

        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) != msg.sender)
            revert CallerIsNotLendingDeskOwner();

        _depositLendingDeskLiquidity(_lendingDeskId, _amount);
    }

    function _depositLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) internal {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];

        // Transfer tokens
        IERC20(lendingDesk.erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        // Update balance state, emit event
        unchecked {
            lendingDesk.balance = lendingDesk.balance + _amount;
        }
        emit LendingDeskLiquidityDeposited(_lendingDeskId, _amount);
    }

    /**
     * @notice This function is called to cash out a lending desk
     * @param _lendingDeskId The id of the lending desk to be cashout
     * @param _amount Amount to withdraw from the lending desk
     *
     * @dev Emits an {LendingDeskLiquidityWithdrawn} event.
     */
    function withdrawLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) external {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) != msg.sender)
            revert CallerIsNotLendingDeskOwner();
        if (lendingDesk.balance < _amount)
            revert InsufficientLendingDeskBalance();
        if (_amount == 0) revert AmountIsZero();

        // Update balance state, emit event
        lendingDesk.balance = lendingDesk.balance - _amount;
        emit LendingDeskLiquidityWithdrawn(_lendingDeskId, _amount);

        // Transfer tokens
        IERC20(lendingDesk.erc20).safeTransfer(msg.sender, _amount);
    }

    /**
     * @notice This function can be called by the lending desk owner in order to freeze it
     * @param _lendingDeskId ID of the lending desk to be frozen
     * @param _freeze Whether to freeze or unfreeze
     *
     * @dev Emits an {LendingDeskStateSet} event.
     */
    function setLendingDeskState(
        uint256 _lendingDeskId,
        bool _freeze
    ) external whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) != msg.sender)
            revert CallerIsNotLendingDeskOwner();

        // Freeze
        if (_freeze) {
            if (lendingDesk.status == LendingDeskStatus.Frozen)
                revert LendingDeskIsNotActive();
            lendingDesk.status = LendingDeskStatus.Frozen;
        }
        // Unfreeze
        else {
            if (lendingDesk.status != LendingDeskStatus.Frozen)
                revert LendingDeskIsNotFrozen();
            lendingDesk.status = LendingDeskStatus.Active;
        }

        // Emit Event
        emit LendingDeskStateSet(_lendingDeskId, _freeze);
    }

    /**
     * @notice This function is called to dissolve a lending desk
     *
     * @param _lendingDeskId The id of the lending desk
     * @dev Emits an {LendingDeskDissolved} event.
     */
    function dissolveLendingDesk(
        uint256 _lendingDeskId
    ) external whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) != msg.sender)
            revert CallerIsNotLendingDeskOwner();
        if (lendingDesk.balance != 0) revert LendingDeskIsNotEmpty();

        // Update status, emit event
        lendingDesk.status = LendingDeskStatus.Dissolved;
        emit LendingDeskDissolved(_lendingDeskId);

        // Burn lending key
        INFTYERC721V1(lendingKeys).burn(_lendingDeskId);
    }

    /**
     * @notice This function can be called by a borrower to create a loan
     *
     * @param _lendingDeskId ID of the lending desk related to this offer
     * @param _nftCollection The NFT collection address to be used as collateral
     * @param _nftId ID of the NFT to be used as collateral
     * @param _duration Loan duration in hours
     * @param _amount Amount to ask on this loan in ERC20
     * @dev Emits an {NewLoanInitialized} event
     */
    function initializeNewLoan(
        uint64 _lendingDeskId,
        address _nftCollection,
        uint64 _nftId,
        uint32 _duration,
        uint256 _amount,
        uint32 _maxInterestAllowed
    ) external whenNotPaused {
        // Get desk & loan config from storage, check valid inputs
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        LoanConfig memory loanConfig = lendingDeskLoanConfigs[_lendingDeskId][
            _nftCollection
        ];
        if (lendingDesk.erc20 == address(0)) revert InvalidLendingDeskId();
        if (lendingDesk.status != LendingDeskStatus.Active)
            revert LendingDeskIsNotActive();
        if (lendingDesk.balance < _amount)
            revert InsufficientLendingDeskBalance();
        if (loanConfig.nftCollection == address(0))
            revert UnsupportedNFTCollection();

        if (_amount > loanConfig.maxAmount) revert LoanAmountTooHigh();
        if (_amount < loanConfig.minAmount) revert LoanAmountTooLow();
        if (_duration > loanConfig.maxDuration) revert LoanDurationTooHigh();
        if (_duration < loanConfig.minDuration) revert LoanDurationTooLow();

        // Transfer NFT to escrow
        // 1155
        if (loanConfig.nftCollectionIsErc1155) {
            IERC1155(_nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftId,
                1,
                ""
            );
        }
        // 721
        else {
            IERC721(_nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftId
            );
        }

        /*
        Interest rate calculation
        Handles constant interest, constant duration, constant amount, and both variables.
        When interest, amount, or duration is constant, it scales the interest accordingly.
        Ensures valid interest rates within specified ranges.
        */
        uint32 interest;

        // Constant interest
        if (
            loanConfig.minInterest == loanConfig.maxInterest ||
            (loanConfig.maxAmount == loanConfig.minAmount &&
                loanConfig.maxDuration == loanConfig.minDuration)
        ) {
            interest = loanConfig.minInterest;
        }
        // Constant duration, scale interest based on amount
        else if (loanConfig.minDuration == loanConfig.maxDuration) {
            interest =
                loanConfig.minInterest +
                (((_amount - loanConfig.minAmount) *
                    (loanConfig.maxInterest - loanConfig.minInterest)) /
                    (loanConfig.maxAmount - loanConfig.minAmount)).toUint32();
        }
        // Constant amount, scale interest based on duration
        else if (loanConfig.minAmount == loanConfig.maxAmount) {
            interest =
                loanConfig.minInterest +
                ((_duration - loanConfig.minDuration) *
                    (loanConfig.maxInterest - loanConfig.minInterest)) /
                (loanConfig.maxDuration - loanConfig.minDuration);
        }
        // Both amount and duration are variable, scale interest based on both
        else {
            interest =
                loanConfig.minInterest +
                // Take average of amount and duration factors
                (((((_amount - loanConfig.minAmount) *
                    (loanConfig.maxInterest - loanConfig.minInterest)) /
                    (loanConfig.maxAmount - loanConfig.minAmount)) +
                    (((_duration - loanConfig.minDuration) *
                        (loanConfig.maxInterest - loanConfig.minInterest)) /
                        (loanConfig.maxDuration - loanConfig.minDuration))) / 2)
                    .toUint32();
        }

        // Check interest is within max interest allowed
        if (interest > _maxInterestAllowed) revert InterestRateTooHigh();

        // Calculate platform fees
        uint256 platformFee = (loanOriginationFee * _amount) / 10000;

        uint256 loanId = loanIdCounter;
        unchecked {
            loanId++;
        }
        // Set new desk in storage and update related storage, emit event
        Loan memory loan = Loan({
            amount: _amount,
            amountPaidBack: 0,
            duration: _duration,
            startTime: uint64(block.timestamp),
            nftId: _nftId,
            status: LoanStatus.Active,
            lendingDeskId: _lendingDeskId,
            interest: interest,
            nftCollection: _nftCollection,
            nftCollectionIsErc1155: loanConfig.nftCollectionIsErc1155
        });
        loans[loanId] = loan;
        lendingDesk.balance = lendingDesk.balance - _amount;
        emit NewLoanInitialized(
            _lendingDeskId,
            loanId,
            msg.sender,
            _nftCollection,
            _nftId,
            _amount,
            _duration,
            interest,
            platformFee
        );

        // Update loanIdCounter in storage
        loanIdCounter = loanId;

        // Mint promissory and obligation notes
        // Note: Promissory note is minted to the owner of the desk key
        INFTYERC721V1(promissoryNotes).mint(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId),
            loanId
        );
        INFTYERC721V1(obligationNotes).mint(msg.sender, loanId);

        // Transfer amount minus fees to borrower
        IERC20(lendingDesk.erc20).safeTransfer(
            msg.sender,
            _amount - platformFee
        );

        // Transfer fees to platform wallet
        if (platformFee > 0)
            IERC20(lendingDesk.erc20).safeTransfer(platformWallet, platformFee);
    }

    /**
     * @notice This function can be called by anyone to get the remaining due amount of a loan
     *
     * @param _loanId ID of the loan
     */
    function getLoanAmountDue(
        uint256 _loanId
    ) public view returns (uint256 amount) {
        // Get loan + related lending desk and check status
        Loan storage loan = loans[_loanId];
        if (loan.nftCollection == address(0)) revert InvalidLoanId();
        if (loan.status != LoanStatus.Active) revert LoanIsNotActive();

        // Separate variable to get integer// floor value of hours elapsed
        uint256 hoursElapsed = (block.timestamp - loan.startTime) / 1 hours;
        if (hoursElapsed >= loan.duration) revert LoanHasDefaulted();
        if (hoursElapsed == 0) revert LoanMustBeActiveForMin1Hour();

        // Calculate total amount due
        uint256 totalAmountDue = loan.amount +
            (loan.amount * loan.interest) /
            ((8760 * 10000) / hoursElapsed); // Yearly scale, 8760 hours in a year

        return totalAmountDue - loan.amountPaidBack;
    }

    /**
     * @notice This function can be called by the obligation note holder to pay a loan and get the collateral back
     *
     * @param _loanId ID of the loan
     * @param _amount The amount to be paid, in erc20 tokens
     * @param _resolve Whether to resolve the loan or not. If true, _amount is ignored.
     * @dev Emits an {LoanPaymentMade} event.
     */
    function makeLoanPayment(
        uint256 _loanId,
        uint256 _amount,
        bool _resolve
    ) external {
        // Get loan + related lending desk and check status
        Loan storage loan = loans[_loanId];
        LendingDesk storage lendingDesk = lendingDesks[loan.lendingDeskId];

        // Get note holders and verify sender is borrower i.e. obligation note holder
        address borrower = INFTYERC721V1(obligationNotes).ownerOf(_loanId);
        address lender = INFTYERC721V1(promissoryNotes).ownerOf(_loanId);
        if (borrower != msg.sender) revert CallerIsNotBorrower();

        // Transfer Tokens
        IERC20(lendingDesk.erc20).safeTransferFrom(msg.sender, lender, _amount);

        uint256 amountDue = getLoanAmountDue(_loanId);
        // If resolve, set amount to amountDue
        if (_resolve) {
            _amount = amountDue;
        } else {
            // Make sure amount is less than or equal to amountDue if not resolving
            if (_amount > amountDue) revert LoanPaymentExceedsDebt();
        }

        // Update amountPaidBack, emit event
        loan.amountPaidBack += _amount;
        emit LoanPaymentMade(
            _loanId,
            _amount,
            _amount == amountDue // loan is fully paid back
        );

        // OPTIONAL: Loan paid back, proceed with fulfillment
        // (Returning NFT from escrow, burning obligation/promissory notes)
        if (_amount == amountDue) {
            // Set status to resolved
            loan.status = LoanStatus.Resolved;

            // Burn promissory note and obligation note
            INFTYERC721V1(obligationNotes).burn(_loanId);
            INFTYERC721V1(promissoryNotes).burn(_loanId);

            // Send NFT collateral from escrow to borrower
            if (loan.nftCollectionIsErc1155) // 1155
            {
                IERC1155(loan.nftCollection).safeTransferFrom(
                    address(this),
                    borrower,
                    loan.nftId,
                    1,
                    ""
                );
            }
            // 721
            else {
                IERC721(loan.nftCollection).safeTransferFrom(
                    address(this),
                    borrower,
                    loan.nftId
                );
            }
        }
    }

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _loanId ID of the loan
     *
     * @dev Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateDefaultedLoan(uint256 _loanId) external {
        // Get loan from storage
        Loan storage loan = loans[_loanId];
        if (loan.nftCollection == address(0)) revert InvalidLoanId();
        if (loan.status != LoanStatus.Active) revert LoanIsNotActive();
        if (INFTYERC721V1(promissoryNotes).ownerOf(_loanId) != msg.sender)
            revert CallerIsNotLender();

        // Check loan is expired / in default
        if (block.timestamp < loan.startTime + (loan.duration * 1 hours))
            revert LoanHasNotDefaulted();

        // Update loan status to Defaulted & emit event
        loan.status = LoanStatus.Defaulted;
        emit DefaultedLoanLiquidated(_loanId);

        // burn both promissory note and obligation note
        INFTYERC721V1(promissoryNotes).burn(_loanId);
        INFTYERC721V1(obligationNotes).burn(_loanId);

        // Transfer NFT from escrow to promissory note holder
        if (loan.nftCollectionIsErc1155) // 1155
        {
            IERC1155(loan.nftCollection).safeTransferFrom(
                address(this),
                msg.sender,
                loan.nftId,
                1,
                ""
            );
        }
        // 721
        else {
            IERC721(loan.nftCollection).safeTransferFrom(
                address(this),
                msg.sender,
                loan.nftId
            );
        }
    }

    /* ******************** */
    /*  ADMIN FUNCTIONS     */
    /* ******************** */
    /**
     * @notice Allows the admin of the contract to modify loan origination fee.
     *
     * @param _loanOriginationFee Basis points fee the borrower will have to pay to the platform when borrowing loan
     * @dev Emits an {LoanOriginationFeeSet} event.
     */
    function setLoanOriginationFee(
        uint256 _loanOriginationFee
    ) public onlyOwner {
        // Check inputs (fee cannot be greater than 10%)
        if (_loanOriginationFee > 1000)
            revert LoanOriginationFeeMoreThan10Percent();

        // Set loan origination fees & emit event
        loanOriginationFee = _loanOriginationFee;
        emit LoanOriginationFeeSet(_loanOriginationFee);
    }

    /**
     * @notice Allows the admin of the contract to set the platform wallet where platform fees will be sent to
     *
     * @param _platformWallet Wallet where platform fees will be sent to
     * @dev Emits an {PlatformWalletSet} event.
     */
    function setPlatformWallet(address _platformWallet) public onlyOwner {
        // Check inputs
        if (_platformWallet == address(0)) revert PlatformWalletIsZeroAddr();

        // Set platform wallet & emit event
        platformWallet = _platformWallet;
        emit PlatformWalletSet(_platformWallet);
    }

    /**
     * @notice Allows the admin of the contract to pause the contract as an emergency response.
     *
     * @param _paused Whether to pause or unpause
     * @dev Emits either a {Paused} or {Unpaused} event.
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) _pause();
        else _unpause();
    }
}
