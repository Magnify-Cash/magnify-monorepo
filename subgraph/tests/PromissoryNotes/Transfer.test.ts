import { assert, beforeAll, test } from "matchstick-as";
import { createTransferEvent, initializeLoan } from "../utils";
import {
  amount,
  borrower,
  duration,
  erc20Address,
  interest,
  lendingDeskId,
  lendingDeskOwner,
  loanConfigs,
  loanId,
  nftCollection,
  nftId,
  platformFee,
} from "../consts";
import { handleTransfer } from "../../src/promissory-notes";
import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/PromissoryNotes/PromissoryNotes";

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

test("Should update Loan's lender on Transfer", () => {
  // Assert initial state of Loan
  assert.fieldEquals(
    "Loan",
    loanId.toString(),
    "lender",
    lendingDeskOwner.toHex()
  );

  const newLender = Address.fromString(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  handleTransfer(
    createTransferEvent<Transfer>(lendingDeskOwner, newLender, loanId)
  );

  // Assert lender got updated
  assert.fieldEquals("Loan", loanId.toString(), "lender", newLender.toHex());
});
