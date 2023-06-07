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
        uint256 fee;
        uint256 liquidityShopId;
        LoanStatus status;
    }

    /**
     * @notice Struct used to store liquidity shops on this contract
     *
     * @param erc20 The ERC20 address allowed for loans belonging to this liquidity shop
     * @param nftCollection The address of the collection accepted as collateral
     * @param nftCollectionIsErc1155 Whether the NFT collection is an ERC1155 contract or ERC721 contract
     * @param balance The balance of this shop
     * @param maxAmount The max loan amount allowed for this collection
     * @param minAmount The max loan amount allowed for this collection
     * @param maxInterest interest set for the shop, used for loan duration A
     * @param minInterest interest set for the shop, used for loan duration B
     * @param maxDuration interest set for the shop, used for loan duration C
     * @param minDuration interest set for the shop, used for loan duration C
     * @param status The status of this liquidity shop. When first created it becomes active,
     * the owner can freeze it, in which case no more loans will be accepted
     * @param name Liquidity shop name
     */
    struct LiquidityShop {
        address erc20;
        address nftCollection;
        bool nftCollectionIsErc1155;
        uint256 balance;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 minInterest;
        uint256 maxInterest;
        uint256 minDuration;
        uint256 maxDuration;
        LiquidityShopStatus status;
        string name;
    }

    function createLiquidityShop(
        string calldata _name,
        address _erc20,
        address _nftCollection,
        bool _nftCollectionIsErc1155,
        uint256 _liquidityAmount,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _minInterest,
        uint256 _maxInterest,
        uint256 _minDuration,
        uint256 _maxDuration
    ) external;

    function updateLiquidityShop(
        uint256 _id,
        string calldata _name,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _minInterest,
        uint256 _maxInterest,
        uint256 _minDuration,
        uint256 _maxDuration
    ) external;

    function addLiquidityToShop(uint256 _id, uint256 _amount) external;

    function cashOutLiquidityShop(uint256 _id, uint256 _amount) external;

    function freezeLiquidityShop(uint256 _id) external;

    function unfreezeLiquidityShop(uint256 _id) external;

    function createLoan(
        uint256 _shopId,
        uint256 _nftCollateralId,
        uint256 _duration,
        uint256 _amount
    ) external;

    function liquidateOverdueLoan(uint256 _loanId) external;

    function payBackLoan(uint256 _loanId, uint256 _amount) external;
}
