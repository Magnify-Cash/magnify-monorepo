import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { createNewLoanInitializedEvent, initializeLendingDesk } from "./utils";
import { handleNewLoanInitialized } from "../src/nfty-finance";
import { BigInt } from "@graphprotocol/graph-ts";
import { Loan } from "../generated/schema";
import {
  erc20Address,
  lendingDeskId,
  loanConfigs,
  nftyFinance,
  lendingDeskOwner,
  loanId,
  borrower,
  nftCollection,
  nftId,
  amount,
  duration,
  interest,
} from "./consts";

describe("NewLoanInitialized", () => {
  beforeAll(() => {
    initializeLendingDesk(
      nftyFinance,
      lendingDeskId,
      lendingDeskOwner,
      erc20Address,
      loanConfigs
    );
  });

  test("Should create Loan entity on NewLoanInitialized", () => {
    const event = createNewLoanInitializedEvent(
      nftyFinance,
      lendingDeskId,
      loanId,
      borrower,
      nftCollection,
      nftId,
      amount,
      duration,
      interest
    );
    handleNewLoanInitialized(event);

    // Assert Loan got created
    const loan = Loan.load(loanId.toString());
    assert.assertNotNull(loan);
    if (!loan) return;

    // Assert contents of Loan
    assert.stringEquals(loan.lendingDesk, lendingDeskId.toString());
    assert.stringEquals(loan.id, loanId.toString());
    assert.bytesEquals(loan.borrower, borrower);
    assert.stringEquals(loan.nftCollection, nftCollection.toHex());
    // @ts-ignore
    assert.bigIntEquals(loan.nftId, BigInt.fromU32(<u32>nftId));
    assert.bigIntEquals(loan.amount, amount);
    assert.bigIntEquals(loan.duration, duration);
    assert.bigIntEquals(loan.interest, interest);
    assert.stringEquals(loan.status, "Active");
    assert.bytesEquals(loan.lender, lendingDeskOwner);
    assert.bigIntEquals(loan.startTime, event.block.timestamp);
    assert.bigIntEquals(loan.amountPaidBack, BigInt.fromU32(0));
  });
});
