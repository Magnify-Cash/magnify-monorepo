import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { initializeLoan } from "../utils/fixtures";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { LoanStatus } from "../utils/consts";

describe("NFTY Finance: Liquidate defaulted loan", () => {
  it("should fail for invalid loan id", async () => {
    const { nftyFinance, lender, loanId } = await loadFixture(initializeLoan);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      nftyFinance.connect(lender).liquidateDefaultedLoan(invalidLoanId)
    ).to.be.revertedWith("invalid loan id");
  });

  it("should fail when caller is not lender", async () => {
    const { nftyFinance, loanId, loanDuration, alice } = await loadFixture(
      initializeLoan
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(
      nftyFinance.connect(alice).liquidateDefaultedLoan(loanId)
    ).to.be.revertedWith("not lender");
  });

  it("should fail when loan is not defaulted", async () => {
    const { nftyFinance, loanId, lender } = await loadFixture(initializeLoan);

    await expect(
      nftyFinance.connect(lender).liquidateDefaultedLoan(loanId)
    ).to.be.revertedWith("loan has not defaulted");
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, loanId, lender, loanDuration } = await loadFixture(
      initializeLoan
    );

    // advance time and default the loan, then pause the contract
    await time.increase(loanDuration * 3600);
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.connect(lender).liquidateDefaultedLoan(loanId)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should liquidate defaulted loan", async () => {
    const { nftyFinance, lender, loanDuration, loanId } = await loadFixture(
      initializeLoan
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    const tx = await nftyFinance.connect(lender).liquidateDefaultedLoan(loanId);

    // Check emitted event
    expect(tx).to.emit(nftyFinance, "DefaultedLoanLiquidated").withArgs(loanId);

    // Check storage
    const loan = await nftyFinance.loans(loanId);
    expect(loan.status).to.equal(LoanStatus.Defaulted);
  });
});
