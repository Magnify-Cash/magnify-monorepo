import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import {
  createLendingDeskLiquidityDepositedEvent,
  createLendingDeskLiquidityWithdrawnEvent,
  initializeLendingDesk,
} from "../utils";
import {
  handleLendingDeskLiquidityDeposited,
  handleLendingDeskLiquidityWithdrawn,
} from "../../src/nfty-finance";
import { BigInt } from "@graphprotocol/graph-ts";
import { erc20Address, lendingDeskId, lendingDeskOwner } from "../consts";

beforeAll(() => {
  initializeLendingDesk(lendingDeskId, lendingDeskOwner, erc20Address, []);
});

test("Should update balance of LendingDesk on LendingDeskLiquidityWithdrawn", () => {
  const initialAmount = BigInt.fromU64(1000 * 10 ** 18);
  const amountWithdrawn = BigInt.fromI64(100 * 10 ** 18);

  // First liquidity addition
  handleLendingDeskLiquidityDeposited(
    createLendingDeskLiquidityDepositedEvent(lendingDeskId, initialAmount)
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
    createLendingDeskLiquidityWithdrawnEvent(lendingDeskId, amountWithdrawn)
  );

  // Assert LendingDesk got updated
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "balance",
    initialAmount.minus(amountWithdrawn).toString()
  );
});
