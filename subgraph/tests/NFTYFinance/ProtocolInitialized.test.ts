import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  handleLoanOriginationFeeSet,
  handleOwnershipTransferred,
  handleProtocolInitialized,
} from "../../src/magnify-cash";
import {
  createLoanOriginationFeeSetEvent,
  createOwnershipTransferredEvent,
  createProtocolInitializedEvent,
} from "../utils";
import {
  lendingKeys,
  loanOriginationFee,
  obligationNotes,
  protocolOwner,
} from "../consts";
import { ProtocolInfo } from "../../generated/schema";
import { assert, test } from "matchstick-as";

test("Should create a new ProtocolInfo entity on contract initialization", () => {
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
      obligationNotes,
      lendingKeys
    )
  );

  // Assert correct entity is created
  const protocolInfo = ProtocolInfo.load("0");
  assert.assertNotNull(protocolInfo);
  if (!protocolInfo) return;

  assert.bytesEquals(protocolInfo.owner, protocolOwner);
  assert.bytesEquals(protocolInfo.obligationNotes, obligationNotes);
  assert.bytesEquals(protocolInfo.lendingKeys, lendingKeys);
  assert.booleanEquals(protocolInfo.paused, false);
  assert.bigIntEquals(
    protocolInfo.loanOriginationFee,
    BigInt.fromI32(loanOriginationFee)
  );
});
