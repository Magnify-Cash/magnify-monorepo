import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import { createPlatformFeesWithdrawnEvent, initializeLoan } from "./utils";
import { handlePlatformFeesWithdrawn } from "../src/nfty-finance";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  erc20Address,
  lendingDeskId,
  loanConfigs,
  lendingDeskOwner,
  loanId,
  borrower,
  nftCollection,
  nftId,
  amount,
  duration,
  interest,
  platformFee,
} from "./consts";

beforeAll(() => {
  initializeLoan(
    lendingDeskId,
    lendingDeskOwner,
    erc20Address,
    loanConfigs,
    loanId,
    borrower,
    nftCollection,
    nftId,
    amount,
    duration,
    interest,
    platformFee
  );
});

test("Should update ERC20's platformFees on PlatformFeesWithdrawn", () => {
  // Assert initial state
  assert.fieldEquals(
    "Erc20",
    erc20Address.toHex(),
    "platformFees",
    platformFee.toString()
  );
  const receiver = Address.fromString(
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
  );

  handlePlatformFeesWithdrawn(
    createPlatformFeesWithdrawnEvent([erc20Address], receiver)
  );

  // Assert Erc20 got updated
  assert.fieldEquals(
    "Erc20",
    erc20Address.toHex(),
    "platformFees",
    BigInt.fromU32(0).toString()
  );
});
