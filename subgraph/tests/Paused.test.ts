import { assert, beforeAll, describe, test } from "matchstick-as";
import { createPausedEvent, intialOwnershipTransfer } from "./utils";
import { Address } from "@graphprotocol/graph-ts";
import { handlePaused } from "../src/nfty-finance";
import { ProtocolParams } from "../generated/schema";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);

describe("Paused", () => {
  beforeAll(() => {
    intialOwnershipTransfer(nftyFinance);
  });

  test("Updates ProtocolParams on Paused", () => {
    // Assert ProtocolParams' initial state
    let protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);
    if (!protocolParams) return;
    assert.booleanEquals(protocolParams.paused, false);

    const event = createPausedEvent(nftyFinance);
    handlePaused(event);

    // ProtocolParams got updated
    protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);
    if (!protocolParams) return;
    assert.booleanEquals(protocolParams.paused, true);
  });
});
