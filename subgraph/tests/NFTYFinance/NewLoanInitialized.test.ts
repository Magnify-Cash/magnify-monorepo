import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import { createNewLoanInitializedEvent, initializeLendingDesk } from "../utils";
import { handleNewLoanInitialized } from "../../src/magnify-cash";
import { BigInt } from "@graphprotocol/graph-ts";
import { Loan } from "../../generated/schema";
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
} from "../consts";

beforeAll(() => {
  initializeLendingDesk(
    lendingDeskId,
    lendingDeskOwner,
    erc20Address,
    loanConfigs
  );
});

test("Should create Loan entity on NewLoanInitialized", () => {
  const event = createNewLoanInitializedEvent(
    lendingDeskId,
    loanId,
    borrower,
    nftCollection,
    nftId,
    amount,
    duration,
    interest,
    platformFee
  );
  handleNewLoanInitialized(event);

  // Assert Loan got created
  const loan = Loan.load(loanId.toString());
  assert.assertNotNull(loan);
  if (!loan) return;

  // Assert contents of Loan
  assert.stringEquals(loan.lendingDesk, lendingDeskId.toString());
  assert.stringEquals(loan.id, loanId.toString());
  assert.stringEquals(loan.borrower, borrower.toHex());
  assert.stringEquals(loan.nftCollection, nftCollection.toHex());
  // @ts-ignore
  assert.bigIntEquals(loan.nftId, BigInt.fromU32(<u32>nftId));
  assert.bigIntEquals(loan.amount, amount);
  assert.bigIntEquals(loan.duration, duration);
  assert.bigIntEquals(loan.interest, interest);
  assert.stringEquals(loan.status, "Active");
  assert.stringEquals(loan.lender, lendingDeskOwner.toHex());
  assert.bigIntEquals(loan.startTime, event.block.timestamp);
  assert.bigIntEquals(loan.amountPaidBack, BigInt.fromU32(0));
});
