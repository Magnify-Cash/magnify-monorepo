import { initializeLendingDesk } from "../utils/fixtures";
import { expect } from "chai";
import { LendingDeskStatus } from "../utils/consts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("NFTY Finance: Set lending desk state", () => {
  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lender, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    // Try freeze and unfreeze both
    await expect(
      nftyFinance
        .connect(lender)
        .setLendingDeskState(invalidLendingDeskId, true)
    ).to.be.revertedWith("invalid lending desk id");

    await expect(
      nftyFinance
        .connect(lender)
        .setLendingDeskState(invalidLendingDeskId, false)
    ).to.be.revertedWith("invalid lending desk id");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance.setLendingDeskState(lendingDeskId, true)
    ).to.be.revertedWith("not lending desk owner");
  });

  it("should fail to freeze when lending desk is frozen", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    // Freeze first
    nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, true);

    await expect(
      nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, true)
    ).to.be.revertedWith("lending desk not active");
  });

  it("should fail to unfreeze when lending desk is active", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, false)
    ).to.be.revertedWith("lending desk not frozen");
  });

  it("should freeze lending desk", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, true)
    )
      .to.emit(nftyFinance, "LendingDeskStateSet")
      .withArgs(lendingDeskId, true);

    const newLendingDesk = await nftyFinance.lendingDesks(lendingDeskId);
    expect(newLendingDesk.status).to.equal(LendingDeskStatus.Frozen);
  });

  it("should unfreeze liquidity shop", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    // Freeze first
    await nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, true);

    await expect(
      nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, false)
    )
      .to.emit(nftyFinance, "LendingDeskStateSet")
      .withArgs(lendingDeskId, false);

    const newLendingDesk = await nftyFinance.lendingDesks(lendingDeskId);
    expect(newLendingDesk.status).to.equal(LendingDeskStatus.Active);
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, true)
    ).to.be.revertedWithCustomError(nftyFinance, "EnforcedPause");
  });
});
