// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

interface INFTYLending {
    // When first created a liquidity shop is ACTIVE, its owner can then set it as FROZEN
    enum LiquidityShopStatus {
        Active,
        Frozen
    }

    // When first created a Loan is ACTIVE by default, once the loan is resolved it becomes RESOLVED
    enum LoanStatus {
        Active,
        Resolved
    }

    /**
     * @notice Struct used to store loans on this contract.
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
        uint256 nftCollateralId;
        uint256 liquidityShopId;
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
     * @notice Struct used to store liquidity shops on this contract
     *
     * @param erc20 The ERC20 address allowed for loans belonging to this liquidity shop
     * @param balance The balance of this shop
     * @param status The status of this liquidity shop. When first created it becomes active,
     * the owner can freeze it, in which case no more loans will be accepted
     * @param name Liquidity shop name
     */
    struct LiquidityShop {
        string name;
        address erc20;
        uint256 balance;
        LiquidityShopStatus status;
        mapping(address => LoanConfig) loanConfigs;
    }

    function createLiquidityShop(
        string calldata _name,
        address _erc20,
        uint256 _liquidityAmount,
        LoanConfig[] calldata _loanConfigs
    ) external;

    function updateLiquidityShopName(
        uint256 _id,
        string calldata _name
    ) external;

    function setLoanConfig(
        uint256 _shopId,
        address _nftCollection,
        LoanConfig calldata _loanConfig
    ) external;

    function removeLoanConfig(uint256 _shopId, address _nftCollection) external;

    function addLiquidityToShop(uint256 _id, uint256 _amount) external;

    function cashOutLiquidityShop(uint256 _id, uint256 _amount) external;

    function freezeLiquidityShop(uint256 _id) external;

    function unfreezeLiquidityShop(uint256 _id) external;

    function createLoan(
        uint256 _shopId,
        address _nftCollection,
        uint256 _nftId,
        uint256 _duration,
        uint256 _amount
    ) external;

    function liquidateOverdueLoan(uint256 _loanId) external;

    function payBackLoan(uint256 _loanId, uint256 _amount) external;
}
