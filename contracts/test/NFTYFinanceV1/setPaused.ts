import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNftyFinance } from "../utils/fixtures";
import { expect } from "chai";

describe("NFTY Finance: Set paused", () => {
  it("should fail when caller is not admin", async () => {
    const { nftyFinance, alice } = await loadFixture(deployNftyFinance);

    // try pausing and unpausing both
    await expect(nftyFinance.connect(alice).setPaused(true)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    await expect(
      nftyFinance.connect(alice).setPaused(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should fail to pause when already paused", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);
    await nftyFinance.setPaused(true);

    const tx = nftyFinance.setPaused(true);
    expect(tx).to.be.revertedWith("Pausable: paused");
  });

  it("should fail to unpause when not paused", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);

    const tx = nftyFinance.setPaused(false);
    expect(tx).to.be.revertedWith("Pausable: unpaused");
  });

  it("should pause", async () => {
    const { nftyFinance, owner } = await loadFixture(deployNftyFinance);
    expect(await nftyFinance.paused()).to.be.false;

    await expect(nftyFinance.setPaused(true))
      .to.emit(nftyFinance, "Paused")
      .withArgs(owner.address);

    expect(await nftyFinance.paused()).to.be.true;
  });

  it("should unpause", async () => {
    const { nftyFinance, owner } = await loadFixture(deployNftyFinance);
    await nftyFinance.setPaused(true);
    expect(await nftyFinance.paused()).to.be.true;

    await expect(nftyFinance.setPaused(false))
      .to.emit(nftyFinance, "Unpaused")
      .withArgs(owner.address);

    expect(await nftyFinance.paused()).to.be.false;
  });
});
