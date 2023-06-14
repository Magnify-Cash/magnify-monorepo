// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

interface INFTYFinanceV1 {
    // When first created a lending desk is Active, its owner can then set it as Frozen
    enum LendingDeskStatus {
        Active,
        Frozen,
        Dissolved
    }

    // When first created a Loan is Active by default, once the loan is resolved it becomes Resolved
    enum LoanStatus {
        Active,
        Resolved
    }

    /**
     * @notice Struct used to store loans
     *
     * @param amount The amount borrowed
     * @param amountPaidBack The amount borrower has paid back
     * @param duration The initial duration of the loan. Used to verify if expired
     * @param startTime The time when the loan was initiated. Used to verify if expired
     * @param nftCollateralId The collateral id for this loan
     * @param fee The fee that the borrower has to pay to borrow this amount of money
     * @param liquidityShopId The id of the liquidity shop this loan is associated with
     * @param status The status of this loan. ACTIVE when first created and RESOLVED once resolved
     */
    struct Loan {
        uint256 amount;
        uint256 amountPaidBack;
        uint256 duration;
        uint256 startTime;
        uint256 nftId;
        uint256 lendingDeskId;
        LoanStatus status;
        LoanConfig config;
    }

    /**
     * @notice Struct used to store loan config set by the shop owner for an NFT collection
     *
     * @param nftCollection The address of the collection accepted as collateral
     * @param nftCollectionIsErc1155 Whether the NFT collection is an ERC1155 contract or ERC721 contract
     * @param maxAmount The max loan amount allowed for this collection
     * @param minAmount The min loan amount allowed for this collection
     * @param maxInterest The max interest possible for this collection
     * @param minInterest The min interest possible for this collection
     * @param maxDuration The max duration allowed for this collection
     * @param minDuration The min duration allowed for this collection
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
     * @param erc20 The ERC20 address allowed for loans belonging to this liquidity shop
     * @param balance The balance of this shop
     * @param status The status of this liquidity shop. When first created it becomes active,
     * the owner can freeze it, in which case no more loans will be accepted
     * @param name Liquidity shop name
     */
    struct LendingDesk {
        address erc20;
        uint256 balance;
        LendingDeskStatus status;
        mapping(address => LoanConfig) loanConfigs;
    }

    function initializeNewLendingDesk(
        address _erc20,
        uint256 _depositAmount,
        LoanConfig[] calldata _loanConfigs
    ) external;

    function setLendingDeskLoanConfig(
        uint256 _lendingDeskId,
        address _nftCollection,
        LoanConfig calldata _loanConfig
    ) external;

    function removeLendingDeskLoanConfig(
        uint256 _lendingDeskId,
        address _nftCollection
    ) external;

    function depositLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) external;

    function withdrawLendingDeskLiquidity(
        uint256 _lendingDeskId,
        uint256 _amount
    ) external;

    function setLendingDeskState(
        uint256 _lendingDeskId,
        bool _freezed
    ) external;

    function dissolveLendingDesk(uint256 _lendingDeskId) external;

    function initializeNewLoan(
        uint256 _lendingDeskId,
        address _nftCollection,
        uint256 _nftId,
        uint256 _duration,
        uint256 _amount
    ) external;

    function liquidateDefaultedLoan(uint256 _loanId) external;

    function makeLoanPayment(uint256 _loanId, uint256 _amount) external;
}
