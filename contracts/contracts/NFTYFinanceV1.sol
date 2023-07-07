// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./interfaces/INFTYFinanceV1.sol";
import "./interfaces/INFTYERC721.sol";

contract NFTYFinanceV1 is INFTYFinanceV1, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

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
     * @notice The amount of platform fees per token that can be withdrawn by an admin
     */
    mapping(address => uint256) public platformFees;

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
        address erc20
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
     * @param amountAdded Amount of liquidity added to the lending desk
     */
    event LendingDeskLiquidityAdded(uint256 lendingDeskId, uint256 amountAdded);

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
     * @param lender The address of the owner
     * @param borrower The address of the borrower
     * @param lendingDeskId A unique identifier that determines the lending desk to which this offer belongs
     * @param loanId A unique identifier for the loan created
     */
    event NewLoanInitialized(
        address indexed lender,
        address indexed borrower,
        uint256 lendingDeskId,
        uint256 loanId
    );

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
     * @notice Event that will be emitted every time a loan is liquidated when the obligation receipt holder did not pay it back in time
     *
     * @param promissoryNoteOwner The address of the promissory note owner
     * @param lendingDeskId The unique identifier of the lending desk
     * @param loanId The unique identifier of the loan
     * @param nftCollateralId The collateral NFT ID that was sent to the promissory note holder
     */
    event DefaultedLoanLiquidated(
        address indexed promissoryNoteOwner,
        uint256 lendingDeskId,
        uint256 loanId,
        uint256 nftCollateralId
    );

    /**
     * @notice Event that will be emitted every time an admin updates loan origination fee
     *
     * @param loanOriginationFee The basis points of fees in tokens that the borrower will have to pay for a loan
     */
    event LoanOriginationFeeSet(uint256 loanOriginationFee);

    /**
     * @notice Event that will be emitted every time an admin pauses or unpauses the protocol
     *
     * @param paused Boolean for paused. True if paused, false if unpaused.
     */
    event ProtocolPaused(bool paused);

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor(
        address _promissoryNotes,
        address _obligationNotes,
        address _lendingKeys,
        uint256 _loanOriginationFee
    ) {
        // Check & set peripheral contract addresses
        require(_promissoryNotes != address(0), "promissory note is zero addr");
        require(_obligationNotes != address(0), "obligation note is zero addr");
        require(_lendingKeys != address(0), "lending keys is zero addr");
        promissoryNotes = _promissoryNotes;
        obligationNotes = _obligationNotes;
        lendingKeys = _lendingKeys;

        // Set loan origination fee
        setLoanOriginationFee(_loanOriginationFee);
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
    ) external whenNotPaused nonReentrant {
        // Check valid inputs
        require(_erc20 != address(0), "zero addr erc20");

        // Set new desk in storage and update related storage
        // (ID, ERC20, Status, Loan Configs, Liquidity)
        lendingDeskIdCounter++;
        LendingDesk storage lendingDesk = lendingDesks[lendingDeskIdCounter];
        lendingDesk.erc20 = _erc20;
        lendingDesk.status = LendingDeskStatus.Active;
        setLendingDeskLoanConfigs(lendingDeskIdCounter, _loanConfigs);
        depositLendingDeskLiquidity(lendingDeskIdCounter, _depositAmount);

        // Mint lending desk ownership NFT
        INFTYERC721(lendingKeys).mint(msg.sender, lendingDeskIdCounter);

        // Emit event
        emit NewLendingDeskInitialized(
            lendingDeskIdCounter,
            msg.sender,
            lendingDesk.erc20
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
        LoanConfig[] memory _loanConfigs
    ) public whenNotPaused nonReentrant {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Loop over _loanConfigs
        for (uint256 i = 0; i < _loanConfigs.length; i++) {
            require(_loanConfigs[i].minAmount > 0, "min amount = 0");
            require(_loanConfigs[i].maxAmount > 0, "max amount = 0");
            require(_loanConfigs[i].minInterest > 0, "min interest = 0");
            require(_loanConfigs[i].maxInterest > 0, "max interest = 0");
            require(_loanConfigs[i].minDuration > 0, "min duration = 0");
            require(_loanConfigs[i].maxDuration > 0, "max duration = 0");

            // Verify NFT collection is valid NFT
            // 1155
            if (_loanConfigs[i].nftCollectionIsErc1155) {
                require(
                    ERC165Checker.supportsInterface(
                        _loanConfigs[i].nftCollection,
                        type(IERC1155).interfaceId
                    ),
                    "invalid nft collection"
                );
            }
            // 721
            else {
                require(
                    ERC165Checker.supportsInterface(
                        _loanConfigs[i].nftCollection,
                        type(IERC721).interfaceId
                    ),
                    "invalid nft collection"
                );
            }

            // Add loan configuration to state
            lendingDesk.loanConfigs[
                _loanConfigs[i].nftCollection
            ] = _loanConfigs[i];
        }

        // Emit event
        emit LendingDeskLoanConfigsSet({
            lendingDeskId: _lendingDeskId,
            loanConfigs: _loanConfigs
        });
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
    ) external whenNotPaused nonReentrant {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            lendingDesk.loanConfigs[_nftCollection].nftCollection != address(0),
            "lending desk does not support NFT collection"
        );
        require(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Delete desk
        delete lendingDesk.loanConfigs[_nftCollection];

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
     * @dev Emits an {LendingDeskLiquidityAdded} event.
     */
    function depositLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) public whenNotPaused nonReentrant {
        // Ensure positive amount
        require(_amount > 0, "amount = 0");

        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Update balance state, approve tokens, transfer tokens
        lendingDesk.balance = lendingDesk.balance + _amount;
        IERC20(lendingDesk.erc20).safeIncreaseAllowance(address(this), _amount);
        IERC20(lendingDesk.erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        // Emit event
        emit LendingDeskLiquidityAdded(_lendingDeskId, _amount);
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
    ) external whenNotPaused nonReentrant {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );
        require(
            lendingDesk.balance > _amount,
            "insufficient lending desk balance"
        );

        // Update balance state, transfer tokens
        lendingDesk.balance = lendingDesk.balance - _amount;
        IERC20(lendingDesk.erc20).safeTransfer(msg.sender, _amount);

        // Emit event
        emit LendingDeskLiquidityWithdrawn(_lendingDeskId, _amount);
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
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Freeze
        if (_freeze) {
            require(
                lendingDesk.status == LendingDeskStatus.Active,
                "lending desk not active"
            );
            lendingDesk.status = LendingDeskStatus.Frozen;
        }
        // Unfreeze
        else {
            require(
                lendingDesk.status == LendingDeskStatus.Active,
                "lending desk not frozen"
            );
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
    ) external whenNotPaused nonReentrant {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Update status and burn desk key
        lendingDesk.status = LendingDeskStatus.Dissolved;
        INFTYERC721(lendingKeys).burn(_lendingDeskId);

        // Emit event
        emit LendingDeskDissolved(_lendingDeskId);
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
        uint256 _lendingDeskId,
        address _nftCollection,
        uint256 _nftId,
        uint256 _duration,
        uint256 _amount
    ) external whenNotPaused nonReentrant {
        // Get desk & loan config from storage, check valid inputs
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        LoanConfig storage loanConfig = lendingDesk.loanConfigs[_nftCollection];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            lendingDesk.status == LendingDeskStatus.Active,
            "lending desk must be active"
        );
        require(
            loanConfig.nftCollection != address(0),
            "lending desk does not support NFT collection"
        );
        require(
            _amount <= lendingDesk.balance,
            "insufficient lending desk balance"
        );
        require(_amount >= loanConfig.minAmount, "amount < min amount");
        require(_amount <= loanConfig.maxAmount, "amount > max amount");
        require(_duration >= loanConfig.minDuration, "duration < min duration");
        require(_duration <= loanConfig.maxDuration, "duration > max duration");

        /*
        Calculation of the interest rate:
        1. Determine the impact of the differences in loan amount and duration:
           - Multiply the differences between the requested values and a reference value.
           (amountDifference * interestRange * durationDifference)

        2. Find the maximum potential impact of the loan amount and duration:
           - Multiply the ranges of possible values for loan amount and duration.
           (amountRange * durationRange)

        3. Adjust the impact based on the proportionate differences:
           - Divide the impact of the differences by the maximum potential impact.
           ((amountDifference * interestRange * durationDifference) / (amountRange * durationRange))

        4. Add the adjusted impact to the minimum interest rate:
           - Combine the adjusted impact with the minimum interest rate.
           loanConfig.minInterest + ((amountDifference * interestRange * durationDifference) / (amountRange * durationRange))
        */
        uint256 interest = loanConfig.minInterest +
            (((_amount - loanConfig.minAmount) *
                (loanConfig.maxInterest - loanConfig.minInterest) *
                (_duration - loanConfig.minDuration)) /
                ((loanConfig.maxAmount - loanConfig.minAmount) *
                    (loanConfig.maxDuration - loanConfig.minDuration)));

        // Set new desk in storage and update related storage
        loanIdCounter++;
        Loan memory loan = Loan({
            amount: _amount,
            amountPaidBack: 0,
            duration: _duration,
            startTime: block.timestamp,
            nftId: _nftId,
            status: LoanStatus.Active,
            lendingDeskId: _lendingDeskId,
            interest: interest,
            nftCollection: _nftCollection
        });
        loans[loanIdCounter] = loan;
        lendingDesk.balance = lendingDesk.balance - _amount;

        // Mint promissory and obligation notes
        // Note: Promissory note is minted to the owner of the desk key
        INFTYERC721(promissoryNotes).mint(
            INFTYERC721(lendingKeys).ownerOf(_lendingDeskId),
            loanIdCounter
        );
        INFTYERC721(obligationNotes).mint(msg.sender, loanIdCounter);

        // Approve + Transfer NFT to escrow
        // 1155
        if (loanConfig.nftCollectionIsErc1155) {
            IERC1155(_nftCollection).setApprovalForAll(msg.sender, true);
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
            IERC721(_nftCollection).approve(address(this), _nftId);
            IERC721(_nftCollection).safeTransferFrom(
                msg.sender,
                address(this),
                _nftId
            );
        }

        // Transfer amount minus fees to borrower
        // Note: Fees are held in contract until withdrawPlatformFees()
        IERC20(lendingDesk.erc20).safeTransfer(
            msg.sender,
            _amount - ((loanOriginationFee * _amount) / 10000)
        );

        // Emit event
        emit NewLoanInitialized(
            msg.sender,
            msg.sender,
            _lendingDeskId,
            loanIdCounter
        );
    }

    /**
     * @notice This function can be called by the obligation note holder to pay a loan and get the collateral back
     *
     * @param _loanId ID of the loan
     * @param _amount The amount to be paid, in erc20 tokens
     * @dev Emits an {LoanPaymentMade} event.
     */
    function makeLoanPayment(
        uint256 _loanId,
        uint256 _amount
    ) external whenNotPaused nonReentrant {
        // Get loan + related lending desk and check status
        Loan storage loan = loans[_loanId];
        LendingDesk storage lendingDesk = lendingDesks[loan.lendingDeskId];
        require(loan.nftCollection != address(0), "invalid loan id");
        require(loan.status == LoanStatus.Active, "loan not active");

        // Get note holders and verify sender is obligation note holder
        address obligationReceiptHolder = INFTYERC721(obligationNotes).ownerOf(
            _loanId
        );
        address promissoryNoteHolder = INFTYERC721(promissoryNotes).ownerOf(
            _loanId
        );
        require(
            obligationReceiptHolder == msg.sender,
            "not obligation receipt owner"
        );

        // Calculate total amount due
        uint256 totalAmountDue = loan.amount +
            (loan.amount * loan.interest * (block.timestamp - loan.startTime)) /
            (8760 * 10000) / // Yearly scale
            1 hours; // Hourly scale

        // Update amountPaidBack and check expiry / overflow.
        loan.amountPaidBack = loan.amountPaidBack + _amount;
        require(
            (block.timestamp - loan.startTime) / 1 hours <= loan.duration,
            "loan has expired"
        );
        require(totalAmountDue >= loan.amountPaidBack, "payment amount > debt");

        // OPTIONAL: Loan paid back, proceed with fulfillment
        // (Returning NFT from escrow, burning obligation/promissory notes)
        // TODO: Check if this can be changed to equal
        if (loan.amountPaidBack >= totalAmountDue) {
            // Set status to resolveD
            loan.status = LoanStatus.Resolved;

            // Send NFT collateral from escrow to obligation receipt holder
            if (
                lendingDesk
                    .loanConfigs[loan.nftCollection]
                    .nftCollectionIsErc1155
            ) // 1155
            {
                IERC1155(loan.nftCollection).safeTransferFrom(
                    address(this),
                    obligationReceiptHolder,
                    loan.nftId,
                    1,
                    ""
                );
            }
            // 721
            else {
                IERC721(loan.nftCollection).safeTransferFrom(
                    address(this),
                    obligationReceiptHolder,
                    loan.nftId
                );
            }

            // Burn promissory note and obligation receipt
            INFTYERC721(obligationNotes).burn(_loanId);
            INFTYERC721(promissoryNotes).burn(_loanId);
        }

        // Approve + Transfer Tokens
        IERC20(lendingDesk.erc20).safeIncreaseAllowance(address(this), _amount);
        IERC20(lendingDesk.erc20).safeTransferFrom(
            msg.sender,
            promissoryNoteHolder,
            _amount
        );

        // Emit Event
        emit LoanPaymentMade(
            obligationReceiptHolder,
            promissoryNoteHolder,
            _loanId,
            _amount,
            loan.amountPaidBack >= totalAmountDue // loan is fully paid back
        );
    }

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _loanId ID of the loan
     *
     * @dev Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateDefaultedLoan(
        uint256 _loanId
    ) external whenNotPaused nonReentrant {
        // Get loan from storage
        Loan storage loan = loans[_loanId];
        require(loan.nftCollection != address(0), "invalid loan id");
        require(loan.status == LoanStatus.Active, "loan not active");
        require(
            INFTYERC721(promissoryNotes).ownerOf(_loanId) == msg.sender,
            "not promissory note owner"
        );

        // Check loan is expired / in default
        uint256 loanDurationInDays = loan.duration * 1 days;
        require(
            block.timestamp >= loan.startTime + (loanDurationInDays),
            "loan not yet expired"
        );

        // Update loan state to resolved
        loan.status = LoanStatus.Defaulted;

        // Transfer NFT from escrow to promissory note holder

        if (
            lendingDesks[loan.lendingDeskId]
                .loanConfigs[loan.nftCollection]
                .nftCollectionIsErc1155
        ) // 1155
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

        // burn both promissory note and obligation receipt
        INFTYERC721(promissoryNotes).burn(_loanId);
        INFTYERC721(obligationNotes).burn(_loanId);

        // Emit event
        emit DefaultedLoanLiquidated(
            msg.sender,
            loan.lendingDeskId,
            _loanId,
            loan.nftId
        );
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
        // Set loan origination fees
        require(_loanOriginationFee <= 10000, "fee > 10%");
        loanOriginationFee = _loanOriginationFee;

        // Emit event
        emit LoanOriginationFeeSet(_loanOriginationFee);
    }

    /**
     * @notice This function can be called by an owner to withdraw collected platform funds.
     * The funds consists of all platform fees generated at the time of loan creation,
     * in addition to collected borrower fees for liquidated loans which were not paid back.
     * @param _receiver the address that will receive the platform fees that can be withdrawn at the time
     * @param _erc20s array of erc20s the admin wants to withdraw fees for
     *
     */
    function withdrawPlatformFees(
        address _receiver,
        address[] calldata _erc20s
    ) external onlyOwner nonReentrant {
        // check inputs
        require(_receiver != address(0), "invalid receiver");

        // loop over erc20s
        // TODO:
        // is re-entry concern here with transfers in a loop?
        // correct state is updated before transfer, but n transfer happens before n+1 state update / transfer
        // also an onlyOwner function so smaller attack surface
        for (uint256 i = 0; i < _erc20s.length; i++) {
            require(_erc20s[i] != address(0), "invalid erc20");

            // check amount of erc20 requested
            uint256 amount = platformFees[_erc20s[i]];
            require(amount > 0, "collected platform fees = 0");

            // update erc20 state
            platformFees[_erc20s[i]] = 0;

            // transfer tokens
            IERC20(_erc20s[i]).safeTransfer(_receiver, amount);
        }
    }

    /**
     * @notice Allows the admin of the contract to pause the contract as an emergency response.
     *
     * @param _paused Whether to pause or unpause
     * @dev Emits either a {Paused} or {Unpaused} event.
     */
    function setPaused(bool _paused) public onlyOwner {
        if (_paused) _pause();
        else _unpause();
    }
}
