import { assert, beforeAll, test } from "matchstick-as";
import {
  createPausedEvent,
  createUnpausedEvent,
  initializeProtocol,
} from "../utils";
import { handlePaused, handleUnpaused } from "../../src/nfty-finance";
import { ProtocolInfo } from "../../generated/schema";

beforeAll(() => {
  initializeProtocol();
  handlePaused(createPausedEvent());
});

test("Updates ProtocolInfo on Unpaused", () => {
  // Assert ProtocolInfo' initial state
  let protocolInfo = ProtocolInfo.load("0");
  assert.assertNotNull(protocolInfo);
  if (!protocolInfo) return;
  assert.booleanEquals(protocolInfo.paused, true);

  handleUnpaused(createUnpausedEvent());

  // ProtocolInfo got updated
  protocolInfo = ProtocolInfo.load("0");
  assert.assertNotNull(protocolInfo);
  if (!protocolInfo) return;
  assert.booleanEquals(protocolInfo.paused, false);
});
