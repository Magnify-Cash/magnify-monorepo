// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

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
     * @notice Event that will be emitted every time an admin withdraws platform fees
     *
     * @param receiver the address that will receive the platform fees that can be withdrawn at the time
     * @param erc20s array of erc20s the admin wants to withdraw fees for
     */
    event PlatformFeesWithdrawn(address receiver, address[] erc20s);

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor(
        address _promissoryNotes,
        address _obligationNotes,
        address _lendingKeys,
        uint256 _loanOriginationFee
    ) {
        // Check & set peripheral contract addresses, emit event
        require(_promissoryNotes != address(0), "promissory note is zero addr");
        require(_obligationNotes != address(0), "obligation note is zero addr");
        require(_lendingKeys != address(0), "lending keys is zero addr");
        promissoryNotes = _promissoryNotes;
        obligationNotes = _obligationNotes;
        lendingKeys = _lendingKeys;

        // Set loan origination fee
        setLoanOriginationFee(_loanOriginationFee);

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
        require(_erc20 != address(0), "zero addr erc20");

        // Set new desk in storage and update related storage
        lendingDeskIdCounter++;
        LendingDesk storage lendingDesk = lendingDesks[lendingDeskIdCounter];
        lendingDesk.erc20 = _erc20;
        lendingDesk.status = LendingDeskStatus.Active;

        // Mint lending desk ownership NFT
        INFTYERC721V1(lendingKeys).mint(msg.sender, lendingDeskIdCounter);

        // Set loan configs and deposit liquidity
        setLendingDeskLoanConfigs(lendingDeskIdCounter, _loanConfigs);
        depositLendingDeskLiquidity(lendingDeskIdCounter, _depositAmount);

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
    ) public whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Note: Two loops over _loanConfigs to avoid re-entry
        // 1. Perform checks and update storage
        for (uint256 i = 0; i < _loanConfigs.length; i++) {
            require(_loanConfigs[i].minAmount > 0, "min amount = 0");
            require(
                _loanConfigs[i].maxAmount >= _loanConfigs[i].minAmount,
                "max amount < min amount"
            );
            require(_loanConfigs[i].minInterest > 0, "min interest = 0");
            require(
                _loanConfigs[i].maxInterest >= _loanConfigs[i].minInterest,
                "max interest < min interest"
            );
            require(_loanConfigs[i].minDuration > 0, "min duration = 0");
            require(
                _loanConfigs[i].maxDuration >= _loanConfigs[i].minDuration,
                "max duration < min duration"
            );

            // Update loan config state, emit event
            lendingDeskLoanConfigs[_lendingDeskId][
                _loanConfigs[i].nftCollection
            ] = _loanConfigs[i];
        }

        // Emit event
        emit LendingDeskLoanConfigsSet({
            lendingDeskId: _lendingDeskId,
            loanConfigs: _loanConfigs
        });

        // 2. Verify NFT collection is valid NFT
        for (uint256 i = 0; i < _loanConfigs.length; i++) {
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
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            lendingDeskLoanConfigs[_lendingDeskId][_nftCollection]
                .nftCollection != address(0),
            "lending desk does not support NFT collection"
        );
        require(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

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
        require(_amount > 0, "amount = 0");

        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );

        // Update balance state, emit event
        lendingDesk.balance = lendingDesk.balance + _amount;
        emit LendingDeskLiquidityDeposited(_lendingDeskId, _amount);

        // Transfer tokens
        IERC20(lendingDesk.erc20).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
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
    ) external whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );
        require(
            lendingDesk.balance >= _amount,
            "insufficient lending desk balance"
        );

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
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
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
                lendingDesk.status == LendingDeskStatus.Frozen,
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
    ) external whenNotPaused {
        // Get desk from storage
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId) == msg.sender,
            "not lending desk owner"
        );
        require(lendingDesk.balance == 0, "lending desk not empty");

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
        uint256 _lendingDeskId,
        address _nftCollection,
        uint256 _nftId,
        uint256 _duration,
        uint256 _amount
    ) external whenNotPaused {
        // Get desk & loan config from storage, check valid inputs
        LendingDesk storage lendingDesk = lendingDesks[_lendingDeskId];
        LoanConfig storage loanConfig = lendingDeskLoanConfigs[_lendingDeskId][
            _nftCollection
        ];
        require(lendingDesk.erc20 != address(0), "invalid lending desk id");
        require(
            lendingDesk.status == LendingDeskStatus.Active,
            "lending desk not active"
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

        // Increase platformFees
        uint256 platformFee = (loanOriginationFee * _amount) / 10000;
        platformFees[lendingDesk.erc20] += platformFee;

        // Set new desk in storage and update related storage, emit event
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
        emit NewLoanInitialized(
            _lendingDeskId,
            loanIdCounter,
            msg.sender,
            _nftCollection,
            _nftId,
            _amount,
            _duration,
            interest,
            platformFee
        );

        // Mint promissory and obligation notes
        // Note: Promissory note is minted to the owner of the desk key
        INFTYERC721V1(promissoryNotes).mint(
            INFTYERC721V1(lendingKeys).ownerOf(_lendingDeskId),
            loanIdCounter
        );
        INFTYERC721V1(obligationNotes).mint(msg.sender, loanIdCounter);

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

        // Transfer amount minus fees to borrower
        // Note: Fees are held in contract until withdrawPlatformFees()
        IERC20(lendingDesk.erc20).safeTransfer(
            msg.sender,
            _amount - platformFee
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
    ) external whenNotPaused {
        // Get loan + related lending desk and check status
        Loan storage loan = loans[_loanId];
        LendingDesk storage lendingDesk = lendingDesks[loan.lendingDeskId];
        require(loan.nftCollection != address(0), "invalid loan id");
        require(loan.status == LoanStatus.Active, "loan not active");

        // Get note holders and verify sender is borrower i.e. obligation note holder
        address borrower = INFTYERC721V1(obligationNotes).ownerOf(_loanId);
        address lender = INFTYERC721V1(promissoryNotes).ownerOf(_loanId);
        require(borrower == msg.sender, "not borrower");

        // Separate variable to get integer// floor value of hours elapsed
        uint256 hoursElapsed = (block.timestamp - loan.startTime) / 1 hours;
        require(hoursElapsed < loan.duration, "loan has defaulted");
        require(hoursElapsed > 0, "loan must be active for minimum of 1 hour");

        // Calculate total amount due
        uint256 totalAmountDue = loan.amount +
            (loan.amount * loan.interest) /
            ((8760 * 10000) / hoursElapsed); // Yearly scale, 8760 hours in a year

        // Update amountPaidBack and check overflow, emit event
        loan.amountPaidBack += _amount;
        require(totalAmountDue >= loan.amountPaidBack, "payment amount > debt");
        emit LoanPaymentMade(
            _loanId,
            _amount,
            loan.amountPaidBack >= totalAmountDue // loan is fully paid back
        );

        // OPTIONAL: Loan paid back, proceed with fulfillment
        // (Returning NFT from escrow, burning obligation/promissory notes)
        // TODO: Check if this can be changed to equal
        if (loan.amountPaidBack >= totalAmountDue) {
            // Set status to resolved
            loan.status = LoanStatus.Resolved;

            // Send NFT collateral from escrow to borrower
            if (
                lendingDeskLoanConfigs[loan.lendingDeskId][loan.nftCollection]
                    .nftCollectionIsErc1155
            ) // 1155
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

            // Burn promissory note and obligation note
            INFTYERC721V1(obligationNotes).burn(_loanId);
            INFTYERC721V1(promissoryNotes).burn(_loanId);
        }

        // Transfer Tokens
        IERC20(lendingDesk.erc20).safeTransferFrom(msg.sender, lender, _amount);
    }

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _loanId ID of the loan
     *
     * @dev Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateDefaultedLoan(uint256 _loanId) external whenNotPaused {
        // Get loan from storage
        Loan storage loan = loans[_loanId];
        require(loan.nftCollection != address(0), "invalid loan id");
        require(loan.status == LoanStatus.Active, "loan not active");
        require(
            INFTYERC721V1(promissoryNotes).ownerOf(_loanId) == msg.sender,
            "not lender"
        );

        // Check loan is expired / in default
        require(
            block.timestamp >= loan.startTime + (loan.duration * 1 hours),
            "loan has not defaulted"
        );

        // Update loan state to resolved & emit event
        loan.status = LoanStatus.Defaulted;
        emit DefaultedLoanLiquidated(_loanId);

        // Transfer NFT from escrow to promissory note holder
        if (
            lendingDeskLoanConfigs[loan.lendingDeskId][loan.nftCollection]
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

        // burn both promissory note and obligation note
        INFTYERC721V1(promissoryNotes).burn(_loanId);
        INFTYERC721V1(obligationNotes).burn(_loanId);
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
        require(_loanOriginationFee <= 10000, "fee > 10%");

        // Set loan origination fees & emit event
        loanOriginationFee = _loanOriginationFee;
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
    ) external onlyOwner {
        // Check valid address
        require(_receiver != address(0), "invalid receiver");

        // Update and withdraw platformFees
        // Note: Two loops to avoid re-entry

        // 1. Update platformFees & emit event
        uint256[] memory queuedPlatformFees = new uint[](_erc20s.length);
        for (uint256 i = 0; i < _erc20s.length; i++) {
            require(_erc20s[i] != address(0), "invalid erc20");

            // check amount of erc20 requested
            uint256 amount = platformFees[_erc20s[i]];
            require(amount > 0, "collected platform fees = 0");

            // update erc20 state
            queuedPlatformFees[i] = platformFees[_erc20s[i]];
            platformFees[_erc20s[i]] = 0;
        }
        emit PlatformFeesWithdrawn(_receiver, _erc20s);

        // 2. Withdraw queuedPlatformFees (platformFees)
        for (uint256 i = 0; i < _erc20s.length; i++) {
            // transfer tokens
            IERC20(_erc20s[i]).safeTransfer(_receiver, queuedPlatformFees[i]);
        }
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
