import { BigInt } from "@graphprotocol/graph-ts";
import {
  Initialized,
  LiquidatedOverdueLoan,
  LiquidityAddedToShop,
  LiquidityShopCashOut,
  LiquidityShopCreated,
  LiquidityShopFrozen,
  LiquidityShopUnfrozen,
  NFTYLending,
  OfferAccepted,
  OwnershipTransferred,
  PaidBackLoan,
  Paused,
  PaymentMade,
  Unpaused,
  ProtocolParamsSet,
} from "../generated/NFTYLending/NFTYLending";
import { ERC20 } from "../generated/NFTYLending/ERC20";
import { ERC721 } from "../generated/NFTYLending/ERC721";
import {
  Erc20,
  LiquidityShop,
  Loan,
  NftCollection,
  ProtocolParams,
} from "../generated/schema";

// Liquidity shop related events

export function handleLiquidityShopCreated(event: LiquidityShopCreated): void {
  // Create ERC20 instance
  const erc20 = new Erc20(event.params.erc20.toHex());
  const erc20Contract = ERC20.bind(event.params.erc20);

  erc20.name = erc20Contract.name();
  erc20.symbol = erc20Contract.symbol();
  erc20.decimals = erc20Contract.decimals();

  erc20.save();

  // Create NftCollection instance
  const nftCollection = new NftCollection(event.params.nftCollection.toHex());
  const erc721Contract = ERC721.bind(event.params.nftCollection);

  nftCollection.name = erc721Contract.name();
  nftCollection.symbol = erc721Contract.symbol();

  nftCollection.save();

  // Create LiquidityShop instance
  const liquidityShop = new LiquidityShop(event.params.id.toString());

  liquidityShop.erc20 = event.params.erc20.toHex();
  liquidityShop.nftCollection = event.params.nftCollection.toHex();
  liquidityShop.owner = event.params.owner;
  liquidityShop.automaticApproval = event.params.automaticApproval;
  liquidityShop.allowRefinancingTerms = event.params.allowRefinancingTerms;
  liquidityShop.balance = event.params.amount;
  liquidityShop.maxOffer = event.params.maxOffer;
  liquidityShop.interestA = event.params.interestA;
  liquidityShop.interestB = event.params.interestB;
  liquidityShop.interestC = event.params.interestC;
  liquidityShop.name = event.params.name;
  liquidityShop.status = "ACTIVE";

  liquidityShop.save();
}

export function handleLiquidityAddedToShop(event: LiquidityAddedToShop): void {
  const liquidityShop = new LiquidityShop(event.params.id.toString());
  liquidityShop.balance = event.params.balance;
  liquidityShop.save();
}

export function handleLiquidityShopCashOut(event: LiquidityShopCashOut): void {
  const liquidityShop = new LiquidityShop(event.params.id.toString());
  liquidityShop.balance = new BigInt(0);
  liquidityShop.save();
}

export function handleLiquidityShopFrozen(event: LiquidityShopFrozen): void {
  const liquidityShop = new LiquidityShop(event.params.id.toString());
  liquidityShop.status = "FROZEN";
  liquidityShop.save();
}

export function handleLiquidityShopUnfrozen(
  event: LiquidityShopUnfrozen
): void {
  const liquidityShop = new LiquidityShop(event.params.id.toString());
  liquidityShop.status = "ACTIVE";
  liquidityShop.save();
}

// Loan related events

export function handleOfferAccepted(event: OfferAccepted): void {
  const loan = new Loan(event.params.loanId.toString());

  // Get loan details
  const nftyLendingContract = NFTYLending.bind(event.address);
  const loanDetails = nftyLendingContract.loans(event.params.loanId);

  // Enter loan details
  loan.liquidityShop = event.params.liquidityShopId.toString();
  loan.nftyNotesId = event.params.nftyNotesId;
  loan.amount = loanDetails.getAmount();
  loan.remainder = loanDetails.getAmount();
  loan.duration = loanDetails.getDuration();
  loan.fee = loanDetails.getFee();
  loan.startTime = loanDetails.getStartTime();
  loan.status = "ACTIVE";
  loan.borrowerFeePercentage = loanDetails.getPlatformFees().borrowerPercentage;
  loan.platformFeePercentage = loanDetails.getPlatformFees().platformPercentage;
  loan.lenderFeePercentage = loanDetails.getPlatformFees().lenderPercentage;
  loan.lender = event.params.lender;
  loan.borrower = event.params.borrower;
  loan.nftCollateralId = loanDetails.getNftCollateralId();

  // Save entity
  loan.save();
}

export function handleLiquidatedOverdueLoan(
  event: LiquidatedOverdueLoan
): void {
  const loan = new Loan(event.params.loanId.toString());
  loan.status = "RESOLVED";
  loan.save();
}

export function handlePaidBackLoan(event: PaidBackLoan): void {
  const loan = new Loan(event.params.loanId.toString());
  loan.status = "RESOLVED";
  loan.save();
}

export function handlePaymentMade(event: PaymentMade): void {
  const loan = new Loan(event.params.loanId.toString());
  loan.remainder = event.params.remainder;
  loan.save();
}

// Protocol level parameters related events

export function handleInitialized(event: Initialized): void {
  const protocolParams = new ProtocolParams("0");

  // Load contract details
  const nftyLendingContract = NFTYLending.bind(event.address);
  protocolParams.borrowerFeePercentage = nftyLendingContract
    .platformFees()
    .getBorrowerPercentage();
  protocolParams.platformFeePercentage = nftyLendingContract
    .platformFees()
    .getPlatformPercentage();
  protocolParams.lenderFeePercentage = nftyLendingContract
    .platformFees()
    .getLenderPercentage();
  protocolParams.loanOriginationFeePercentage =
    nftyLendingContract.loanOriginationFee();
  protocolParams.paused = false;
  protocolParams.oraclePriceExpirationDuration =
    nftyLendingContract.oraclePriceExpirationDuration();
  protocolParams.owner = nftyLendingContract.owner();
  protocolParams.oracle = nftyLendingContract.oracle();
  protocolParams.nftyToken = nftyLendingContract.nftyToken();
  protocolParams.promissoryNote = nftyLendingContract.promissoryNote();
  protocolParams.obligationReceipt = nftyLendingContract.obligationReceipt();

  // Save entity
  protocolParams.save();
}

export function handleProtocolParamsSet(event: ProtocolParamsSet): void {
  const protocolParams = new ProtocolParams("0");

  protocolParams.oraclePriceExpirationDuration =
    event.params.oraclePriceExpirationDuration;
  protocolParams.borrowerFeePercentage =
    event.params.platformFees.borrowerPercentage;
  protocolParams.lenderFeePercentage =
    event.params.platformFees.lenderPercentage;
  protocolParams.platformFeePercentage =
    event.params.platformFees.platformPercentage;
  protocolParams.loanOriginationFeePercentage =
    event.params.loanOriginationFees;

  protocolParams.save();
}

export function handlePaused(event: Paused): void {
  const protocolParams = new ProtocolParams("0");
  protocolParams.paused = true;
  protocolParams.save();
}

export function handleUnpaused(event: Unpaused): void {
  const protocolParams = new ProtocolParams("0");
  protocolParams.paused = false;
  protocolParams.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const protocolParams = new ProtocolParams("0");

  // Load contract details
  const nftyLendingContract = NFTYLending.bind(event.address);
  protocolParams.borrowerFeePercentage = nftyLendingContract
    .platformFees()
    .getBorrowerPercentage();
  protocolParams.platformFeePercentage = nftyLendingContract
    .platformFees()
    .getPlatformPercentage();
  protocolParams.lenderFeePercentage = nftyLendingContract
    .platformFees()
    .getLenderPercentage();
  protocolParams.loanOriginationFeePercentage =
    nftyLendingContract.loanOriginationFee();
  protocolParams.paused = false;
  protocolParams.oraclePriceExpirationDuration =
    nftyLendingContract.oraclePriceExpirationDuration();
  protocolParams.owner = nftyLendingContract.owner();

  protocolParams.owner = event.params.newOwner;
  protocolParams.save();
}
