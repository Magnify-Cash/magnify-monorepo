import { Address, ethereum } from "@graphprotocol/graph-ts";
import {
  LoanOriginationFeeSet,
  OwnershipTransferred,
} from "../generated/NFTYFinance/NFTYFinance";
import { newTypedMockEventWithParams } from "matchstick-as";

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
