import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNftyLending } from "../utils/fixtures";
import { expect } from "chai";

describe("Withdraw platform fees", () => {
  it("should fail if no fees to withdraw", async () => {
    const { nftyLending, alice } = await loadFixture(deployNftyLending);

    await expect(
      nftyLending.withdrawPlatformFees(alice.address)
    ).to.be.revertedWith("collected platform fees = 0");
  });
});
