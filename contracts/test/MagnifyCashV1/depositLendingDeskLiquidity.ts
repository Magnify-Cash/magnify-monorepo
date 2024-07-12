import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { initializeLendingDesk } from "../utils/fixtures";

describe("Magnify Cash: Deposit lending desk liquidity", () => {
  const liquidityAmount = BigInt(1000 * 10 ** 18);

  const createLendingDeskAndApproveErc20 = async () => {
    const { magnifyCash, lender, erc20, ...rest } = await loadFixture(
      initializeLendingDesk
    );

    // Mint ERC20 to lender and approve to Magnify Cash
    await erc20.connect(lender).mint(liquidityAmount);
    await erc20.connect(lender).approve(magnifyCash.target, liquidityAmount);

    return {
      magnifyCash,
      lender,
      erc20,
      ...rest,
    };
  };

  it("should fail for zero amount", async () => {
    const { magnifyCash, lender, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );

    await expect(
      magnifyCash.connect(lender).depositLendingDeskLiquidity(lendingDeskId, 0)
    ).to.be.revertedWithCustomError(magnifyCash, "AmountIsZero");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { magnifyCash, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );

    await expect(
      magnifyCash.depositLendingDeskLiquidity(lendingDeskId, liquidityAmount)
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotLendingDeskOwner");
  });

  it("should fail for invalid lending desk id", async () => {
    const { magnifyCash, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    await expect(
      magnifyCash.depositLendingDeskLiquidity(
        invalidLendingDeskId,
        liquidityAmount
      )
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLendingDeskId");
  });

  it("should fail if contract is paused", async () => {
    const { magnifyCash, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );
    await magnifyCash.setPaused(true);

    await expect(
      magnifyCash.depositLendingDeskLiquidity(lendingDeskId, liquidityAmount)
    ).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });

  it("should add liquidity to lending desk", async () => {
    const { magnifyCash, lender, lendingDeskId, lendingDesk, erc20 } =
      await loadFixture(createLendingDeskAndApproveErc20);

    const magnifyCashBalance = await erc20.balanceOf(magnifyCash.target);
    const lenderBalance = await erc20.balanceOf(lender.address);

    await expect(
      magnifyCash
        .connect(lender)
        .depositLendingDeskLiquidity(lendingDeskId, liquidityAmount)
    )
      .to.emit(magnifyCash, "LendingDeskLiquidityDeposited")
      .withArgs(lendingDeskId, liquidityAmount);

    // Check balances
    const newMagnifyCashBalance = await erc20.balanceOf(magnifyCash.target);
    expect(newMagnifyCashBalance).to.equal(
      magnifyCashBalance + liquidityAmount
    );

    const newLenderBalance = await erc20.balanceOf(lender.address);
    expect(newLenderBalance).to.equal(lenderBalance - liquidityAmount);

    // Check lending desk liquidity
    const newLendingDesk = await magnifyCash.lendingDesks(lendingDeskId);
    expect(newLendingDesk.balance).to.equal(
      lendingDesk.balance + liquidityAmount
    );
  });
});
