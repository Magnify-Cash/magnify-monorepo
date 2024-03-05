import { expect } from "chai";
import { deployNftyFinance } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("NFTY Finance: Set loan origination fee", function () {
  it("should fail when fee > 10%", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);

    const tx = nftyFinance.setLoanOriginationFee(10000);
    expect(tx).to.be.revertedWithCustomError(
      nftyFinance,
      "LoanOriginationFeeMoreThan10Percent"
    );
  });

  it("should set loan origination fee", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);
    const loanOriginationFee = 100;

    const tx = await nftyFinance.setLoanOriginationFee(loanOriginationFee);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyFinance, "LoanOriginationFeeSet")
      .withArgs(loanOriginationFee);
    expect(await nftyFinance.loanOriginationFee()).to.equal(loanOriginationFee);
  });

  it("should fail when caller is not admin", async () => {
    const { nftyFinance, alice } = await loadFixture(deployNftyFinance);

    await expect(
      nftyFinance.connect(alice).setLoanOriginationFee(100)
    ).to.be.revertedWithCustomError(nftyFinance, "Unauthorized");
  });
});
