import { expect } from "chai";
import { ethers } from "hardhat";
import { initializeLoan } from "../utils/fixtures";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";
import { LoanConfig } from "../utils/consts";

// Util function to calculate total due amount of loan locally
const getTotalAmountDue = (
  loanAmount: BigNumber,
  loan,
  loanConfig: LoanConfig
) => {
  const hoursElapsed = loanConfig.minDuration;
  const hoursInYear = ethers.BigNumber.from(8760);
  const multiplier = ethers.BigNumber.from(10000);
  const totalAmountDue = loanAmount.add(
    loanAmount
      .mul(loan.interest)
      .div(hoursInYear.mul(multiplier).div(hoursElapsed))
  );
  return totalAmountDue;
};

describe("NFTY Finance: Remaining due amount of loan", () => {
  const partialPaymentAmount = ethers.utils.parseUnits("3", 18);

  const setup = async () => {
    const { loanConfig, borrower, loanAmount, erc20, nftyFinance, ...rest } =
      await loadFixture(initializeLoan);

    // Mint to borrower and approve for spending
    await erc20.connect(borrower).mint(loanAmount);
    await erc20
      .connect(borrower)
      .approve(nftyFinance.address, ethers.constants.MaxUint256);

    // pass time for loan duration
    await time.increase(loanConfig.minDuration.mul(3600));

    // return
    return { loanConfig, borrower, loanAmount, erc20, nftyFinance, ...rest };
  };

  it("should fail for invalid loan id", async () => {
    const { nftyFinance, loanId } = await loadFixture(setup);

    const invalidLoanId = 2;
    expect(loanId).to.not.equal(invalidLoanId); // check if actually invalid

    await expect(
      nftyFinance.getLoanAmountDue(invalidLoanId)
    ).to.be.revertedWith("invalid loan id");
  });

  it("should fail when loan has defaulted", async () => {
    const { nftyFinance, loanId, loanDuration } = await loadFixture(setup);

    // advance time and default the loan
    await time.increase(loanDuration * 3600);

    await expect(nftyFinance.getLoanAmountDue(loanId)).to.be.revertedWith(
      "loan has defaulted"
    );
  });

  it("should fail when loan is resolved", async () => {
    const { nftyFinance, loanId, borrower } = await loadFixture(setup);

    // Pay back the loan fully
    const amountDue = await nftyFinance.getLoanAmountDue(loanId);
    await nftyFinance.connect(borrower).makeLoanPayment(loanId, amountDue);

    await expect(nftyFinance.getLoanAmountDue(loanId)).to.be.revertedWith(
      "loan not active"
    );
  });

  it("should return remaining due amount when no payment has been made", async () => {
    const { nftyFinance, loanId, loanAmount, loan, loanConfig } =
      await loadFixture(setup);

    // Check remaining due amount
    const amountDue = await nftyFinance.getLoanAmountDue(loanId);
    const totalAmountDue = getTotalAmountDue(loanAmount, loan, loanConfig);
    expect(amountDue).to.equal(totalAmountDue);
  });

  it("should return remaining due amount after partial payment has been made", async () => {
    const { nftyFinance, loanId, borrower, loan, loanAmount, loanConfig } =
      await loadFixture(setup);

    // Make partial payment
    await nftyFinance
      .connect(borrower)
      .makeLoanPayment(loanId, partialPaymentAmount);

    // Check remaining due amount
    const amountDue = await nftyFinance.getLoanAmountDue(loanId);
    const totalAmountDue = getTotalAmountDue(loanAmount, loan, loanConfig);
    expect(amountDue).to.equal(totalAmountDue.sub(partialPaymentAmount));
  });
});
