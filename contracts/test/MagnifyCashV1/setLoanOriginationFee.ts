import { expect } from "chai";
import { deployMagnifyCash } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Magnify Cash: Set loan origination fee", function () {
  it("should set loan origination fee", async () => {
    const { magnifyCash } = await loadFixture(deployMagnifyCash);
    const loanOriginationFee = 100;

    const tx = await magnifyCash.setLoanOriginationFee(loanOriginationFee);

    // Check emitted event and storage
    expect(tx)
      .to.emit(magnifyCash, "LoanOriginationFeeSet")
      .withArgs(loanOriginationFee);
    expect(await magnifyCash.loanOriginationFee()).to.equal(loanOriginationFee);
  });

  it("should fail when caller is not admin", async () => {
    const { magnifyCash, alice } = await loadFixture(deployMagnifyCash);

    await expect(
      magnifyCash.connect(alice).setLoanOriginationFee(100)
    ).to.be.revertedWithCustomError(magnifyCash, "Unauthorized");
  });
});
