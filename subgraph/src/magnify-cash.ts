import {
  OwnershipTransferred,
  Paused,
  Unpaused,
  NewLendingDeskInitialized,
  LoanOriginationFeeSet,
  LendingDeskLoanConfigsSet,
  LendingDeskLoanConfigRemoved,
  LendingDeskLiquidityDeposited,
  LendingDeskLiquidityWithdrawn,
  LendingDeskStateSet,
  NewLoanInitialized,
  DefaultedLoanLiquidated,
  LoanPaymentMade,
  ProtocolInitialized,
  PlatformWalletSet,
} from "../generated/MagnifyCash/MagnifyCash";
import { ERC20 } from "../generated/MagnifyCash/ERC20";
import {
  Erc20,
  LendingDesk,
  Loan,
  LoanConfig,
  NftCollection,
  ProtocolInfo,
  User,
  NftCollectionErc20,
} from "../generated/schema";
import { Address, BigInt, store } from "@graphprotocol/graph-ts";

// Lending desk related events

export function handleNewLendingDeskInitialized(
  event: NewLendingDeskInitialized
): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  // Create ERC20 instance if doesn't exist
  if (!Erc20.load(event.params.erc20.toHex())) {
    const erc20 = new Erc20(event.params.erc20.toHex());
    const erc20Contract = ERC20.bind(event.params.erc20);

    erc20.name = erc20Contract.name();
    erc20.symbol = erc20Contract.symbol();
    erc20.decimals = erc20Contract.decimals();

    erc20.save();

    // Increment ERC20 count
    protocolInfo.erc20sCount = protocolInfo.erc20sCount.plus(BigInt.fromI32(1));
    protocolInfo.save();
  }

  // Create User instance if doesn't exist
  if (!User.load(event.params.owner.toHex())) {
    const user = new User(event.params.owner.toHex());

    user.loansIssuedCount = BigInt.fromI32(0);
    user.loansIssuedResolvedCount = BigInt.fromI32(0);
    user.loansIssuedDefaultedCount = BigInt.fromI32(0);
    user.loansTakenCount = BigInt.fromI32(0);
    user.loansTakenResolvedCount = BigInt.fromI32(0);
    user.loansTakenDefaultedCount = BigInt.fromI32(0);

    user.save();
  }

  // Create LendingDesk instance
  const lendingDesk = new LendingDesk(event.params.lendingDeskId.toString());

  lendingDesk.erc20 = event.params.erc20.toHex();
  lendingDesk.owner = event.params.owner.toHex();
  lendingDesk.status = "Active";
  lendingDesk.balance = event.params.initialBalance;
  lendingDesk.loansCount = BigInt.fromI32(0);
  lendingDesk.loansDefaultedCount = BigInt.fromI32(0);
  lendingDesk.loansResolvedCount = BigInt.fromI32(0);
  lendingDesk.netLiquidityIssued = BigInt.fromI32(0);
  lendingDesk.netProfit = BigInt.fromI32(0);
  lendingDesk.amountBorrowed = BigInt.fromI32(0);

  lendingDesk.save();

  // Create NftCollectionErc20 instances
  for (let i = 0; i < event.params.loanConfigs.length; i++) {
    const loanConfigStruct = event.params.loanConfigs[i];

    // Create NftCollectionErc20 instance
    const nftCollectionErc20 = new NftCollectionErc20(
      loanConfigStruct.nftCollection.toHex() + "-" + event.params.erc20.toHex()
    );
    nftCollectionErc20.nftCollection = loanConfigStruct.nftCollection.toHex();
    nftCollectionErc20.erc20 = event.params.erc20.toHex();
    nftCollectionErc20.save();
  }

  // Increment LendingDesk count
  protocolInfo.lendingDesksCount = protocolInfo.lendingDesksCount.plus(
    BigInt.fromI32(1)
  );
  protocolInfo.save();
}

export function handleLendingDeskLoanConfigsSet(
  event: LendingDeskLoanConfigsSet
): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  for (let i = 0; i < event.params.loanConfigs.length; i++) {
    const loanConfigStruct = event.params.loanConfigs[i];

    // Create LoanConfig instance
    const loanConfig = new LoanConfig(
      event.params.lendingDeskId.toString() +
        "-" +
        loanConfigStruct.nftCollection.toHex()
    );

    loanConfig.active = true;
    loanConfig.lendingDesk = event.params.lendingDeskId.toString();
    loanConfig.nftCollection = loanConfigStruct.nftCollection.toHex();
    loanConfig.minAmount = loanConfigStruct.minAmount;
    loanConfig.maxAmount = loanConfigStruct.maxAmount;
    loanConfig.minDuration = loanConfigStruct.minDuration;
    loanConfig.maxDuration = loanConfigStruct.maxDuration;
    loanConfig.minInterest = loanConfigStruct.minInterest;
    loanConfig.maxInterest = loanConfigStruct.maxInterest;

    loanConfig.save();

    let nftCollection = NftCollection.load(
      loanConfigStruct.nftCollection.toHex()
    );
    if (!nftCollection) {
      // Create NftCollection instance
      nftCollection = new NftCollection(loanConfigStruct.nftCollection.toHex());
      nftCollection.activeLoanConfigsCount = BigInt.fromI32(1);

      // Increment NftCollection count
      protocolInfo.nftCollectionsCount = protocolInfo.nftCollectionsCount.plus(
        BigInt.fromI32(1)
      );
      protocolInfo.save();
    } else {
      // Increase nftCollectionCount in protocolInfo if activeLoanConfigsCount was 0
      if (nftCollection.activeLoanConfigsCount.lt(BigInt.fromI32(1))) {
        protocolInfo.nftCollectionsCount =
          protocolInfo.nftCollectionsCount.plus(BigInt.fromI32(1));
        protocolInfo.save();
      }

      nftCollection.activeLoanConfigsCount = BigInt.fromU64(
        nftCollection.loanConfigs
          .load()
          .filter((loanConfig) => loanConfig.active).length
      );
    }
    nftCollection.save();
  }
}

export function handleLendingDeskLoanConfigRemoved(
  event: LendingDeskLoanConfigRemoved
): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;
  const lendingDesk = LendingDesk.load(event.params.lendingDeskId.toString());
  if (!lendingDesk) return;
  const nftCollection = NftCollection.load(event.params.nftCollection.toHex());
  if (!nftCollection) return;

  store.remove(
    "LoanConfig",
    event.params.lendingDeskId.toString() +
      "-" +
      event.params.nftCollection.toHex()
  );

  // Update nftCollection's activeLoanConfigsCount
  nftCollection.activeLoanConfigsCount =
    nftCollection.activeLoanConfigsCount.minus(BigInt.fromI32(1));
  nftCollection.save();

  if (nftCollection.activeLoanConfigsCount.lt(BigInt.fromI32(1))) {
    protocolInfo.nftCollectionsCount = protocolInfo.nftCollectionsCount.minus(
      BigInt.fromI32(1)
    );
    protocolInfo.save();
  }
}

export function handleLendingDeskLiquidityDeposited(
  event: LendingDeskLiquidityDeposited
): void {
  const lendingDesk = LendingDesk.load(event.params.lendingDeskId.toString());
  if (!lendingDesk) return;

  lendingDesk.balance = lendingDesk.balance.plus(event.params.amountDeposited);
  lendingDesk.save();
}

export function handleLendingDeskLiquidityWithdrawn(
  event: LendingDeskLiquidityWithdrawn
): void {
  const lendingDesk = LendingDesk.load(event.params.lendingDeskId.toString());
  if (!lendingDesk) return;

  lendingDesk.balance = lendingDesk.balance.minus(event.params.amountWithdrawn);
  lendingDesk.save();
}

export function handleLendingDeskStateSet(event: LendingDeskStateSet): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;
  const lendingDesk = LendingDesk.load(event.params.lendingDeskId.toString());
  if (!lendingDesk) return;
  const erc20 = Erc20.load(lendingDesk.erc20);
  if (!erc20) return;

  const activeLendingDesksCount = erc20.lendingDesks
    .load()
    .filter((desk) => desk.status == "Active").length;

  if (event.params.freeze) {
    lendingDesk.status = "Frozen";
    protocolInfo.lendingDesksCount = protocolInfo.lendingDesksCount.minus(
      BigInt.fromI32(1)
    );

    const loanConfigs = lendingDesk.loanConfigs.load();
    // Set all loanConfigs to inactive
    for (let i = 0; i < loanConfigs.length; i++) {
      const loanConfig = loanConfigs[i];
      loanConfig.active = false;
      loanConfig.save();

      const nftCollection = NftCollection.load(loanConfig.nftCollection);
      if (!nftCollection) continue;

      nftCollection.activeLoanConfigsCount =
        nftCollection.activeLoanConfigsCount.minus(BigInt.fromI32(1));
      nftCollection.save();

      if (nftCollection.activeLoanConfigsCount.lt(BigInt.fromI32(1)))
        protocolInfo.nftCollectionsCount =
          protocolInfo.nftCollectionsCount.minus(BigInt.fromI32(1));
    }

    // If there was only 1 active lending desk for this ERC20 before, decrement erc20sCount
    if (activeLendingDesksCount == 1)
      protocolInfo.erc20sCount = protocolInfo.erc20sCount.minus(
        BigInt.fromI32(1)
      );
  } else {
    lendingDesk.status = "Active";
    protocolInfo.lendingDesksCount = protocolInfo.lendingDesksCount.plus(
      BigInt.fromI32(1)
    );

    const loanConfigs = lendingDesk.loanConfigs.load();

    // Set all loanConfigs to active
    for (let i = 0; i < loanConfigs.length; i++) {
      const loanConfig = loanConfigs[i];
      loanConfig.active = true;
      loanConfig.save();

      const nftCollection = NftCollection.load(loanConfigs[i].nftCollection);
      if (!nftCollection) continue;

      // Increase nftCollectionCount in protocolInfo if it was 0
      if (nftCollection.activeLoanConfigsCount.lt(BigInt.fromI32(1)))
        protocolInfo.nftCollectionsCount =
          protocolInfo.nftCollectionsCount.plus(BigInt.fromI32(1));

      // Update nftCollection's activeLoanConfigsCount
      nftCollection.activeLoanConfigsCount =
        nftCollection.activeLoanConfigsCount.plus(BigInt.fromI32(1));
      nftCollection.save();
    }

    // If there were no active lending desks for this ERC20 before, increment erc20sCount
    if (!activeLendingDesksCount)
      protocolInfo.erc20sCount = protocolInfo.erc20sCount.plus(
        BigInt.fromI32(1)
      );
  }

  lendingDesk.save();
  protocolInfo.save();
}

// Loan related events
export function handleNewLoanInitialized(event: NewLoanInitialized): void {
  // Load entities
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;
  const lendingDesk = LendingDesk.load(event.params.lendingDeskId.toString());
  if (!lendingDesk) return;
  const lender = User.load(lendingDesk.owner);
  if (!lender) return;

  // Create borrower User instance if doesn't exist
  if (!User.load(event.params.borrower.toHex())) {
    const borrower = new User(event.params.borrower.toHex());

    borrower.loansIssuedCount = BigInt.fromI32(0);
    borrower.loansIssuedResolvedCount = BigInt.fromI32(0);
    borrower.loansIssuedDefaultedCount = BigInt.fromI32(0);
    borrower.loansTakenCount = BigInt.fromI32(1);
    borrower.loansTakenResolvedCount = BigInt.fromI32(0);
    borrower.loansTakenDefaultedCount = BigInt.fromI32(0);

    borrower.save();
  }

  const loan = new Loan(event.params.loanId.toString());

  // Enter loan details
  loan.lendingDesk = event.params.lendingDeskId.toString();
  loan.amount = event.params.amount;
  loan.amountPaidBack = BigInt.fromU32(0);
  loan.duration = event.params.duration;
  loan.startTime = event.block.timestamp;
  loan.status = "Active";
  loan.borrower = event.params.borrower.toHex();
  loan.nftCollection = event.params.nftCollection.toHex();
  loan.nftId = event.params.nftId;
  loan.interest = event.params.interest;
  loan.lender = lendingDesk.owner;

  // Save entity
  loan.save();

  // Update lender stats
  lender.loansIssuedCount = lender.loansIssuedCount.plus(BigInt.fromI32(1));
  lender.save();

  // Increment Loan count
  protocolInfo.loansCount = protocolInfo.loansCount.plus(BigInt.fromI32(1));
  protocolInfo.save();

  // Update lending desk stats
  lendingDesk.loansCount = lendingDesk.loansCount.plus(BigInt.fromI32(1));
  lendingDesk.netLiquidityIssued = lendingDesk.netLiquidityIssued.plus(
    event.params.amount
  );
  lendingDesk.amountBorrowed = lendingDesk.amountBorrowed.plus(
    event.params.amount
  );
  lendingDesk.balance = lendingDesk.balance.minus(event.params.amount);
  lendingDesk.save();
}

export function handleDefaultedLoanLiquidated(
  event: DefaultedLoanLiquidated
): void {
  // Load entities
  const loan = Loan.load(event.params.loanId.toString());
  if (!loan) return;
  const lender = User.load(loan.lender);
  if (!lender) return;
  const borrower = User.load(loan.borrower);
  if (!borrower) return;
  const lendingDesk = LendingDesk.load(loan.lendingDesk);
  if (!lendingDesk) return;

  loan.status = "Defaulted";
  loan.save();

  // Update users' stats
  lender.loansIssuedDefaultedCount = lender.loansIssuedDefaultedCount.plus(
    BigInt.fromI32(1)
  );
  lender.save();
  borrower.loansTakenDefaultedCount = borrower.loansTakenDefaultedCount.plus(
    BigInt.fromI32(1)
  );
  borrower.save();

  // Update lending desk stats
  lendingDesk.loansDefaultedCount = lendingDesk.loansDefaultedCount.plus(
    BigInt.fromI32(1)
  );
  lendingDesk.amountBorrowed = lendingDesk.amountBorrowed.minus(
    loan.amount.minus(loan.amountPaidBack)
  );
  lendingDesk.save();
}

export function handleLoanPaymentMade(event: LoanPaymentMade): void {
  // Load entities
  const loan = Loan.load(event.params.loanId.toString());
  if (!loan) return;
  const lender = User.load(loan.lender);
  if (!lender) return;
  const borrower = User.load(loan.borrower);
  if (!borrower) return;
  const lendingDesk = LendingDesk.load(loan.lendingDesk);
  if (!lendingDesk) return;

  loan.amountPaidBack = loan.amountPaidBack.plus(event.params.amountPaid);
  if (event.params.resolved) loan.status = "Resolved";
  loan.save();

  // Update lender stats
  lender.loansIssuedResolvedCount = lender.loansIssuedResolvedCount.plus(
    BigInt.fromI32(1)
  );
  lender.save();
  borrower.loansTakenResolvedCount = borrower.loansTakenResolvedCount.plus(
    BigInt.fromI32(1)
  );
  borrower.save();

  // Update lending desk stats
  if (event.params.resolved){
    lendingDesk.loansResolvedCount = lendingDesk.loansResolvedCount.plus(
      BigInt.fromI32(1)
    )
  }
  lendingDesk.balance = lendingDesk.balance.plus(event.params.amountPaid);
  lendingDesk.amountBorrowed = lendingDesk.amountBorrowed.minus(
    event.params.amountPaid
  );
  lendingDesk.save();
}

// Protocol level parameters related events

export function handleLoanOriginationFeeSet(
  event: LoanOriginationFeeSet
): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  protocolInfo.loanOriginationFee = event.params.loanOriginationFee;
  protocolInfo.save();
}

export function handlePaused(event: Paused): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  protocolInfo.paused = true;
  protocolInfo.save();
}

export function handleUnpaused(event: Unpaused): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  protocolInfo.paused = false;
  protocolInfo.save();
}

export function handleProtocolInitialized(event: ProtocolInitialized): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  protocolInfo.obligationNotes = event.params.obligationNotes;
  protocolInfo.lendingKeys = event.params.lendingKeys;

  protocolInfo.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // Contract deployment, create ProtocolInfo entity
  if (event.params.oldOwner == Address.zero()) {
    const protocolInfo = new ProtocolInfo("0");
    protocolInfo.owner = event.params.newOwner;
    protocolInfo.paused = false;

    // Dummy values, will populate properly through ProtocolInitialized, LoanOriginationFeeSet and PlatformWalletSet events
    protocolInfo.loanOriginationFee = BigInt.fromU32(0);
    protocolInfo.obligationNotes = Address.zero();
    protocolInfo.lendingKeys = Address.zero();
    protocolInfo.platformWallet = Address.zero();
    // Initialize counts to 0
    protocolInfo.lendingDesksCount = BigInt.fromU32(0);
    protocolInfo.loansCount = BigInt.fromU32(0);
    protocolInfo.nftCollectionsCount = BigInt.fromU32(0);
    protocolInfo.erc20sCount = BigInt.fromU32(0);

    protocolInfo.save();
  } else {
    // Ownership transfer, update owner
    const protocolInfo = ProtocolInfo.load("0");
    if (!protocolInfo) return;

    protocolInfo.owner = event.params.newOwner;
    protocolInfo.save();
  }
}

export function handlePlatformWalletSet(event: PlatformWalletSet): void {
  const protocolInfo = ProtocolInfo.load("0");
  if (!protocolInfo) return;

  protocolInfo.platformWallet = event.params.platformWallet;
  protocolInfo.save();
}
