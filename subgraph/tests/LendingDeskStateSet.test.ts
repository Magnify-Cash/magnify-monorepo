import {
  afterEach,
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { createLendingDeskStateSetEvent, initializeLendingDesk } from "./utils";
import { handleLendingDeskStateSet } from "../src/nfty-finance";
import {
  erc20Address,
  lendingDeskId,
  nftyFinance,
  lendingDeskOwner,
} from "./consts";
import { LendingDesk } from "../generated/schema";

describe("LendingDeskStateSet", () => {
  beforeAll(() => {
    initializeLendingDesk(
      nftyFinance,
      lendingDeskId,
      lendingDeskOwner,
      erc20Address,
      []
    );
  });

  test("Should freeze LendingDesk", () => {
    // Assert initial state of LendingDesk
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "status",
      "Active"
    );

    // Handle event
    handleLendingDeskStateSet(
      createLendingDeskStateSetEvent(nftyFinance, lendingDeskId, true)
    );

    // Assert LendingDesk got updated
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "status",
      "Frozen"
    );
  });

  test("Should unfreeze LendingDesk", () => {
    // Freeze LendingDesk
    handleLendingDeskStateSet(
      createLendingDeskStateSetEvent(nftyFinance, lendingDeskId, true)
    );

    // Assert initial state of LendingDesk
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "status",
      "Frozen"
    );

    // Handle event
    handleLendingDeskStateSet(
      createLendingDeskStateSetEvent(nftyFinance, lendingDeskId, false)
    );

    // Assert LendingDesk got updated
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "status",
      "Active"
    );
  });

  // Reset status of LendingDesk
  afterEach(() => {
    const lendingDesk = LendingDesk.load(lendingDeskId.toString());
    if (!lendingDesk) return;

    lendingDesk.status = "Active";
    lendingDesk.save();
  });
});
