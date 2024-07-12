import { expect } from "chai";
import { ethers } from "hardhat";
import { initializeLoan } from "../utils/fixtures";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { LoanStatus } from "../utils/consts";

describe("Magnify Cash: Make loan payment", () => {
  const partialPaymentAmount = ethers.parseUnits("3", 18);

  const setup = async () => {
    const { magnifyCash, borrower, erc20, loanAmount, loanConfig, ...rest } =
      await loadFixture(initializeLoan);

    // Mint to borrower and approve for spending
    await erc20.connect(borrower).mint(loanAmount);
    await erc20
      .connect(borrower)
      .approve(magnifyCash.target, ethers.MaxUint256);

    // pass time for loan duration
    await time.increase(loanConfig.minDuration * 3600n);

    // return
    return { magnifyCash, borrower, erc20, loanAmount, loanConfig, ...rest };
  };

  it("should fail for invalid loan id", async () => {
    const { magnifyCash, borrower, loanId, obligationNotes } =
      await loadFixture(setup);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      magnifyCash.connect(borrower).makeLoanPayment(invalidLoanId, 0, false)
      // This reverts with TokenDoesNotExist and not InvalidLoanId
    ).to.be.revertedWithCustomError(obligationNotes, "TokenDoesNotExist");
  });

  it("should fail when caller is not borrower", async () => {
    const { magnifyCash, loanId, lender } = await loadFixture(setup);

    await expect(
      magnifyCash
        .connect(lender)
        .makeLoanPayment(loanId, partialPaymentAmount, false)
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotBorrower");
  });

  it("should fail when loan has defaulted", async () => {
    const { magnifyCash, loanId, borrower, loanDuration } = await loadFixture(
      setup
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(
      magnifyCash.connect(borrower).makeLoanPayment(loanId, 0, false)
    ).to.be.revertedWithCustomError(magnifyCash, "LoanHasDefaulted");
  });

  it("should fail if payment amount > debt", async () => {
    const { magnifyCash, loanId, borrower, loanAmount, loanConfig, erc20 } =
      await loadFixture(setup);

    await erc20
      .connect(borrower)
      .mint(
        loanAmount +
          loanAmount * loanConfig.maxInterest * loanConfig.maxDuration
      );

    await expect(
      magnifyCash
        .connect(borrower)
        .makeLoanPayment(
          loanId,
          loanAmount +
            loanAmount * loanConfig.maxInterest * loanConfig.maxDuration,
          false
        )
    ).to.be.revertedWithCustomError(magnifyCash, "LoanPaymentExceedsDebt");
  });

  it("should fail if payment made on resolved loan", async () => {
    const {
      magnifyCash,
      loanId,
      lendingDeskId,
      borrower,
      lender,
      obligationNotes,
      lendingDesk,
      erc20
    } = await loadFixture(setup);
    let oldLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);

    // Pay back loan in full
    const amountDue = await magnifyCash.getLoanAmountDue(loanId);
    const tx = await magnifyCash
      .connect(borrower)
      .makeLoanPayment(loanId, amountDue, true);

    // Check emitted event and storage
    expect(tx)
      .to.emit(magnifyCash, "LoanPaymentMade")
      .withArgs(loanId, amountDue, true);

    // Check loan is resolved
    const newLoan = await magnifyCash.loans(loanId);
    expect(newLoan.status).to.equal(LoanStatus.Resolved);

    // Check lending desk balance updated
    const newLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);
    expect(newLendingDesk.balance).to.equal(oldLendingDesk.balance + amountDue);

    // Pay back loan in full again
    await erc20.connect(borrower).mint(amountDue);
    await erc20
      .connect(borrower)
      .approve(magnifyCash.target, ethers.MaxUint256);
    await expect(
      magnifyCash
        .connect(borrower)
        .makeLoanPayment(loanId, amountDue, true)
    ).to.be.revertedWithCustomError(magnifyCash, "LoanIsNotActive");
  });

  it("should make partial loan payment", async () => {
    const { magnifyCash, loanId, borrower, loan } = await loadFixture(setup);
    const oldLendingDesk = await magnifyCash.lendingDesks(loan.lendingDeskId);

    const tx = await magnifyCash
      .connect(borrower)
      .makeLoanPayment(loanId, partialPaymentAmount, false);

    // Check emitted event and storage
    expect(tx)
      .to.emit(magnifyCash, "LoanPaymentMade")
      .withArgs(loanId, partialPaymentAmount, false);

    const newLoan = await magnifyCash.loans(loanId);
    expect(newLoan.amountPaidBack).to.equal(
      loan.amountPaidBack + partialPaymentAmount
    );
    expect(newLoan.status).to.equal(LoanStatus.Active);

    const newLendingDesk = await magnifyCash.lendingDesks(loan.lendingDeskId);
    expect(newLendingDesk.balance).to.equal(
      oldLendingDesk.balance + partialPaymentAmount
    );
  });

  it("should make full loan payment", async () => {
    const {
      magnifyCash,
      loanId,
      lendingDeskId,
      borrower,
      lender,
      obligationNotes,
      lendingDesk
    } = await loadFixture(setup);
    const oldLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);

    // Pay back loan in full
    const amountDue = await magnifyCash.getLoanAmountDue(loanId);
    const tx = await magnifyCash
      .connect(borrower)
      .makeLoanPayment(loanId, amountDue, true);

    // Check emitted event and storage
    expect(tx)
      .to.emit(magnifyCash, "LoanPaymentMade")
      .withArgs(loanId, amountDue, true);

    // Check loan is resolved
    const newLoan = await magnifyCash.loans(loanId);
    expect(newLoan.status).to.equal(LoanStatus.Resolved);

    // Check lending desk balance updated
    const newLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);
    expect(newLendingDesk.balance).to.equal(oldLendingDesk.balance + amountDue);
  });
});
