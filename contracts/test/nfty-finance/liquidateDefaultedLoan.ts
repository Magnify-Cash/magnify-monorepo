import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { initializeLoan } from "../utils/fixtures";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { LoanStatus } from "../utils/consts";

describe("Liquidate defaulted loan", () => {
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
