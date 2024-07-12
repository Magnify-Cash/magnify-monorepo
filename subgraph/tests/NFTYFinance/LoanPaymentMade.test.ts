import {
  afterEach,
  assert,
  beforeAll,
  test,
} from "matchstick-as/assembly/index";
import { createLoanPaymentMadeEvent, initializeLoan } from "../utils";
import { handleLoanPaymentMade } from "../../src/magnify-cash";
import { BigInt } from "@graphprotocol/graph-ts";
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
import { Loan } from "../../generated/schema";

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

test("Should update Loan's amount on LoanPaymentMade for first partial payment", () => {
  // Assert initial state
  assert.fieldEquals("Loan", loanId.toString(), "amountPaidBack", "0");

  const paymentAmount = BigInt.fromU64(10 * 10 ** 18);
  handleLoanPaymentMade(
    createLoanPaymentMadeEvent(loanId, paymentAmount, false)
  );

  // Assert Loan contents
  assert.fieldEquals(
    "Loan",
    loanId.toString(),
    "amountPaidBack",
    paymentAmount.toString()
  );
  assert.fieldEquals("Loan", loanId.toString(), "status", "Active");
});

test("Should update Loan's amount on LoanPaymentMade for subsequent partial payment", () => {
  const initialPaymentAmount = BigInt.fromU64(10 * 10 ** 18);
  handleLoanPaymentMade(
    createLoanPaymentMadeEvent(loanId, initialPaymentAmount, false)
  );

  // Assert initial state
  assert.fieldEquals(
    "Loan",
    loanId.toString(),
    "amountPaidBack",
    initialPaymentAmount.toString()
  );

  // Handle event
  const paymentAmount = BigInt.fromU64(20 * 10 ** 18);
  handleLoanPaymentMade(
    createLoanPaymentMadeEvent(loanId, paymentAmount, false)
  );

  // Assert Loan contents
  assert.fieldEquals(
    "Loan",
    loanId.toString(),
    "amountPaidBack",
    initialPaymentAmount.plus(paymentAmount).toString()
  );
  assert.fieldEquals("Loan", loanId.toString(), "status", "Active");
});

test("Should set Loan as resolved on LoanPaymentMade for complete payment", () => {
  // Assert initial state
  assert.fieldEquals("Loan", loanId.toString(), "status", "Active");

  // Handle event
  handleLoanPaymentMade(createLoanPaymentMadeEvent(loanId, amount, true));

  // Assert Loan status
  assert.fieldEquals("Loan", loanId.toString(), "status", "Resolved");
});

afterEach(() => {
  const loan = Loan.load(loanId.toString());
  if (!loan) return;

  loan.amountPaidBack = BigInt.fromI32(0);
  loan.status = "Active";
  loan.save();
});
