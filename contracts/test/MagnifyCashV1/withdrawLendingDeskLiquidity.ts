import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { initializeLendingDesk } from "../utils/fixtures";
import { expect } from "chai";

describe("Magnify Cash: Withdraw lending desk liquidity", () => {
  const amount = BigInt(10 * 10 ** 18);

  it("should fail for invalid lending desk id", async () => {
    const { magnifyCash, lendingDeskId } = await loadFixture(
      initializeLendingDesk
    );
    const invalidLendingDeskId = 2;

    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid
    await expect(
      magnifyCash.withdrawLendingDeskLiquidity(invalidLendingDeskId, amount)
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLendingDeskId");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { magnifyCash, lendingDeskId, alice } = await loadFixture(
      initializeLendingDesk
    );

    // valid ID, but caller is not owner
    await expect(
      magnifyCash
        .connect(alice)
        .withdrawLendingDeskLiquidity(lendingDeskId, amount)
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotLendingDeskOwner");
  });

  it("should withdraw lending desk liquidity", async () => {
    const { magnifyCash, lendingDeskId, lender, erc20, lendingDesk } =
      await loadFixture(initializeLendingDesk);

    const magnifyCashBalance = await erc20.balanceOf(magnifyCash.target);
    const lenderBalance = await erc20.balanceOf(lender.address);
    const lendingDeskBalance = lendingDesk.balance;

    // make sure shop and Magnify Cash balance is same
    expect(lendingDeskBalance).to.equal(magnifyCashBalance);

    // make sure amount is less than balance
    expect(amount).to.be.lessThan(lendingDesk.balance);

    await expect(
      magnifyCash
        .connect(lender)
        .withdrawLendingDeskLiquidity(lendingDeskId, amount)
    )
      .to.emit(magnifyCash, "LendingDeskLiquidityWithdrawn")
      .withArgs(lendingDeskId, amount);

    // check balances
    const newMagnifyCashBalance = await erc20.balanceOf(magnifyCash.target);
    expect(newMagnifyCashBalance).to.equal(magnifyCashBalance - amount);
    const newLenderBalance = await erc20.balanceOf(lender.address);
    expect(newLenderBalance).to.equal(lenderBalance + amount);

    // check storage
    const newLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);
    expect(newLendingDesk.balance).to.equal(lendingDeskBalance - amount);
  });

  it("should fail for insufficient balance", async () => {
    const { magnifyCash, lendingDeskId, lender, lendingDesk } =
      await loadFixture(initializeLendingDesk);
    const highAmount = BigInt(20000 * 10 ** 18);

    // make sure amount is greater than balance
    expect(highAmount).to.be.greaterThan(lendingDesk.balance);

    await expect(
      magnifyCash
        .connect(lender)
        .withdrawLendingDeskLiquidity(lendingDeskId, highAmount)
    ).to.be.revertedWithCustomError(
      magnifyCash,
      "InsufficientLendingDeskBalance"
    );
  });

  it("should fail for zero amount", async () => {
    const { magnifyCash, lendingDeskId, lender } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      magnifyCash.connect(lender).withdrawLendingDeskLiquidity(lendingDeskId, 0)
    ).to.be.revertedWithCustomError(magnifyCash, "AmountIsZero");
  });
});
