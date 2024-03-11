import { expect } from "chai";
import { ethers } from "hardhat";
import { initializeLoan } from "../utils/fixtures";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { LoanStatus } from "../utils/consts";

describe("NFTY Finance: Make loan payment", () => {
  const partialPaymentAmount = ethers.parseUnits("3", 18);

  const setup = async () => {
    const { nftyFinance, borrower, erc20, loanAmount, loanConfig, ...rest } =
      await loadFixture(initializeLoan);

    // Mint to borrower and approve for spending
    await erc20.connect(borrower).mint(loanAmount);
    await erc20
      .connect(borrower)
      .approve(nftyFinance.target, ethers.MaxUint256);

    // pass time for loan duration
    await time.increase(loanConfig.minDuration * 3600n);

    // return
    return { nftyFinance, borrower, erc20, loanAmount, loanConfig, ...rest };
  };

  it("should fail for invalid loan id", async () => {
    const { nftyFinance, borrower, loanId, obligationNotes } =
      await loadFixture(setup);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      nftyFinance.connect(borrower).makeLoanPayment(invalidLoanId, 0, false)
      // This reverts with TokenDoesNotExist and not InvalidLoanId
    ).to.be.revertedWithCustomError(obligationNotes, "TokenDoesNotExist");
  });

  it("should fail when caller is not borrower", async () => {
    const { nftyFinance, loanId, lender } = await loadFixture(setup);

    await expect(
      nftyFinance
        .connect(lender)
        .makeLoanPayment(loanId, partialPaymentAmount, false)
    ).to.be.revertedWithCustomError(nftyFinance, "CallerIsNotBorrower");
  });

  it("should fail when loan has defaulted", async () => {
    const { nftyFinance, loanId, borrower, loanDuration } = await loadFixture(
      setup
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(
      nftyFinance.connect(borrower).makeLoanPayment(loanId, 0, false)
    ).to.be.revertedWithCustomError(nftyFinance, "LoanHasDefaulted");
  });

  it("should fail if payment amount > debt", async () => {
    const { nftyFinance, loanId, borrower, loanAmount, loanConfig, erc20 } =
      await loadFixture(setup);

    await erc20
      .connect(borrower)
      .mint(
        loanAmount +
          loanAmount * loanConfig.maxInterest * loanConfig.maxDuration
      );

    await expect(
      nftyFinance
        .connect(borrower)
        .makeLoanPayment(
          loanId,
          loanAmount +
            loanAmount * loanConfig.maxInterest * loanConfig.maxDuration,
          false
        )
    ).to.be.revertedWithCustomError(nftyFinance, "LoanPaymentExceedsDebt");
  });

  it("should make partial loan payment", async () => {
    const { nftyFinance, loanId, borrower, loan } = await loadFixture(setup);

    const tx = await nftyFinance
      .connect(borrower)
      .makeLoanPayment(loanId, partialPaymentAmount, false);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyFinance, "LoanPaymentMade")
      .withArgs(loanId, partialPaymentAmount, false);

    const newLoan = await nftyFinance.loans(loanId);
    expect(newLoan.amountPaidBack).to.equal(
      loan.amountPaidBack + partialPaymentAmount
    );
    expect(newLoan.status).to.equal(LoanStatus.Active);
  });

  it("should make full loan payment", async () => {
    const {
      nftyFinance,
      loanId,
      borrower,
      lender,
      promissoryNotes,
      obligationNotes,
    } = await loadFixture(setup);

    // Pay back loan in full
    const amountDue = await nftyFinance.getLoanAmountDue(loanId);
    const tx = await nftyFinance
      .connect(borrower)
      .makeLoanPayment(loanId, 0, true);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyFinance, "LoanPaymentMade")
      .withArgs(loanId, amountDue, true);

    // NFTYNotes should be burned
    expect(tx)
      .to.emit(promissoryNotes, "Transfer")
      .withArgs(loanId, borrower.address, ethers.ZeroAddress);

    expect(tx)
      .to.emit(obligationNotes, "Transfer")
      .withArgs(loanId, lender.address, ethers.ZeroAddress);

    const newLoan = await nftyFinance.loans(loanId);
    expect(newLoan.status).to.equal(LoanStatus.Resolved);
  });
});
