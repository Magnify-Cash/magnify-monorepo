import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import { createPlatformWalletSetEvent, initializeProtocol } from "../utils";
import { platformWallet } from "../consts";
import { handlePlatformWalletSet } from "../../src/nfty-finance";
import { Address } from "@graphprotocol/graph-ts";

beforeAll(() => {
  initializeProtocol();
});

test("Should update ProtocolInfo on PlatformWalletSet", () => {
  // Assert ProtocolInfo' initial state
  assert.fieldEquals(
    "ProtocolInfo",
    "0",
    "platformWallet",
    platformWallet.toHexString()
  );

  // Handle event
  const newPlatformWallet = Address.fromString(
    "0x0Fd822382834BB3d66ACeF52c27E4090f8763c48"
  );
  handlePlatformWalletSet(createPlatformWalletSetEvent(newPlatformWallet));

  // Assert ProtocolInfo got updated
  assert.fieldEquals(
    "ProtocolInfo",
    "0",
    "platformWallet",
    newPlatformWallet.toHexString()
  );
});
