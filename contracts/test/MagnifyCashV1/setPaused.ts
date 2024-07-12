import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployMagnifyCash } from "../utils/fixtures";
import { expect } from "chai";

describe("Magnify Cash: Set paused", () => {
  it("should fail when caller is not admin", async () => {
    const { magnifyCash, alice } = await loadFixture(deployMagnifyCash);

    // try pausing and unpausing both
    await expect(
      magnifyCash.connect(alice).setPaused(true)
    ).to.be.revertedWithCustomError(magnifyCash, "Unauthorized");
    await expect(
      magnifyCash.connect(alice).setPaused(false)
    ).to.be.revertedWithCustomError(magnifyCash, "Unauthorized");
  });

  it("should fail to pause when already paused", async () => {
    const { magnifyCash } = await loadFixture(deployMagnifyCash);
    await magnifyCash.setPaused(true);

    const tx = magnifyCash.setPaused(true);
    expect(tx).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });

  it("should fail to unpause when not paused", async () => {
    const { magnifyCash } = await loadFixture(deployMagnifyCash);

    const tx = magnifyCash.setPaused(false);
    expect(tx).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });

  it("should pause", async () => {
    const { magnifyCash, owner } = await loadFixture(deployMagnifyCash);
    expect(await magnifyCash.paused()).to.be.false;

    await expect(magnifyCash.setPaused(true))
      .to.emit(magnifyCash, "Paused")
      .withArgs(owner.address);

    expect(await magnifyCash.paused()).to.be.true;
  });

  it("should unpause", async () => {
    const { magnifyCash, owner } = await loadFixture(deployMagnifyCash);
    await magnifyCash.setPaused(true);
    expect(await magnifyCash.paused()).to.be.true;

    await expect(magnifyCash.setPaused(false))
      .to.emit(magnifyCash, "Unpaused")
      .withArgs(owner.address);

    expect(await magnifyCash.paused()).to.be.false;
  });
});
