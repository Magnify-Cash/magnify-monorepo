import { assert, beforeAll, test } from "matchstick-as";
import {
  createPausedEvent,
  createUnpausedEvent,
  initializeProtocol,
} from "../utils";
import { handlePaused, handleUnpaused } from "../../src/nfty-finance";
import { ProtocolParams } from "../../generated/schema";

beforeAll(() => {
  initializeProtocol();
  handlePaused(createPausedEvent());
});

test("Updates ProtocolParams on Unpaused", () => {
  // Assert ProtocolParams' initial state
  let protocolParams = ProtocolParams.load("0");
  assert.assertNotNull(protocolParams);
  if (!protocolParams) return;
  assert.booleanEquals(protocolParams.paused, true);

  handleUnpaused(createUnpausedEvent());

  // ProtocolParams got updated
  protocolParams = ProtocolParams.load("0");
  assert.assertNotNull(protocolParams);
  if (!protocolParams) return;
  assert.booleanEquals(protocolParams.paused, false);
});
