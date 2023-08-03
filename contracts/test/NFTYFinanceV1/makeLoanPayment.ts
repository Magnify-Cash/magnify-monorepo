import { expect } from "chai";
import { ethers } from "hardhat";
import { initializeLoan } from "../utils/fixtures";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { LoanStatus } from "../utils/consts";

describe("NFTY Finance: Make loan payment", () => {
  const partialPaymentAmount = ethers.utils.parseUnits("3", 18);

  const setup = async () => {
    const { nftyFinance, borrower, erc20, loanAmount, loanConfig, ...rest } =
      await loadFixture(initializeLoan);

    // Mint to borrower and approve for spending
    await erc20.connect(borrower).mint(loanAmount);
    await erc20
      .connect(borrower)
      .approve(nftyFinance.address, ethers.constants.MaxUint256);

    // pass time for loan duration
    await time.increase(loanConfig.minDuration.mul(3600));

    // return
    return { nftyFinance, borrower, erc20, loanAmount, loanConfig, ...rest };
  };

  it("should fail for invalid loan id", async () => {
    const { nftyFinance, borrower, loanId } = await loadFixture(setup);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      nftyFinance.connect(borrower).makeLoanPayment(invalidLoanId, 0)
    ).to.be.revertedWith("invalid loan id");
  });

  it("should fail when caller is not borrower", async () => {
    const { nftyFinance, loanId, lender } = await loadFixture(setup);

    await expect(
      nftyFinance.connect(lender).makeLoanPayment(loanId, partialPaymentAmount)
    ).to.be.revertedWith("not borrower");
  });

  it("should fail when loan has defaulted", async () => {
    const { nftyFinance, loanId, borrower, loanDuration } = await loadFixture(
      setup
    );

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(
      nftyFinance.connect(borrower).makeLoanPayment(loanId, 0)
    ).to.be.revertedWith("loan has defaulted");
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, loanId, borrower } = await loadFixture(setup);

    // pause the contract
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.connect(borrower).makeLoanPayment(loanId, 0)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should fail if payment amount > debt", async () => {
    const { nftyFinance, loanId, borrower, loanAmount, loanConfig } =
      await loadFixture(setup);

    await expect(
      nftyFinance
        .connect(borrower)
        .makeLoanPayment(
          loanId,
          loanAmount.add(
            loanAmount.mul(loanConfig.maxInterest.mul(loanConfig.maxDuration))
          )
        )
    ).to.be.revertedWith("payment amount > debt");
  });

  it("should make partial loan payment", async () => {
    const { nftyFinance, loanId, borrower, loan } = await loadFixture(setup);

    const tx = await nftyFinance
      .connect(borrower)
      .makeLoanPayment(loanId, partialPaymentAmount);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyFinance, "LoanPaymentMade")
      .withArgs(loanId, partialPaymentAmount, false);

    const newLoan = await nftyFinance.loans(loanId);
    expect(newLoan.amountPaidBack).to.equal(
      loan.amountPaidBack.add(partialPaymentAmount)
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
    const remainingDueAmount = await nftyFinance.remainingDueAmountOfLoan(
      loanId
    );
    const tx = await nftyFinance
      .connect(borrower)
      .makeLoanPayment(loanId, remainingDueAmount);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyFinance, "LoanPaymentMade")
      .withArgs(loanId, partialPaymentAmount, true);

    // NFTYNotes should be burned
    expect(tx)
      .to.emit(promissoryNotes, "Transfer")
      .withArgs(loanId, borrower.address, ethers.constants.AddressZero);

    expect(tx)
      .to.emit(obligationNotes, "Transfer")
      .withArgs(loanId, lender.address, ethers.constants.AddressZero);

    const newLoan = await nftyFinance.loans(loanId);
    expect(newLoan.status).to.equal(LoanStatus.Resolved);
  });
});
