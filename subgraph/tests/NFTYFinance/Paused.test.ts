import { assert, beforeAll, test } from "matchstick-as";
import { createPausedEvent, initializeProtocol } from "../utils";
import { handlePaused } from "../../src/nfty-finance";
import { ProtocolInfo } from "../../generated/schema";

beforeAll(() => {
  initializeProtocol();
});

test("Updates ProtocolInfo on Paused", () => {
  // Assert ProtocolInfo' initial state
  let protocolInfo = ProtocolInfo.load("0");
  assert.assertNotNull(protocolInfo);
  if (!protocolInfo) return;
  assert.booleanEquals(protocolInfo.paused, false);

  handlePaused(createPausedEvent());

  // ProtocolInfo got updated
  protocolInfo = ProtocolInfo.load("0");
  assert.assertNotNull(protocolInfo);
  if (!protocolInfo) return;
  assert.booleanEquals(protocolInfo.paused, true);
});
