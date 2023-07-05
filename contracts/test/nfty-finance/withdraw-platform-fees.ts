import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNftyLendingWithTestTokens } from "../utils/fixtures";
import { expect } from "chai";

describe("Withdraw platform fees", () => {
  it("should fail if no fees to withdraw", async () => {
    const { nftyLending, erc20, alice } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.withdrawPlatformFees(erc20.address, alice.address)
    ).to.be.revertedWith("collected platform fees = 0");
  });
});
