import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import {
  createLendingDeskDissolvedEvent,
  initializeLendingDesk,
} from "../utils";
import { handleLendingDeskDissolved } from "../../src/nfty-finance";
import { erc20Address, lendingDeskId, lendingDeskOwner } from "../consts";

beforeAll(() => {
  initializeLendingDesk(lendingDeskId, lendingDeskOwner, erc20Address, []);
});

test("Should set status of LendingDesk to Dissolved on LendingDeskDissolved", () => {
  // Assert initial state of LendingDesk
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "status",
    "Active"
  );

  // Handle event
  handleLendingDeskDissolved(createLendingDeskDissolvedEvent(lendingDeskId));

  // Assert LendingDesk got updated
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "status",
    "Dissolved"
  );
});
