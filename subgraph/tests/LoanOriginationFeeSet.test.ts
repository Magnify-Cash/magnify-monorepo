import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createNewLoanOriginationFeeSetEvent,
  intialOwnershipTransfer,
} from "./utils";
import { handleLoanOriginationFeeSet } from "../src/nfty-finance";
import { Address, BigInt } from "@graphprotocol/graph-ts";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);

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
    const event = createNewLoanOriginationFeeSetEvent(nftyFinance, 100);
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
