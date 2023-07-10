import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  DefaultedLoanLiquidated,
  LendingDeskDissolved,
  LendingDeskLiquidityAdded,
  LendingDeskLiquidityWithdrawn,
  LendingDeskLoanConfigRemoved,
  LendingDeskLoanConfigsSet,
  LendingDeskLoanConfigsSetLoanConfigsStruct,
  LendingDeskStateSet,
  LoanOriginationFeeSet,
  LoanPaymentMade,
  NewLendingDeskInitialized,
  NewLoanInitialized,
  OwnershipTransferred,
  Paused,
  PlatformFeesWithdrawn,
  ProtocolInitialized,
  Unpaused,
} from "../generated/NFTYFinance/NFTYFinance";
import {
  createMockedFunction,
  newTypedMockEvent,
  newTypedMockEventWithParams,
} from "matchstick-as";
import {
  handleLendingDeskLoanConfigsSet,
  handleLoanOriginationFeeSet,
  handleNewLendingDeskInitialized,
  handleNewLoanInitialized,
  handleOwnershipTransferred,
  handleProtocolInitialized,
} from "../src/nfty-finance";
import {
  lendingKeys,
  loanOriginationFee,
  obligationNotes,
  platformFee,
  promissoryNotes,
  protocolOwner,
} from "./consts";

export const createOwnershipTransferredEvent = (
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred =>
  newTypedMockEventWithParams<OwnershipTransferred>([
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    ),
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner)),
  ]);

export const createLoanOriginationFeeSetEvent = (
  loanOriginationFee: number
): LoanOriginationFeeSet =>
  newTypedMockEventWithParams<LoanOriginationFeeSet>([
    new ethereum.EventParam(
      "loanOriginationFee",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>loanOriginationFee)
    ),
  ]);

export const createProtocolInitializedEvent = (
  promissoryNotes: Address,
  obligationNotes: Address,
  lendingKeys: Address
): ProtocolInitialized =>
  newTypedMockEventWithParams<ProtocolInitialized>([
    new ethereum.EventParam(
      "promissoryNotes",
      ethereum.Value.fromAddress(promissoryNotes)
    ),
    new ethereum.EventParam(
      "obligationNotes",
      ethereum.Value.fromAddress(obligationNotes)
    ),
    new ethereum.EventParam(
      "lendingKeys",
      ethereum.Value.fromAddress(lendingKeys)
    ),
  ]);

export const initializeProtocol = (): void => {
  // 3 events emitted on contract deployment
  handleOwnershipTransferred(
    createOwnershipTransferredEvent(
      // this is contract initialization so previousOwner is zero address
      Address.zero(),
      protocolOwner
    )
  );
  handleLoanOriginationFeeSet(
    createLoanOriginationFeeSetEvent(loanOriginationFee)
  );
  handleProtocolInitialized(
    createProtocolInitializedEvent(
      promissoryNotes,
      obligationNotes,
      lendingKeys
    )
  );
};

export const createPausedEvent = (): Paused => newTypedMockEvent<Paused>();

export const createUnpausedEvent = (): Unpaused =>
  newTypedMockEvent<Unpaused>();

export const createNewLendingDeskInitializedEvent = (
  owner: Address,
  erc20: Address,
  id: number
): NewLendingDeskInitialized =>
  newTypedMockEventWithParams<NewLendingDeskInitialized>([
    // @ts-ignore
    new ethereum.EventParam("lendingDeskId", ethereum.Value.fromI32(<i32>id)),
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)),
    new ethereum.EventParam("erc20", ethereum.Value.fromAddress(erc20)),
  ]);

export class TestLoanConfig {
  nftCollection: Address;
  nftCollectionIsErc1155: boolean;
  minAmount: BigInt;
  maxAmount: BigInt;
  minDuration: BigInt;
  maxDuration: BigInt;
  minInterest: BigInt;
  maxInterest: BigInt;
}

export const createLendingDeskLoanConfigsSetEvent = (
  lendingDeskId: number,
  loanConfigs: TestLoanConfig[]
): LendingDeskLoanConfigsSet =>
  newTypedMockEventWithParams<LendingDeskLoanConfigsSet>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
    new ethereum.EventParam(
      "loanConfigs",
      ethereum.Value.fromTupleArray(
        loanConfigs.map<ethereum.Tuple>((x) => {
          const struct = new LendingDeskLoanConfigsSetLoanConfigsStruct(0);

          struct.push(ethereum.Value.fromAddress(x.nftCollection));
          struct.push(ethereum.Value.fromBoolean(x.nftCollectionIsErc1155));
          struct.push(ethereum.Value.fromUnsignedBigInt(x.minAmount));
          struct.push(ethereum.Value.fromUnsignedBigInt(x.maxAmount));
          struct.push(ethereum.Value.fromUnsignedBigInt(x.minInterest));
          struct.push(ethereum.Value.fromUnsignedBigInt(x.maxInterest));
          struct.push(ethereum.Value.fromUnsignedBigInt(x.minDuration));
          struct.push(ethereum.Value.fromUnsignedBigInt(x.maxDuration));

          return struct;
        })
      )
    ),
  ]);

export const initializeLendingDesk = (
  lendingDeskId: number,
  owner: Address,
  erc20: Address,
  loanConfigs: TestLoanConfig[]
): void => {
  initializeProtocol();

  const erc20Name = "USD Coin";
  const erc20Symbol = "USDC";
  const erc20Decimals = 18;

  createMockedFunction(erc20, "name", "name():(string)")
    .withArgs([])
    .returns([ethereum.Value.fromString(erc20Name)]);
  createMockedFunction(erc20, "symbol", "symbol():(string)")
    .withArgs([])
    .returns([ethereum.Value.fromString(erc20Symbol)]);
  createMockedFunction(erc20, "decimals", "decimals():(uint8)")
    .withArgs([])
    // @ts-ignore
    .returns([ethereum.Value.fromI32(<i32>erc20Decimals)]);

  // Create lending desk
  const newLendingDeskInitializedEvent = createNewLendingDeskInitializedEvent(
    owner,
    erc20,
    lendingDeskId
  );
  handleNewLendingDeskInitialized(newLendingDeskInitializedEvent);

  // Set loan configs
  const lendingDeskLoanConfigsSetEvent = createLendingDeskLoanConfigsSetEvent(
    lendingDeskId,
    loanConfigs
  );
  handleLendingDeskLoanConfigsSet(lendingDeskLoanConfigsSetEvent);
};

export const createLendingDeskLoanConfigRemovedEvent = (
  lendingDeskId: number,
  nftCollection: Address
): LendingDeskLoanConfigRemoved =>
  newTypedMockEventWithParams<LendingDeskLoanConfigRemoved>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
    new ethereum.EventParam(
      "nftCollection",
      ethereum.Value.fromAddress(nftCollection)
    ),
  ]);

export const createLendingDeskLiquidityAddedEvent = (
  lendingDeskId: number,
  amountAdded: BigInt
): LendingDeskLiquidityAdded =>
  newTypedMockEventWithParams<LendingDeskLiquidityAdded>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
    new ethereum.EventParam(
      "amountAdded",
      ethereum.Value.fromUnsignedBigInt(amountAdded)
    ),
  ]);

export const createLendingDeskLiquidityWithdrawEvent = (
  lendingDeskId: number,
  amountWithdrawn: BigInt
): LendingDeskLiquidityWithdrawn =>
  newTypedMockEventWithParams<LendingDeskLiquidityWithdrawn>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
    new ethereum.EventParam(
      "amountWithdrawn",
      ethereum.Value.fromUnsignedBigInt(amountWithdrawn)
    ),
  ]);

export const createLendingDeskStateSetEvent = (
  lendingDeskId: number,
  freeze: boolean
): LendingDeskStateSet =>
  newTypedMockEventWithParams<LendingDeskStateSet>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
    new ethereum.EventParam("freeze", ethereum.Value.fromBoolean(freeze)),
  ]);

export const createNewLoanInitializedEvent = (
  lendingDeskId: number,
  loanId: number,
  borrower: Address,
  nftCollection: Address,
  nftId: number,
  amount: BigInt,
  duration: BigInt,
  interest: BigInt,
  platformFee: BigInt
): NewLoanInitialized =>
  newTypedMockEventWithParams<NewLoanInitialized>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
    new ethereum.EventParam(
      "loanId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>loanId)
    ),
    new ethereum.EventParam("borrower", ethereum.Value.fromAddress(borrower)),
    new ethereum.EventParam(
      "nftCollection",
      ethereum.Value.fromAddress(nftCollection)
    ),
    new ethereum.EventParam(
      "nftId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>nftId)
    ),
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromUnsignedBigInt(amount)
    ),
    new ethereum.EventParam(
      "duration",
      ethereum.Value.fromUnsignedBigInt(duration)
    ),
    new ethereum.EventParam(
      "interest",
      ethereum.Value.fromUnsignedBigInt(interest)
    ),
    new ethereum.EventParam(
      "platformFee",
      ethereum.Value.fromUnsignedBigInt(platformFee)
    ),
  ]);

export const createLendingDeskDissolvedEvent = (
  lendingDeskId: number
): LendingDeskDissolved =>
  newTypedMockEventWithParams<LendingDeskDissolved>([
    new ethereum.EventParam(
      "lendingDeskId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>lendingDeskId)
    ),
  ]);

export const initializeLoan = (
  lendingDeskId: number,
  lendingDeskOwner: Address,
  erc20Address: Address,
  loanConfigs: TestLoanConfig[],
  loanId: number,
  borrower: Address,
  nftCollection: Address,
  nftId: number,
  amount: BigInt,
  duration: BigInt,
  interest: BigInt,
  platformFee: BigInt
): void => {
  initializeLendingDesk(
    lendingDeskId,
    lendingDeskOwner,
    erc20Address,
    loanConfigs
  );

  handleNewLoanInitialized(
    createNewLoanInitializedEvent(
      lendingDeskId,
      loanId,
      borrower,
      nftCollection,
      nftId,
      amount,
      duration,
      interest,
      platformFee
    )
  );
};

export const createLoanPaymentMadeEvent = (
  loanId: number,
  amount: BigInt,
  resolved: boolean
): LoanPaymentMade =>
  newTypedMockEventWithParams<LoanPaymentMade>([
    new ethereum.EventParam(
      "loanId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>loanId)
    ),
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromUnsignedBigInt(amount)
    ),
    new ethereum.EventParam("resolved", ethereum.Value.fromBoolean(resolved)),
  ]);

export const createDefaultedLoanLiquidatedEvent = (
  loanId: number
): DefaultedLoanLiquidated =>
  newTypedMockEventWithParams<DefaultedLoanLiquidated>([
    new ethereum.EventParam(
      "loanId",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>loanId)
    ),
  ]);

export const createPlatformFeesWithdrawnEvent = (
  erc20s: Address[],
  receiver: Address
): PlatformFeesWithdrawn =>
  newTypedMockEventWithParams<PlatformFeesWithdrawn>([
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver)),
    new ethereum.EventParam("erc20s", ethereum.Value.fromAddressArray(erc20s)),
  ]);
