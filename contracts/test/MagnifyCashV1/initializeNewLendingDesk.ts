import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployMagnifyCashWithTestTokens } from "../utils/fixtures";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingDeskStatus } from "../utils/consts";
import { getEvent, getEventNames } from "../utils/utils";

describe("Magnify Cash: Initialize new lending desk", () => {
  const initialBalance = 10000;

  it("should fail for zero address ERC20", async () => {
    const { magnifyCash } = await loadFixture(deployMagnifyCashWithTestTokens);

    await expect(
      magnifyCash.initializeNewLendingDesk(
        ethers.ZeroAddress, // zero address
        initialBalance,
        []
      )
    ).to.be.revertedWithCustomError(magnifyCash, "ERC20IsZeroAddr");
  });

  it("should fail if contract is paused", async () => {
    const { magnifyCash, erc20 } = await loadFixture(
      deployMagnifyCashWithTestTokens
    );
    await magnifyCash.setPaused(true);

    await expect(
      magnifyCash.initializeNewLendingDesk(erc20.target, initialBalance, [])
    ).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });

  it("should create lending desk", async () => {
    const { magnifyCash, erc20, lendingKeys } = await loadFixture(
      deployMagnifyCashWithTestTokens
    );
    const [lender] = await ethers.getSigners();

    // Get ERC20 and approve
    await erc20.connect(lender).mint(initialBalance);
    await erc20.connect(lender).approve(magnifyCash.target, initialBalance);

    // Create liquidity shop
    const tx = await magnifyCash
      .connect(lender)
      .initializeNewLendingDesk(erc20.target, initialBalance, []);

    // Check order of events emitted
    const eventNames = await getEventNames(tx);
    expect(eventNames).to.deep.equal([
      "LendingDeskLoanConfigsSet",
      "LendingDeskLiquidityDeposited",
      "NewLendingDeskInitialized",
    ]);

    const event = await getEvent(tx, "NewLendingDeskInitialized");
    const lendingDeskId = event?.lendingDeskId;

    // Check emitted events
    await expect(tx)
      .emit(magnifyCash, "NewLendingDeskInitialized")
      .withArgs(lendingDeskId, lender.address, erc20.target, initialBalance, []);

    await expect(tx)
      .emit(magnifyCash, "LendingDeskLoanConfigsSet")
      .withArgs(lendingDeskId, []);

    await expect(tx)
      .emit(magnifyCash, "LendingDeskLiquidityDeposited")
      .withArgs(lendingDeskId, initialBalance);

    // Make sure lending desk ownership NFT got minted
    await expect(tx)
      .emit(lendingKeys, "Transfer")
      .withArgs(ethers.ZeroAddress, lender.address, lendingDeskId);

    // Check ERC20 balances
    expect(await erc20.balanceOf(lender.address)).to.equal(0);
    expect(await erc20.balanceOf(magnifyCash.target)).to.equal(initialBalance);

    // Get lending desk from storage
    const lendingDesk = await magnifyCash.lendingDesks(event?.lendingDeskId);

    // Asserts
    expect(lendingDesk.erc20).to.equal(erc20.target);
    expect(lendingDesk.balance).to.equal(initialBalance);
    expect(lendingDesk.status).to.equal(LendingDeskStatus.Active);
  });
});
