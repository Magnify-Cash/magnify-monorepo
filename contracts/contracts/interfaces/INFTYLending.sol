// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

interface INFTYLending {
    /* *********** */
    /* ENUMS   */
    /* *********** */

    // Enum for liquidity shop statuses
    // When first created a liquidity shop is ACTIVE, its owner can then set it as FROZEN
    enum LiquidityShopStatus {
        ACTIVE,
        INACTIVE,
        FROZEN
    }

    // Enum for loan statuses
    // When first created a Loan is ACTIVE by default, once the loan is resolved it becomes RESOLVED
    enum LoanStatus {
        ACTIVE,
        RESOLVED,
        INACTIVE
    }

    /* *********** */
    /* Structs     */
    /* *********** */

    /**
     * @notice Struct used to store loans on this contract.
     *
     * @param amount The amount borrowed
     * @param remainder The amount remaining to be paid
     * @param duration The initial duration of the loan. Used to verify if expired
     * @param startTime The time when the loan was initiated. Used to verify if expired
     * @param nftCollateralId The collateral id for this loan
     * @param fee The fee that the borrower has to pay to borrow this amount of money
     * @param liquidityShopId The id of the liquidity shop this loan is associated with
     * @param nftyNotesId The id of the nftyNotes associated to the loan's collateral
     * @param platformFees The platform fees that were used when creating this loan
     * @param status The status of this loan. ACTIVE when first created and RESOLVED once resolved
     */

    struct Loan {
        uint256 amount;
        uint256 remainder;
        uint256 duration;
        uint256 startTime;
        uint256 nftCollateralId;
        uint256 fee;
        uint256 liquidityShopId;
        uint64 nftyNotesId;
        PlatformFees platformFees;
        LoanStatus status;
    }

    /**
     * @notice Struct used to store liquidity shops on this contract
     *
     * @param erc20 The ERC20 address allowed for loans belonging to this liquidity shop
     * @param nftCollection The address of the collection accepted as collateral
     * @param owner The address of the owner of this liquidity shop
     * @param automaticApproval Whether or not loans can be automatically approved for this liquidity shop
     * @param allowRefinancingTerms Whether or not terms can be changed for loans in this liquidity shop. NOTE: Not currently implemented
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
        address owner;
        bool automaticApproval;
        bool allowRefinancingTerms;
        uint256 balance;
        uint256 maxOffer;
        uint256 interestA;
        uint256 interestB;
        uint256 interestC;
        LiquidityShopStatus status;
        string name;
    }

    /**
     * @notice Struct used to receive store Platform fees
     *
     * @param lenderPercentage The percentage of fees that the lender will receive for each loan
     * @param platformPercentage The percentage of fees that the platform will receive for each loan
     * @param borrowerPercentage The percentage of fees that the borrower will receive after paying the loan. If the loan is not paid, the platform will keep them
     */
    struct PlatformFees {
        uint256 lenderPercentage;
        uint256 platformPercentage;
        uint256 borrowerPercentage;
    }

    /**
     * @notice Struct used to receive offer parameters used on acceptOffer
     *
     * @param shopId ID of the shop related to this offer
     * @param nftCollateralId ID of the NFT to be used as collateral
     * @param loanDuration Loan duration in days
     * @param amount Amount to ask on this loan in ERC20
     */
    struct Offer {
        uint256 shopId;
        uint256 nftCollateralId;
        uint256 loanDuration;
        uint256 amount;
    }

    /**
     * @notice Signature related params. Borrower signature used as parameter on acceptOffer
     *
     * @param signer The address of the signer
     * @param nonce Any uint256 value that the user has not previously used to sign an off-chain offer.
     * Each nonce can be used at most once per user within this platform
     * @param expiry Date when the signature expires
     * @param signature The ECDSA signature of the borrower, obtained off-chain ahead of time, signing
     * the following parameters:
     *  - Offer.shopId
     *  - Offer.nftCollateralId
     *  - Offer.loanDuration
     *  - Offer.amount
     *  - Signature.signer
     *  - Signature.nonce
     *  - Signature.expiry
     *  - chainId
     */

    struct Signature {
        uint256 nonce;
        uint256 expiry;
        address signer;
        bytes signature;
    }

    function createLiquidityShop(
        string calldata _name,
        address _erc20,
        address _nftCollection,
        uint256 _liquidityAmount,
        uint256 _interestA,
        uint256 _interestB,
        uint256 _interestC,
        uint256 _maxOffer,
        bool _automaticApproval,
        bool _allowRefinancingTerms
    ) external;

    function addLiquidityToShop(uint256 _id, uint256 _amount) external;

    function liquidityShopCashOut(uint256 _id) external;

    function freezeLiquidityShop(uint256 _id) external;

    function unfreezeLiquidityShop(uint256 _id) external;

    function acceptOffer(
        Offer memory _offer,
        Signature memory _signature
    ) external;

    function createLoan(Offer memory _offer) external;

    function liquidateOverdueLoan(uint256 _nftyNotesId) external;

    function payBackLoan(uint256 _nftyNotesId, uint256 _amount) external;
}
