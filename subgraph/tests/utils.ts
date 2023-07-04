import { Address, ethereum } from "@graphprotocol/graph-ts";
import { OwnershipTransferred } from "../generated/NFTYFinance/NFTYFinance";
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
