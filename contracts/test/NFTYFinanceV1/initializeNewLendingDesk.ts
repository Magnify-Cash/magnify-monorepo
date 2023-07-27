import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNftyFinanceWithTestTokens } from "../utils/fixtures";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LendingDeskStatus } from "../utils/consts";

describe("NFTY Finance: Initialize new lending desk", () => {
  const initialBalance = 10000;

  it("should fail for zero address ERC20", async () => {
    const { nftyFinance } = await loadFixture(deployNftyFinanceWithTestTokens);

    await expect(
      nftyFinance.initializeNewLendingDesk(
        ethers.constants.AddressZero, // zero address
        initialBalance,
        []
      )
    ).to.be.revertedWith("zero addr erc20");
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, erc20 } = await loadFixture(
      deployNftyFinanceWithTestTokens
    );
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.initializeNewLendingDesk(erc20.address, initialBalance, [])
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should create lending desk", async () => {
    const { nftyFinance, erc20, lendingKeys } = await loadFixture(
      deployNftyFinanceWithTestTokens
    );
    const [lender] = await ethers.getSigners();

    // Get ERC20 and approve
    await erc20.connect(lender).mint(initialBalance);
    await erc20.connect(lender).approve(nftyFinance.address, initialBalance);

    // Create liquidity shop
    const tx = await nftyFinance
      .connect(lender)
      .initializeNewLendingDesk(erc20.address, initialBalance, []);

    // Check order of events emitted
    const receipt = await tx.wait();
    const eventNames = receipt.events?.map((x) => x.event).filter((x) => x);
    expect(eventNames).to.deep.equal([
      "LendingDeskLoanConfigsSet",
      "LendingDeskLiquidityDeposited",
      "NewLendingDeskInitialized",
    ]);

    const { events } = await tx.wait();
    const event = events?.find(
      (event) => event.event == "NewLendingDeskInitialized"
    )?.args;
    const lendingDeskId = event?.lendingDeskId;

    // Check emitted events
    await expect(tx)
      .emit(nftyFinance, "NewLendingDeskInitialized")
      .withArgs(lendingDeskId, lender.address, erc20.address);

    await expect(tx)
      .emit(nftyFinance, "LendingDeskLoanConfigsSet")
      .withArgs(lendingDeskId, []);

    await expect(tx)
      .emit(nftyFinance, "LendingDeskLiquidityDeposited")
      .withArgs(lendingDeskId, initialBalance);

    // Make sure lending desk ownership NFT got minted
    await expect(tx)
      .emit(lendingKeys, "Transfer")
      .withArgs(ethers.constants.AddressZero, lender.address, lendingDeskId);

    // Check ERC20 balances
    expect(await erc20.balanceOf(lender.address)).to.equal(0);
    expect(await erc20.balanceOf(nftyFinance.address)).to.equal(initialBalance);

    // Get lending desk from storage
    const lendingDesk = await nftyFinance.lendingDesks(event?.lendingDeskId);

    // Asserts
    expect(lendingDesk.erc20).to.equal(erc20.address);
    expect(lendingDesk.balance).to.equal(initialBalance);
    expect(lendingDesk.status).to.equal(LendingDeskStatus.Active);
  });
});
