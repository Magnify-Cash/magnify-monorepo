// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

interface INFTYFinanceV1 {
    /* *********** */
    /*  EVENTS     */
    /* *********** */
    /**
     * @notice LendingDeskStatus used to store lending desk status
     * @notice Active Default status when a lending desk is created
     * @notice Frozen Used when a lender pauses or 'freezes' their desk
     * @notice Dissolved Used when a lender fully dissolves their desk. Non-reversible.
     */
    enum LendingDeskStatus {
        Active,
        Frozen,
        Dissolved
    }

    /**
     * @notice LoanStatus used to store loan status
     * @notice Active Default status when a loan is issued
     * @notice Resolved Used when a loan is fully paid back by borrower
     * @notice Defaulted Used when a loan is liquidated by lender
     */
    enum LoanStatus {
        Active,
        Resolved,
        Defaulted
    }

    /**
     * @notice Struct used to store loans
     *
     * @param amount The amount borrowed
     * @param amountPaidBack The amount borrower has paid back
     * @param duration The initial duration of the loan. Used to verify if expired
     * @param startTime The time when the loan was initiated. Used to verify if expired
     * @param nftId The collateral NFT id for this loan
     * @param lendingDeskId The id of the lending desk this loan is associated with
     * @param status The status of this loan. Active when first created and Resolved once resolved
     * @param config Struct containing details about the loan params set by lender
     */
    struct Loan {
        uint256 amount;
        uint256 amountPaidBack;
        uint256 duration;
        uint256 startTime;
        address nftCollection;
        uint256 interest;
        uint256 nftId;
        uint256 lendingDeskId;
        LoanStatus status;
    }

    /**
     * @notice Struct used to store loan config set by the shop owner for an NFT collection
     *
     * @param nftCollection The address of the NFT collection accepted as collateral
     * @param nftCollectionIsErc1155 Whether the NFT collection is an ERC1155 contract or ERC721 contract
     * @param maxAmount The max loan amount allowed for this collection
     * @param minAmount The min loan amount allowed for this collection
     * @param maxInterest The max interest rate possible in basis points for this collection
     * @param minInterest The min interest rate possible in basis points for this collection
     * @param maxDuration The max duration in hours allowed for this collection
     * @param minDuration The min duration in hours allowed for this collection
     */
    struct LoanConfig {
        address nftCollection;
        bool nftCollectionIsErc1155;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 minInterest;
        uint256 maxInterest;
        uint256 minDuration;
        uint256 maxDuration;
    }

    /**
     * @notice Struct used to store lending desks on this contract
     *
     * @param erc20 The ERC20 address allowed for loans belonging to this lending desk
     * @param balance The balance of this shop
     * @param status The status of this lending desk. When first created it becomes active,
     * the owner can freeze it, in which case no more loans will be accepted
     */
    struct LendingDesk {
        address erc20;
        uint256 balance;
        LendingDeskStatus status;
        mapping(address => LoanConfig) loanConfigs;
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
    ) external;

    /**
     * @notice Creates a new lending configuration
     *
     * @param _lendingDeskId Identifier for the lending desk
     * @param _loanConfigs Loan config for each NFT collection this lending desk will support
     * @dev Emits an {LendingDeskLoanConfigSet} event.
     */
    function setLendingDeskLoanConfigs(
        uint256 _lendingDeskId,
        LoanConfig[] calldata _loanConfigs
    ) external;

    /**
     * @notice Removes a new lending configuration
     *
     * @param _lendingDeskId Identifier for the lending desk
     * @param _nftCollection Address for the NFT collection to remove supported config for
     * @dev Emits an {LendingDeskLoanConfigSet} event.
     */
    function removeLendingDeskLoanConfig(
        uint256 _lendingDeskId,
        address _nftCollection
    ) external;

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
    ) external;


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
    ) external;

    /**
     * @notice This function can be called by the lending desk owner in order to freeze it
     * @param _lendingDeskId ID of the lending desk to be frozen
     * @param _freezed Whether to freeze or unfreeze
     *
     * @dev Emits an {LendingDeskStateSet} event.
     */
    function setLendingDeskState(
        uint256 _lendingDeskId,
        bool _freezed
    ) external;

    /**
     * @notice This function is called to dissolve a lending desk
     *
     * @param _lendingDeskId The id of the lending desk
     * @dev Emits an {LendingDeskDissolved} event.
     */
    function dissolveLendingDesk(uint256 _lendingDeskId) external;

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
    ) external;

    /**
     * @notice This function can be called by the obligation note holder to pay a loan and get the collateral back
     *
     * @param _loanId ID of the loan
     * @param _amount The amount to be paid, in erc20 tokens
     * @dev Emits an {LoanPaymentMade} event.
     */
    function makeLoanPayment(uint256 _loanId, uint256 _amount) external;

    /**
     * @notice This function is called by the promissory note owner in order to liquidate a loan and claim the NFT collateral
     * @param _loanId ID of the loan
     *
     * @dev Emits an {LiquidatedOverdueLoan} event.
     */
    function liquidateDefaultedLoan(uint256 _loanId) external;


    /* ******************** */
    /*  ADMIN FUNCTIONS     */
    /* ******************** */
    /**
     * @notice Allows the admin of the contract to modify loan origination fee.
     *
     * @param _loanOriginationFee Basis points fee the borrower will have to pay to the platform when borrowing loan
     * @dev Emits an {LoanOriginationFeeSet} event.
     */
    function setLoanOriginationFee(uint256 _loanOriginationFee) external;

    /**
     * @notice This function can be called by an owner to withdraw collected platform funds.
     * The funds consists of all platform fees generated at the time of loan creation,
     * in addition to collected borrower fees for liquidated loans which were not paid back.
     * @param _receiver the address that will receive the platform fees that can be withdrawn at the time
     *
     */
    function withdrawPlatformFees(
        address _receiver,
        address[] calldata _erc20s
    ) external;
}
