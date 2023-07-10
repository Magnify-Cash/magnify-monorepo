import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  handleLoanOriginationFeeSet,
  handleOwnershipTransferred,
  handleProtocolInitialized,
} from "../../src/nfty-finance";
import {
  createLoanOriginationFeeSetEvent,
  createOwnershipTransferredEvent,
  createProtocolInitializedEvent,
} from "../utils";
import {
  lendingKeys,
  loanOriginationFee,
  obligationNotes,
  promissoryNotes,
  protocolOwner,
} from "../consts";
import { ProtocolParams } from "../../generated/schema";
import { assert, test } from "matchstick-as";

test("Should create a new ProtocolParams entity on contract initialization", () => {
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

  // Assert correct entity is created
  const protocolParams = ProtocolParams.load("0");
  assert.assertNotNull(protocolParams);
  if (!protocolParams) return;

  assert.bytesEquals(protocolParams.owner, protocolOwner);
  assert.bytesEquals(protocolParams.promissoryNotes, promissoryNotes);
  assert.bytesEquals(protocolParams.obligationNotes, obligationNotes);
  assert.bytesEquals(protocolParams.lendingKeys, lendingKeys);
  assert.booleanEquals(protocolParams.paused, false);
  assert.bigIntEquals(
    protocolParams.loanOriginationFee,
    BigInt.fromI32(loanOriginationFee)
  );
});
