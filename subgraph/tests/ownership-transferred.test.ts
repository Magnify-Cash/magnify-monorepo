import {
  assert,
  afterEach,
  beforeAll,
  clearStore,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { createNewOwnershipTransferredEvent } from "./utils";
import { handleOwnershipTransferred } from "../src/nfty-finance";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ProtocolParams } from "../generated/schema";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);
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

describe("OwnershipTransferred", () => {
  beforeAll(() => {
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
  });

  test("Should create a new ProtocolParams entity on contract initialization", () => {
    const owner = Address.fromString(
      "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
    );

    const event = createNewOwnershipTransferredEvent(
      nftyFinance,
      // this is contract initialization so previousOwner is zero address
      Address.zero(),
      owner
    );
    handleOwnershipTransferred(event);

    // Assert correct entity is created
    const protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);

    assert.bytesEquals(protocolParams!.owner, owner);
    assert.bytesEquals(protocolParams!.promissoryNotes, promissoryNotes);
    assert.bytesEquals(protocolParams!.obligationNotes, obligationNotes);
    assert.bytesEquals(protocolParams!.lendingKeys, lendingKeys);
    assert.booleanEquals(protocolParams!.paused, false);
    assert.bigIntEquals(
      protocolParams!.loanOriginationFee,
      BigInt.fromI32(loanOriginationFee)
    );
  });

  test("Should update ProtocolParams' owner on ownership transfer", () => {
    const firstOwner = Address.fromString(
      "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
    );
    const secondOwner = Address.fromString(
      "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
    );

    // Events
    const event1 = createNewOwnershipTransferredEvent(
      nftyFinance,
      // this is contract initialization so previousOwner is zero address
      Address.zero(),
      firstOwner
    );
    handleOwnershipTransferred(event1);
    const event2 = createNewOwnershipTransferredEvent(
      nftyFinance,
      firstOwner,
      secondOwner
    );
    handleOwnershipTransferred(event2);

    // Assert ProtocolParams got updated
    assert.fieldEquals("ProtocolParams", "0", "owner", secondOwner.toHex());
  });

  afterEach(() => {
    clearStore();
  });
});
