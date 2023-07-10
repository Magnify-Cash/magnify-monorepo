import { assert, beforeAll, test } from "matchstick-as";
import { createTransferEvent, initializeLendingDesk } from "../utils";
import { erc20Address, lendingDeskId, lendingDeskOwner } from "../consts";
import { handleTransfer } from "../../src/lending-keys";
import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/LendingKeys/LendingKeys";

beforeAll(() => {
  initializeLendingDesk(lendingDeskId, lendingDeskOwner, erc20Address, []);
});

test("Should update LendingDesk's owner on Transfer", () => {
  // Assert initial state of LendingDesk
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "owner",
    lendingDeskOwner.toHex()
  );

  const newOwner = Address.fromString(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  handleTransfer(
    createTransferEvent<Transfer>(lendingDeskOwner, newOwner, lendingDeskId)
  );

  // Assert owner got updated
  assert.fieldEquals(
    "LendingDesk",
    lendingDeskId.toString(),
    "owner",
    newOwner.toHex()
  );
});
