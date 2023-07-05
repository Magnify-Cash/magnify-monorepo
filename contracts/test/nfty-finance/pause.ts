import { expect } from "chai";
import { deployNftyFinance } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Set paused", function () {
  it("should fail when caller is not admin", async () => {
    const { nftyFinance, alice } = await loadFixture(deployNftyFinance);

    const tx = nftyFinance.connect(alice).setPaused(true);
    expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should fail when already paused", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);
    await nftyFinance.setPaused(true);

    const tx = nftyFinance.setPaused(true);
    expect(tx).to.be.revertedWith("Pausable: paused");
  });

  it("should pause", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);

    const tx = nftyFinance.setPaused(true);

    expect(tx).to.emit(nftyFinance, "Paused");
    expect(await nftyFinance.paused()).to.equal(true);
  });

  it("should unpause", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinance);
    await nftyFinance.setPaused(true);

    const tx = nftyFinance.setPaused(false);

    expect(tx).to.emit(nftyFinance, "Unpaused");
    expect(await nftyFinance.paused()).to.equal(false);
  });
});
