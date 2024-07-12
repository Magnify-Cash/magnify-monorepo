import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import { createLoanOriginationFeeSetEvent, initializeProtocol } from "../utils";
import { handleLoanOriginationFeeSet } from "../../src/magnify-cash";
import { BigInt } from "@graphprotocol/graph-ts";

beforeAll(() => {
  initializeProtocol();
});

test("Should update ProtocolInfo on LoanOriginationFeeSet", () => {
  // Assert ProtocolInfo' initial state
  assert.fieldEquals(
    "ProtocolInfo",
    "0",
    "loanOriginationFee",
    // 200 bps
    BigInt.fromI32(200).toString()
  );

  // Handle event
  handleLoanOriginationFeeSet(createLoanOriginationFeeSetEvent(100));

  // Assert ProtocolInfo got updated
  assert.fieldEquals(
    "ProtocolInfo",
    "0",
    "loanOriginationFee",
    // 100 bps
    BigInt.fromI32(100).toString()
  );
});
