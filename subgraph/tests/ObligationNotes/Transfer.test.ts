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
import { handleTransfer } from "../../src/obligation-notes";
import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/ObligationNotes/ObligationNotes";

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

test("Should update Loan's borrower on Transfer", () => {
  // Assert initial state of Loan
  assert.fieldEquals("Loan", loanId.toString(), "borrower", borrower.toHex());

  const newBorrower = Address.fromString(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  handleTransfer(createTransferEvent<Transfer>(borrower, newBorrower, loanId));

  // Assert borrower got updated
  assert.fieldEquals(
    "Loan",
    loanId.toString(),
    "borrower",
    newBorrower.toHex()
  );
});
