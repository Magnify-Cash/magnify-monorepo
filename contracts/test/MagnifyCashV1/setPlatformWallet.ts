import { expect } from "chai";
import { deployMagnifyCash } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("Magnify Cash: Set platform wallet", function () {
  it("should fail for zero addr platform wallet", async () => {
    const { magnifyCash } = await loadFixture(deployMagnifyCash);

    expect(
      magnifyCash.setPlatformWallet(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(magnifyCash, "PlatformWalletIsZeroAddr");
  });

  it("should set platform wallet", async () => {
    const { magnifyCash } = await loadFixture(deployMagnifyCash);
    const platformWallet = ethers.Wallet.createRandom().address;

    const tx = await magnifyCash.setPlatformWallet(platformWallet);

    // Check emitted event and storage
    expect(tx)
      .to.emit(magnifyCash, "PlatformWalletSet")
      .withArgs(platformWallet);
    expect(await magnifyCash.platformWallet()).to.equal(platformWallet);
  });

  it("should fail when caller is not admin", async () => {
    const { magnifyCash, alice } = await loadFixture(deployMagnifyCash);

    await expect(
      magnifyCash.connect(alice).setPlatformWallet(alice.address)
    ).to.be.revertedWithCustomError(magnifyCash, "Unauthorized");
  });
});
