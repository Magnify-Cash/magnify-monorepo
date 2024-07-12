import { expect } from "chai";
import { ethers } from "hardhat";
import { initializeLoan } from "../utils/fixtures";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { LoanConfig } from "../utils/consts";

// Util function to calculate total due amount of loan locally
const getTotalAmountDue = (
  loanAmount: bigint,
  loan,
  loanConfig: LoanConfig
) => {
  const hoursElapsed = loanConfig.minDuration;
  const hoursInYear = 8760n;
  const multiplier = 10000n;
  const totalAmountDue =
    loanAmount +
    (loanAmount * loan.interest * hoursElapsed) / (hoursInYear * multiplier);
  return totalAmountDue;
};

describe("Magnify Cash: Remaining due amount of loan", () => {
  const partialPaymentAmount = ethers.parseUnits("3", 18);

  const setup = async () => {
    const { loanConfig, borrower, loanAmount, erc20, magnifyCash, ...rest } =
      await loadFixture(initializeLoan);

    // Mint to borrower and approve for spending
    await erc20.connect(borrower).mint(loanAmount);
    await erc20
      .connect(borrower)
      .approve(magnifyCash.target, ethers.MaxUint256);

    // pass time for loan duration
    await time.increase(loanConfig.minDuration * 3600n);

    // return
    return { loanConfig, borrower, loanAmount, erc20, magnifyCash, ...rest };
  };

  it("should fail for invalid loan id", async () => {
    const { magnifyCash, loanId } = await loadFixture(setup);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      magnifyCash.getLoanAmountDue(invalidLoanId)
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLoanId");
  });

  it("should fail when loan has defaulted", async () => {
    const { magnifyCash, loanId, loanDuration } = await loadFixture(setup);

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(
      magnifyCash.getLoanAmountDue(loanId)
    ).to.be.revertedWithCustomError(magnifyCash, "LoanHasDefaulted");
  });

  it("should fail when loan is resolved", async () => {
    const { magnifyCash, loanId, borrower } = await loadFixture(setup);

    // Pay back the loan fully
    await magnifyCash.connect(borrower).makeLoanPayment(loanId, 1, true);

    await expect(
      magnifyCash.getLoanAmountDue(loanId)
    ).to.be.revertedWithCustomError(magnifyCash, "LoanIsNotActive");
  });

  it("should return remaining due amount when no payment has been made", async () => {
    const { magnifyCash, loanId, loanAmount, loan, loanConfig } =
      await loadFixture(setup);

    // Check remaining due amount
    const amountDue = await magnifyCash.getLoanAmountDue(loanId);
    const totalAmountDue = getTotalAmountDue(loanAmount, loan, loanConfig);
    expect(amountDue).to.equal(totalAmountDue);
  });

  it("should return remaining due amount after partial payment has been made", async () => {
    const { magnifyCash, loanId, borrower, loan, loanAmount, loanConfig } =
      await loadFixture(setup);

    // Make partial payment
    await magnifyCash
      .connect(borrower)
      .makeLoanPayment(loanId, partialPaymentAmount, false);

    // Check remaining due amount
    const amountDue = await magnifyCash.getLoanAmountDue(loanId);
    const totalAmountDue = getTotalAmountDue(loanAmount, loan, loanConfig);
    expect(amountDue).to.equal(totalAmountDue - partialPaymentAmount);
  });
});
