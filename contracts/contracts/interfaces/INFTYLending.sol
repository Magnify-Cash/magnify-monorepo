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
     * @param owner The address of the owner of this liquidity shop
     * @param balance The balance of this shop
     * @param maxOffer The max offer allowed for this collection set by its owner in tokens in the same currency used in this liquidity shop
     * @param interestA interest set for the shop, used for loan duration A
     * @param interestB interest set for the shop, used for loan duration B
     * @param interestC interest set for the shop, used for loan duration C
     * @param status The status of this liquidity shop. When first created it becomes active,
     * the owner can freeze it, in which case no more loans will be accepted
     * @param name Liquidity shop name
     */
    struct LiquidityShop {
        address erc20;
        address nftCollection;
        bool nftCollectionIsErc1155;
        address owner;
        uint256 balance;
        uint256 maxOffer;
        uint256 interestA;
        uint256 interestB;
        uint256 interestC;
        LiquidityShopStatus status;
        string name;
    }

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
    ) external;

    function updateLiquidityShop(
        uint256 _id,
        string calldata _name,
        uint256 _interestA,
        uint256 _interestB,
        uint256 _interestC,
        uint256 _maxOffer
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
