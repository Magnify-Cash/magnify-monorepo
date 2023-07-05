import { assert, beforeAll, describe, test } from "matchstick-as";
import {
  createPausedEvent,
  createUnpausedEvent,
  intialOwnershipTransfer,
} from "./utils";
import { Address } from "@graphprotocol/graph-ts";
import { handlePaused, handleUnpaused } from "../src/nfty-finance";
import { ProtocolParams } from "../generated/schema";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);

describe("Unpaused", () => {
  beforeAll(() => {
    intialOwnershipTransfer(nftyFinance);
    const event = createPausedEvent(nftyFinance);
    handlePaused(event);
  });

  test("Updates ProtocolParams on Unpaused", () => {
    // Assert ProtocolParams' initial state
    let protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);
    if (!protocolParams) return;
    assert.booleanEquals(protocolParams.paused, true);

    const event = createUnpausedEvent(nftyFinance);
    handleUnpaused(event);

    // ProtocolParams got updated
    protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);
    if (!protocolParams) return;
    assert.booleanEquals(protocolParams.paused, false);
  });
});
