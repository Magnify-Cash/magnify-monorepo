import {
  assert,
  beforeAll,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { createDefaultedLoanLiquidatedEvent, initializeLoan } from "./utils";
import { handleDefaultedLoanLiquidated } from "../src/nfty-finance";
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

describe("DefaultedLoanLiquidated", () => {
  beforeAll(() => {
    initializeLoan(
      nftyFinance,
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
      interest
    );
  });

  test("Should mark Loan as Defaulted on DefaultedLoanLiquidated", () => {
    // Assert initial state
    assert.fieldEquals("Loan", loanId.toString(), "status", "Active");

    // Handle event
    handleDefaultedLoanLiquidated(
      createDefaultedLoanLiquidatedEvent(nftyFinance, loanId)
    );

    // Assert Loan status
    assert.fieldEquals("Loan", loanId.toString(), "status", "Defaulted");
  });
});
