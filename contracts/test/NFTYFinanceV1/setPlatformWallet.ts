import { expect } from "chai";
import { deployNftyFinance } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("NFTY Finance: Set platform wallet", function () {
  it("should fail for zero addr platform wallet", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);

    expect(
      nftyFinance.setPlatformWallet(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(nftyFinance, "PlatformWalletIsZeroAddr");
  });

  it("should set platform wallet", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);
    const platformWallet = ethers.Wallet.createRandom().address;

    const tx = await nftyFinance.setPlatformWallet(platformWallet);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyFinance, "PlatformWalletSet")
      .withArgs(platformWallet);
    expect(await nftyFinance.platformWallet()).to.equal(platformWallet);
  });

  it("should fail when caller is not admin", async () => {
    const { nftyFinance, alice } = await loadFixture(deployNftyFinance);

    await expect(
      nftyFinance.connect(alice).setPlatformWallet(alice.address)
    ).to.be.revertedWithCustomError(nftyFinance, "Unauthorized");
  });
});
