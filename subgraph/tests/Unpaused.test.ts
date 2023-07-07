import { assert, beforeAll, describe, test } from "matchstick-as";
import {
  createPausedEvent,
  createUnpausedEvent,
  intialOwnershipTransfer,
} from "./utils";
import { handlePaused, handleUnpaused } from "../src/nfty-finance";
import { ProtocolParams } from "../generated/schema";
import { nftyFinance } from "./consts";

describe("Unpaused", () => {
  beforeAll(() => {
    intialOwnershipTransfer(nftyFinance);
    handlePaused(createPausedEvent(nftyFinance));
  });

  test("Updates ProtocolParams on Unpaused", () => {
    // Assert ProtocolParams' initial state
    let protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);
    if (!protocolParams) return;
    assert.booleanEquals(protocolParams.paused, true);

    handleUnpaused(createUnpausedEvent(nftyFinance));

    // ProtocolParams got updated
    protocolParams = ProtocolParams.load("0");
    assert.assertNotNull(protocolParams);
    if (!protocolParams) return;
    assert.booleanEquals(protocolParams.paused, false);
  });
});
