import {
  assert,
  beforeAll,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createNewLoanOriginationFeeSetEvent,
  createNewOwnershipTransferredEvent,
} from "./utils";
import {
  handleLoanOriginationFeeSet,
  handleOwnershipTransferred,
} from "../src/nfty-finance";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);

describe("OwnershipTransferred", () => {
  beforeAll(() => {
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
