import { Address, ethereum } from "@graphprotocol/graph-ts";
import {
  LoanOriginationFeeSet,
  OwnershipTransferred,
  Paused,
  Unpaused,
} from "../generated/NFTYFinance/NFTYFinance";
import {
  createMockedFunction,
  newTypedMockEvent,
  newTypedMockEventWithParams,
} from "matchstick-as";
import { handleOwnershipTransferred } from "../src/nfty-finance";

export const createNewOwnershipTransferredEvent = (
  nftyFinance: Address,
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred => {
  const event = newTypedMockEventWithParams<OwnershipTransferred>([
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    ),
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner)),
  ]);
  event.address = nftyFinance;
  return event;
};

export const createNewLoanOriginationFeeSetEvent = (
  nftyFinance: Address,
  loanOriginationFee: number
): LoanOriginationFeeSet => {
  const event = newTypedMockEventWithParams<LoanOriginationFeeSet>([
    new ethereum.EventParam(
      "loanOriginationFee",
      // @ts-ignore
      ethereum.Value.fromI32(<i32>loanOriginationFee)
    ),
  ]);
  event.address = nftyFinance;
  return event;
};

export const intialOwnershipTransfer = (nftyFinance: Address): void => {
  const promissoryNotes = Address.fromString(
    "0x90cBa2Bbb19ecc291A12066Fd8329D65FA1f1947"
  );
  const obligationNotes = Address.fromString(
    "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
  );
  const lendingKeys = Address.fromString(
    "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"
  );
  const loanOriginationFee = 200;
  const owner = Address.fromString(
    "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
  );

  // Mock loanOriginationFee
  createMockedFunction(
    nftyFinance,
    "loanOriginationFee",
    "loanOriginationFee():(uint256)"
  )
    .withArgs([])
    .returns([ethereum.Value.fromI32(loanOriginationFee)]);

  // Mock promissoryNotes
  createMockedFunction(
    nftyFinance,
    "promissoryNotes",
    "promissoryNotes():(address)"
  )
    .withArgs([])
    .returns([ethereum.Value.fromAddress(promissoryNotes)]);

  // Mock obligationNotes
  createMockedFunction(
    nftyFinance,
    "obligationNotes",
    "obligationNotes():(address)"
  )
    .withArgs([])
    .returns([ethereum.Value.fromAddress(obligationNotes)]);

  // Mock lendingKeys
  createMockedFunction(nftyFinance, "lendingKeys", "lendingKeys():(address)")
    .withArgs([])
    .returns([ethereum.Value.fromAddress(lendingKeys)]);

  // Initial OwnershipTransferred, i.e. contract deployment
  const event = createNewOwnershipTransferredEvent(
    nftyFinance,
    // this is contract initialization so previousOwner is zero address
    Address.zero(),
    owner
  );
  handleOwnershipTransferred(event);
};

export const createNewPausedEvent = (nftyFinance: Address): Paused => {
  const event = newTypedMockEvent<Paused>();
  event.address = nftyFinance;
  return event;
};

export const createNewUnpausedEvent = (nftyFinance: Address): Unpaused => {
  const event = newTypedMockEvent<Unpaused>();
  event.address = nftyFinance;
  return event;
};
