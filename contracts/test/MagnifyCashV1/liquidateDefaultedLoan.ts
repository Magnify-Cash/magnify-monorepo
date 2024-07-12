import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { initializeLoan } from "../utils/fixtures";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { LoanStatus } from "../utils/consts";

describe("Magnify Cash: Liquidate defaulted loan", () => {
  it("should fail for invalid loan id", async () => {
    const { magnifyCash, lender, loanId } = await loadFixture(initializeLoan);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      magnifyCash.connect(lender).liquidateDefaultedLoan(invalidLoanId)
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLoanId");
  });

  it("should fail when caller is not lender", async () => {
    const { magnifyCash, loanId, loanDuration, alice } = await loadFixture(
      initializeLoan
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(
      magnifyCash.connect(alice).liquidateDefaultedLoan(loanId)
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotLender");
  });

  it("should fail when loan is not defaulted", async () => {
    const { magnifyCash, loanId, lender } = await loadFixture(initializeLoan);

    await expect(
      magnifyCash.connect(lender).liquidateDefaultedLoan(loanId)
    ).to.be.revertedWithCustomError(magnifyCash, "LoanHasNotDefaulted");
  });

  it("should liquidate defaulted loan", async () => {
    const { magnifyCash, lender, loanDuration, loanId } = await loadFixture(
      initializeLoan
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    const tx = await magnifyCash.connect(lender).liquidateDefaultedLoan(loanId);

    // Check emitted event
    expect(tx).to.emit(magnifyCash, "DefaultedLoanLiquidated").withArgs(loanId);

    // Check storage
    const loan = await magnifyCash.loans(loanId);
    expect(loan.status).to.equal(LoanStatus.Defaulted);
  });
});
