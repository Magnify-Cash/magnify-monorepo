import { assert, beforeAll, test } from "matchstick-as";
import { createPausedEvent, initializeProtocol } from "./utils";
import { handlePaused } from "../src/nfty-finance";
import { ProtocolParams } from "../generated/schema";

beforeAll(() => {
  initializeProtocol();
});

test("Updates ProtocolParams on Paused", () => {
  // Assert ProtocolParams' initial state
  let protocolParams = ProtocolParams.load("0");
  assert.assertNotNull(protocolParams);
  if (!protocolParams) return;
  assert.booleanEquals(protocolParams.paused, false);

  handlePaused(createPausedEvent());

  // ProtocolParams got updated
  protocolParams = ProtocolParams.load("0");
  assert.assertNotNull(protocolParams);
  if (!protocolParams) return;
  assert.booleanEquals(protocolParams.paused, true);
});
