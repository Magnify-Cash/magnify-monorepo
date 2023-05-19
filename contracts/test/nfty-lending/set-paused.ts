import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNftyLending } from "../utils/fixtures";
import { expect } from "chai";

describe("Set paused", () => {
  it("should fail for non owner caller", async () => {
    const { nftyLending, alice } = await loadFixture(deployNftyLending);

    // try pausing and unpausing both
    await expect(nftyLending.connect(alice).setPaused(true)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    await expect(
      nftyLending.connect(alice).setPaused(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should pause", async () => {
    const { nftyLending, owner } = await loadFixture(deployNftyLending);
    expect(await nftyLending.paused()).to.be.false;

    await expect(nftyLending.setPaused(true))
      .to.emit(nftyLending, "Paused")
      .withArgs(owner.address);

    expect(await nftyLending.paused()).to.be.true;
  });

  it("should unpause", async () => {
    const { nftyLending, owner } = await loadFixture(deployNftyLending);
    await nftyLending.setPaused(true);
    expect(await nftyLending.paused()).to.be.true;

    await expect(nftyLending.setPaused(false))
      .to.emit(nftyLending, "Unpaused")
      .withArgs(owner.address);

    expect(await nftyLending.paused()).to.be.false;
  });
});
