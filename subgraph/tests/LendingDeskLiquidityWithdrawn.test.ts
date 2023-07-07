import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createLendingDeskLiquidityAddedEvent,
  createLendingDeskLiquidityWithdrawEvent,
  initializeLendingDesk,
} from "./utils";
import {
  handleLendingDeskLiquidityAdded,
  handleLendingDeskLiquidityWithdrawn,
} from "../src/nfty-finance";
import { BigInt } from "@graphprotocol/graph-ts";
import {
  erc20Address,
  lendingDeskId,
  nftyFinance,
  lendingDeskOwner,
} from "./consts";

describe("LendingDeskLiquidityWithdrawn", () => {
  beforeAll(() => {
    initializeLendingDesk(
      nftyFinance,
      lendingDeskId,
      lendingDeskOwner,
      erc20Address,
      []
    );
  });

  test("Should update balance of LendingDesk on LendingDeskLiquidityWithdrawn", () => {
    const initialAmount = BigInt.fromU64(1000 * 10 ** 18);
    const amountWithdrawn = BigInt.fromI64(100 * 10 ** 18);

    // First liquidity addition
    handleLendingDeskLiquidityAdded(
      createLendingDeskLiquidityAddedEvent(
        nftyFinance,
        lendingDeskId,
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
    handleLendingDeskLiquidityWithdrawn(
      createLendingDeskLiquidityWithdrawEvent(
        nftyFinance,
        lendingDeskId,
        amountWithdrawn
      )
    );

    // Assert LendingDesk got updated
    assert.fieldEquals(
      "LendingDesk",
      lendingDeskId.toString(),
      "balance",
      initialAmount.minus(amountWithdrawn).toString()
    );
  });
});
