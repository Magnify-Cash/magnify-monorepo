import { initializeLendingDesk } from "../utils/fixtures";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { LendingDeskStatus } from "../utils/consts";
import { ethers } from "hardhat";

describe("NFTY Finance: Dissolve lending desk", () => {
  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lender, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    // Try freeze and unfreeze both
    await expect(
      nftyFinance.connect(lender).dissolveLendingDesk(invalidLendingDeskId)
    ).to.be.revertedWith("invalid lending desk id");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance.dissolveLendingDesk(lendingDeskId)
    ).to.be.revertedWith("not lending desk owner");
  });

  it("should fail to when lending desk has some balance", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance.connect(lender).dissolveLendingDesk(lendingDeskId)
    ).to.be.revertedWith("lending desk not empty");
  });

  it("should dissolve lending desk", async () => {
    const { nftyFinance, lendingDeskId, lender, initialBalance, lendingKeys } =
      await loadFixture(initializeLendingDesk);

    // empty out lending desk
    await nftyFinance
      .connect(lender)
      .withdrawLendingDeskLiquidity(lendingDeskId, initialBalance);

    await expect(nftyFinance.connect(lender).dissolveLendingDesk(lendingDeskId))
      .to.emit(nftyFinance, "LendingDeskDissolved")
      .withArgs(lendingDeskId)
      .to.emit(lendingKeys, "Transfer")
      .withArgs(lender.address, ethers.constants.AddressZero, lendingDeskId);

    const newLendingDesk = await nftyFinance.lendingDesks(lendingDeskId);
    expect(newLendingDesk.status).to.equal(LendingDeskStatus.Dissolved);
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.connect(lender).dissolveLendingDesk(lendingDeskId)
    ).to.be.revertedWith("Pausable: paused");
  });
});
