import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createLendingDeskLiquidityAddedEvent,
  initializeLendingDesk,
} from "./utils";
import { handleLendingDeskLiquidityAdded } from "../src/nfty-finance";
import { BigInt } from "@graphprotocol/graph-ts";
import {
  erc20Address,
  lendingDeskId,
  nftyFinance,
  lendingDeskOwner,
} from "./consts";

describe("LendingDeskLiquidityAdded", () => {
  beforeAll(() => {
    initializeLendingDesk(
      nftyFinance,
      lendingDeskId,
      lendingDeskOwner,
      erc20Address,
      []
    );
  });

  test("Should update balance of LendingDesk on initial LendingDeskLiquidityAdded", () => {
    const amountAdded = BigInt.fromU64(1000 * 10 ** 18);

    // Assert initial state of LendingDesk
    assert.fieldEquals("LendingDesk", lendingDeskId.toString(), "balance", "0");

    // Handle event
    const event = createLendingDeskLiquidityAddedEvent(
      nftyFinance,
      lendingDeskId,
      amountAdded,
      amountAdded
    );
    handleLendingDeskLiquidityAdded(event);

    // Assert LendingDesk got updated
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "balance",
      amountAdded.toString()
    );
  });

  test("Should increase balance of LendingDesk on subsequent LendingDeskLiquidityAdded", () => {
    const initialAmount = BigInt.fromU64(1000 * 10 ** 18);
    const amountAdded = BigInt.fromI64(100 * 10 ** 18);

    // First liquidity addition
    handleLendingDeskLiquidityAdded(
      createLendingDeskLiquidityAddedEvent(
        nftyFinance,
        lendingDeskId,
        initialAmount,
        initialAmount
      )
    );

    // Assert initial state of LendingDesk
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "balance",
      initialAmount.toString()
    );

    // Handle event
    const event = createLendingDeskLiquidityAddedEvent(
      nftyFinance,
      lendingDeskId,
      amountAdded,
      initialAmount.plus(amountAdded)
    );
    handleLendingDeskLiquidityAdded(event);

    // Assert LendingDesk got updated
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "balance",
      initialAmount.plus(amountAdded).toString()
    );
  });
});
