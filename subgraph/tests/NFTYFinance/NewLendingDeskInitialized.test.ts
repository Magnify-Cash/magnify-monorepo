import {
  assert,
  beforeAll,
  createMockedFunction,
  test,
} from "matchstick-as/assembly/index";
import {
  createNewLendingDeskInitializedEvent,
  initializeProtocol,
} from "../utils";
import { handleNewLendingDeskInitialized } from "../../src/nfty-finance";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Erc20, LendingDesk } from "../../generated/schema";
import {
  erc20Address,
  erc20Name,
  erc20Symbol,
  lendingDeskId,
  lendingDeskOwner,
  erc20Decimals,
} from "../consts";

beforeAll(() => {
  initializeProtocol();

  createMockedFunction(erc20Address, "name", "name():(string)")
    .withArgs([])
    .returns([ethereum.Value.fromString(erc20Name)]);
  createMockedFunction(erc20Address, "symbol", "symbol():(string)")
    .withArgs([])
    .returns([ethereum.Value.fromString(erc20Symbol)]);
  createMockedFunction(erc20Address, "decimals", "decimals():(uint8)")
    .withArgs([])
    // @ts-ignore
    .returns([ethereum.Value.fromI32(<i32>erc20Decimals)]);
});

test("Should create LendingDesk and Erc20 entities on NewLendingDeskInitialized", () => {
  // Handle event
  handleNewLendingDeskInitialized(
    createNewLendingDeskInitializedEvent(
      lendingDeskOwner,
      erc20Address,
      lendingDeskId
    )
  );

  // Assert LendingDesk got created
  const lendingDesk = LendingDesk.load(lendingDeskId.toString());
  assert.assertNotNull(lendingDesk);
  if (!lendingDesk) return;

  // Assert contents of LendingDesk
  assert.stringEquals(lendingDesk.id, lendingDeskId.toString());
  assert.bytesEquals(lendingDesk.owner, lendingDeskOwner);
  assert.stringEquals(lendingDesk.erc20, erc20Address.toHex());
  assert.bigIntEquals(lendingDesk.balance, new BigInt(0));
  assert.stringEquals(lendingDesk.status, "Active");

  // Assert Erc20 got created
  const erc20 = Erc20.load(erc20Address.toHex());
  assert.assertNotNull(erc20);
  if (!erc20) return;

  // Assert contents of Erc20
  assert.stringEquals(erc20.id, erc20Address.toHex());
  assert.stringEquals(erc20.name, erc20Name);
  assert.stringEquals(erc20.symbol, erc20Symbol);
  // @ts-ignore
  assert.i32Equals(erc20.decimals, <i32>erc20Decimals);

  // Assert derived fields
  assert.arrayEquals(
    erc20.lendingDesks.map<ethereum.Value>((x) => ethereum.Value.fromString(x)),
    [ethereum.Value.fromString(lendingDesk.id)]
  );
});
