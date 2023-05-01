import { BigInt } from "@graphprotocol/graph-ts";
import {
  Erc20Set,
  FeeExpirationSet,
  Initialized,
  LiquidatedOverdueLoan,
  LiquidityAddedToShop,
  LiquidityShopCashOut,
  LiquidityShopCreated,
  LiquidityShopFrozen,
  LiquidityShopUnfrozen,
  LoanOriginationFeesSet,
  NftSet,
  NFTYLending,
  OfferAccepted,
  OwnershipTransferred,
  PaidBackLoan,
  Paused,
  PaymentMade,
  PlatformFeesSet,
  Unpaused,
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
  loan.liquidityShop = event.params.liquidityShopId.toString();
  loan.nftyNotesId = event.params.nftyNotesId;

  // Get loan details
  const nftyLendingContract = NFTYLending.bind(event.address);
  const loanDetails = nftyLendingContract.loans(event.params.loanId);
  loan.amount = loanDetails.getAmount();
  loan.duration = loanDetails.getDuration();
  loan.fee = loanDetails.getFee();
  loan.startTime = loanDetails.getStartTime();
  loan.status = "ACTIVE";
  loan.borrowerFeePercentage = loanDetails.getPlatformFees().borrowerPercentage;
  loan.platformFeePercentage = loanDetails.getPlatformFees().platformPercentage;
  loan.lenderFeePercentage = loanDetails.getPlatformFees().lenderPercentage;
  loan.lender = event.params.lender;
  loan.borrower = event.params.borrower;

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
    nftyLendingContract.getLoanOriginationFees();
  protocolParams.paused = false;
  protocolParams.feeExpirationTime = nftyLendingContract.feeExpirationTime();
  protocolParams.owner = nftyLendingContract.owner();

  // Save entity
  protocolParams.save();
}

export function handleErc20Set(event: Erc20Set): void {
  // Get event parameters
  const erc20 = new Erc20(event.params.addr.toHex());
  erc20.allowed = event.params.allowed;
  erc20.minimumBasketSize = event.params.minimumBasketSize;
  erc20.minimumPaymentAmount = event.params.minimumPaymentAmount;

  // Get ERC20 token details
  const erc20Contract = ERC20.bind(event.params.addr);
  erc20.name = erc20Contract.name();
  erc20.symbol = erc20Contract.symbol();
  erc20.decimals = erc20Contract.decimals();
  erc20.totalSupply = erc20Contract.totalSupply();

  // Save entity
  erc20.save();
}

export function handleNftSet(event: NftSet): void {
  const nftCollection = new NftCollection(event.params.addr.toHex());
  nftCollection.allowed = event.params.allowed;
  nftCollection.image = event.params.image;

  // Get ERC721 token details
  const erc721Contract = ERC721.bind(event.params.addr);
  nftCollection.name = erc721Contract.name();
  nftCollection.symbol = erc721Contract.symbol();

  // Save entity
  nftCollection.save();
}

export function handleFeeExpirationSet(event: FeeExpirationSet): void {
  const protocolParams = new ProtocolParams("0");
  protocolParams.feeExpirationTime = event.params.feeExpirationTime;
  protocolParams.save();
}

export function handleLoanOriginationFeesSet(
  event: LoanOriginationFeesSet
): void {
  const protocolParams = new ProtocolParams("0");
  protocolParams.loanOriginationFeePercentage =
    event.params.loanOriginationFees;
  protocolParams.save();
}

export function handlePlatformFeesSet(event: PlatformFeesSet): void {
  const protocolParams = new ProtocolParams("0");
  protocolParams.platformFeePercentage =
    event.params.platformFees.platformPercentage;
  protocolParams.borrowerFeePercentage =
    event.params.platformFees.borrowerPercentage;
  protocolParams.lenderFeePercentage =
    event.params.platformFees.lenderPercentage;
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
    nftyLendingContract.getLoanOriginationFees();
  protocolParams.paused = false;
  protocolParams.feeExpirationTime = nftyLendingContract.feeExpirationTime();
  protocolParams.owner = nftyLendingContract.owner();

  protocolParams.owner = event.params.newOwner;
  protocolParams.save();
}
