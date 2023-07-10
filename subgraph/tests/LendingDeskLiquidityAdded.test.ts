import {
  afterEach,
  assert,
  beforeAll,
  test,
} from "matchstick-as/assembly/index";
import {
  createLendingDeskLiquidityAddedEvent,
  initializeLendingDesk,
} from "./utils";
import { handleLendingDeskLiquidityAdded } from "../src/nfty-finance";
import { BigInt } from "@graphprotocol/graph-ts";
import { erc20Address, lendingDeskId, lendingDeskOwner } from "./consts";
import { LendingDesk } from "../generated/schema";

beforeAll(() => {
  initializeLendingDesk(lendingDeskId, lendingDeskOwner, erc20Address, []);
});

test("Should update balance of LendingDesk on initial LendingDeskLiquidityAdded", () => {
  const initialAmount = BigInt.fromU64(1000 * 10 ** 18);

  // Assert initial state of LendingDesk
  assert.fieldEquals("LendingDesk", lendingDeskId.toString(), "balance", "0");

  // Handle event
  handleLendingDeskLiquidityAdded(
    createLendingDeskLiquidityAddedEvent(lendingDeskId, initialAmount)
  );

  // Assert LendingDesk got updated
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "balance",
    initialAmount.toString()
  );
});

test("Should increase balance of LendingDesk on subsequent LendingDeskLiquidityAdded", () => {
  const initialAmount = BigInt.fromU64(1000 * 10 ** 18);
  const amountAdded = BigInt.fromI64(100 * 10 ** 18);

  // First liquidity addition
  handleLendingDeskLiquidityAdded(
    createLendingDeskLiquidityAddedEvent(lendingDeskId, initialAmount)
  );

  // Assert initial state of LendingDesk
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "balance",
    initialAmount.toString()
  );

  // Handle event
  handleLendingDeskLiquidityAdded(
    createLendingDeskLiquidityAddedEvent(lendingDeskId, amountAdded)
  );

  // Assert LendingDesk got updated
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "balance",
    initialAmount.plus(amountAdded).toString()
  );
});

// Reset balance of LendingDesk
afterEach(() => {
  const lendingDesk = LendingDesk.load(lendingDeskId.toString());
  if (!lendingDesk) return;

  // @ts-ignore
  lendingDesk.balance = BigInt.fromI32(<i32>0);
  lendingDesk.save();
});
