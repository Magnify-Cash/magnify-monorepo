import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import { createOwnershipTransferredEvent, initializeProtocol } from "../utils";
import { handleOwnershipTransferred } from "../../src/nfty-finance";
import { Address } from "@graphprotocol/graph-ts";
import { protocolOwner } from "../consts";

beforeAll(() => {
  initializeProtocol();
});

test("Should update ProtocolParams' owner on ownership transfer", () => {
  const secondOwner = Address.fromString(
    "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
  );

  // Assert ProtocolParams' initial state
  assert.fieldEquals("ProtocolParams", "0", "owner", protocolOwner.toHex());

  // Handle event
  const event2 = createOwnershipTransferredEvent(protocolOwner, secondOwner);
  handleOwnershipTransferred(event2);

  // Assert ProtocolParams got updated
  assert.fieldEquals("ProtocolParams", "0", "owner", secondOwner.toHex());
});
