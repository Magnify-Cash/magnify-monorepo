import { initializeLendingDesk } from "../utils/fixtures";
import { expect } from "chai";
import { LendingDeskStatus } from "../utils/consts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Magnify Cash: Set lending desk state", () => {
  it("should fail for invalid lending desk id", async () => {
    const { magnifyCash, lender, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    // Try freeze and unfreeze both
    await expect(
      magnifyCash
        .connect(lender)
        .setLendingDeskState(invalidLendingDeskId, true)
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLendingDeskId");

    await expect(
      magnifyCash
        .connect(lender)
        .setLendingDeskState(invalidLendingDeskId, false)
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLendingDeskId");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { magnifyCash, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      magnifyCash.setLendingDeskState(lendingDeskId, true)
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotLendingDeskOwner");
  });

  it("should fail to freeze when lending desk is frozen", async () => {
    const { magnifyCash, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    // Freeze first
    magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, true);

    await expect(
      magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, true)
    ).to.be.revertedWithCustomError(magnifyCash, "LendingDeskIsNotActive");
  });

  it("should fail to unfreeze when lending desk is active", async () => {
    const { magnifyCash, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, false)
    ).to.be.revertedWithCustomError(magnifyCash, "LendingDeskIsNotFrozen");
  });

  it("should freeze lending desk", async () => {
    const { magnifyCash, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, true)
    )
      .to.emit(magnifyCash, "LendingDeskStateSet")
      .withArgs(lendingDeskId, true);

    const newLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);
    expect(newLendingDesk.status).to.equal(LendingDeskStatus.Frozen);
  });

  it("should unfreeze liquidity shop", async () => {
    const { magnifyCash, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    // Freeze first
    await magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, true);

    await expect(
      magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, false)
    )
      .to.emit(magnifyCash, "LendingDeskStateSet")
      .withArgs(lendingDeskId, false);

    const newLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);
    expect(newLendingDesk.status).to.equal(LendingDeskStatus.Active);
  });

  it("should fail if contract is paused", async () => {
    const { magnifyCash, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    await magnifyCash.setPaused(true);

    await expect(
      magnifyCash.connect(lender).setLendingDeskState(lendingDeskId, true)
    ).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });
});
