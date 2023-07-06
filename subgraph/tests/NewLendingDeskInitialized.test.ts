import {
  assert,
  beforeAll,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";
import {
  createNewLendingDeskInitializedEvent,
  intialOwnershipTransfer,
} from "./utils";
import { handleNewLendingDeskInitialized } from "../src/nfty-finance";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Erc20, LendingDesk } from "../generated/schema";

const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);
const owner = Address.fromString("0xFABB0ac9d68B0B445fB7357272Ff202C5651694a");
const id = 12;

const erc20Address = Address.fromString(
  "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
);
const erc20Name = "USD Coin";
const erc20Symbol = "USDC";
const erc20Decimals = 18;

describe("NewLendingDeskInitialized", () => {
  beforeAll(() => {
    intialOwnershipTransfer(nftyFinance);

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
    const event = createNewLendingDeskInitializedEvent(
      nftyFinance,
      owner,
      erc20Address,
      id
    );
    handleNewLendingDeskInitialized(event);

    // Assert LendingDesk got created
    const lendingDesk = LendingDesk.load(id.toString());
    assert.assertNotNull(lendingDesk);
    if (!lendingDesk) return;

    // Assert contents of LendingDesk
    assert.stringEquals(lendingDesk.id, id.toString());
    assert.bytesEquals(lendingDesk.owner, owner);
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
      erc20.lendingDesks.map<ethereum.Value>((x) =>
        ethereum.Value.fromString(x)
      ),
      [ethereum.Value.fromString(lendingDesk.id)]
    );
  });
});
