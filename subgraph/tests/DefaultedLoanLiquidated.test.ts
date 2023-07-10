import { assert, beforeAll, test } from "matchstick-as/assembly/index";
import { createDefaultedLoanLiquidatedEvent, initializeLoan } from "./utils";
import { handleDefaultedLoanLiquidated } from "../src/nfty-finance";
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

test("Should mark Loan as Defaulted on DefaultedLoanLiquidated", () => {
  // Assert initial state
  assert.fieldEquals("Loan", loanId.toString(), "status", "Active");

  // Handle event
  handleDefaultedLoanLiquidated(createDefaultedLoanLiquidatedEvent(loanId));

  // Assert Loan status
  assert.fieldEquals("Loan", loanId.toString(), "status", "Defaulted");
});
