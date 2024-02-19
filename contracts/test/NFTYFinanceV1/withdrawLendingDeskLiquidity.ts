import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { initializeLendingDesk } from "../utils/fixtures";
import { expect } from "chai";

describe("NFTY Finance: Withdraw lending desk liquidity", () => {
  const amount = BigInt(10 * 10 ** 18);

  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );
    const invalidLendingDeskId = 2;

    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid
    await expect(
      nftyFinance.withdrawLendingDeskLiquidity(invalidLendingDeskId, amount)
    ).to.be.revertedWithCustomError(nftyFinance, "InvalidLendingDeskId");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { nftyFinance, lendingDeskId, alice } = await loadFixture(
      initializeLendingDesk
    );

    // valid ID, but caller is not owner
    await expect(
      nftyFinance
        .connect(alice)
        .withdrawLendingDeskLiquidity(lendingDeskId, amount)
    ).to.be.revertedWithCustomError(nftyFinance, "CallerIsNotLendingDeskOwner");
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.withdrawLendingDeskLiquidity(lendingDeskId, amount)
    ).to.be.revertedWithCustomError(nftyFinance, "EnforcedPause");
  });

  it("should withdraw lending desk liquidity", async () => {
    const { nftyFinance, lendingDeskId, lender, erc20, lendingDesk } =
      await loadFixture(initializeLendingDesk);

    const nftyFinanceBalance = await erc20.balanceOf(nftyFinance.target);
    const lenderBalance = await erc20.balanceOf(lender.address);
    const lendingDeskBalance = lendingDesk.balance;

    // make sure shop and NFTYLending balance is same
    expect(lendingDeskBalance).to.equal(nftyFinanceBalance);

    // make sure amount is less than balance
    expect(amount).to.be.lessThan(lendingDesk.balance);

    await expect(
      nftyFinance
        .connect(lender)
        .withdrawLendingDeskLiquidity(lendingDeskId, amount)
    )
      .to.emit(nftyFinance, "LendingDeskLiquidityWithdrawn")
      .withArgs(lendingDeskId, amount);

    // check balances
    const newNftyFinanceBalance = await erc20.balanceOf(nftyFinance.target);
    expect(newNftyFinanceBalance).to.equal(nftyFinanceBalance - amount);
    const newLenderBalance = await erc20.balanceOf(lender.address);
    expect(newLenderBalance).to.equal(lenderBalance + amount);

    // check storage
    const newLendingDesk = await nftyFinance.lendingDesks(lendingDeskId);
    expect(newLendingDesk.balance).to.equal(lendingDeskBalance - amount);
  });

  it("should fail for insufficient balance", async () => {
    const { nftyFinance, lendingDeskId, lender, lendingDesk } =
      await loadFixture(initializeLendingDesk);
    const highAmount = BigInt(20000 * 10 ** 18);

    // make sure amount is greater than balance
    expect(highAmount).to.be.greaterThan(lendingDesk.balance);

    await expect(
      nftyFinance
        .connect(lender)
        .withdrawLendingDeskLiquidity(lendingDeskId, highAmount)
    ).to.be.revertedWithCustomError(
      nftyFinance,
      "InsufficientLendingDeskBalance"
    );
  });

  it("should fail for zero amount", async () => {
    const { nftyFinance, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance.connect(lender).withdrawLendingDeskLiquidity(lendingDeskId, 0)
    ).to.be.revertedWithCustomError(nftyFinance, "AmountIsZero");
  });
});
