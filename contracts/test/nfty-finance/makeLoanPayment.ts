import { expect } from "chai";
import { ethers } from "hardhat";
import { initializeLoan } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { LoanStatus } from "../utils/consts";

describe("Make loan payment", () => {
  const partialPaymentAmount = ethers.utils.parseUnits("3", 18);

  const setup = async () => {
    const { nftyFinance, borrower, erc20, loanAmount, ...rest } =
      await loadFixture(initializeLoan);

    // Mint to borrower and approve for spending
    await erc20.connect(borrower).mint(loanAmount);
    await erc20.connect(borrower).approve(nftyFinance.address, loanAmount);
    return { nftyFinance, borrower, erc20, loanAmount, ...rest };
  };

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
      loanAmount,
      loan,
      promissoryNotes,
      obligationNotes,
    } = await loadFixture(setup);

    const tx = await nftyFinance
      .connect(borrower)
      .makeLoanPayment(loanId, loanAmount);

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
    expect(newLoan.amountPaidBack).to.equal(loan.amount);
    expect(newLoan.status).to.equal(LoanStatus.Resolved);
  });
});
