import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createLoanOriginationFeeSetEvent,
  intialOwnershipTransfer,
} from "./utils";
import { handleLoanOriginationFeeSet } from "../src/nfty-finance";
import { BigInt } from "@graphprotocol/graph-ts";
import { nftyFinance } from "./consts";

describe("OwnershipTransferred", () => {
  beforeAll(() => {
    intialOwnershipTransfer(nftyFinance);
  });

  test("Should update ProtocolParams on LoanOriginationFeeSet", () => {
    // Assert ProtocolParams' initial state
    assert.fieldEquals(
      "ProtocolParams",
      "0",
      "loanOriginationFee",
      // 200 bps
      BigInt.fromI32(200).toString()
    );

    // Handle event
    const event = createLoanOriginationFeeSetEvent(nftyFinance, 100);
    handleLoanOriginationFeeSet(event);

    // Assert ProtocolParams got updated
    assert.fieldEquals(
      "ProtocolParams",
      "0",
      "loanOriginationFee",
      // 100 bps
      BigInt.fromI32(100).toString()
    );
  });
});
