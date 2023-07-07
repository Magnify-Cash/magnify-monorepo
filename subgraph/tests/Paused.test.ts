import { assert, beforeAll, describe, test } from "matchstick-as";
import { createPausedEvent, intialOwnershipTransfer } from "./utils";
import { handlePaused } from "../src/nfty-finance";
import { ProtocolParams } from "../generated/schema";
import { nftyFinance } from "./consts";

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
