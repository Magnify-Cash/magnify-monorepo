import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { initializeLendingDesk } from "../utils/fixtures";

describe("NFTY Finance: Deposit lending desk liquidity", () => {
  const liquidityAmount = BigInt(1000 * 10 ** 18);

  const createLendingDeskAndApproveErc20 = async () => {
    const { nftyFinance, lender, erc20, ...rest } = await loadFixture(
      initializeLendingDesk
    );

    // Mint ERC20 to lender and approve to NFTYLending
    await erc20.connect(lender).mint(liquidityAmount);
    await erc20.connect(lender).approve(nftyFinance.target, liquidityAmount);

    return {
      nftyFinance,
      lender,
      erc20,
      ...rest,
    };
  };

  it("should fail for zero amount", async () => {
    const { nftyFinance, lender, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );

    await expect(
      nftyFinance.connect(lender).depositLendingDeskLiquidity(lendingDeskId, 0)
    ).to.be.revertedWith("amount = 0");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );

    await expect(
      nftyFinance.depositLendingDeskLiquidity(lendingDeskId, liquidityAmount)
    ).to.be.revertedWith("not lending desk owner");
  });

  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    await expect(
      nftyFinance.depositLendingDeskLiquidity(
        invalidLendingDeskId,
        liquidityAmount
      )
    ).to.be.revertedWith("invalid lending desk id");
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, lendingDeskId } = await loadFixture(
      createLendingDeskAndApproveErc20
    );
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance.depositLendingDeskLiquidity(lendingDeskId, liquidityAmount)
    ).to.be.revertedWithCustomError(nftyFinance, "EnforcedPause");
  });

  it("should add liquidity to lending desk", async () => {
    const { nftyFinance, lender, lendingDeskId, lendingDesk, erc20 } =
      await loadFixture(createLendingDeskAndApproveErc20);

    const nftyFinanceBalance = await erc20.balanceOf(nftyFinance.target);
    const lenderBalance = await erc20.balanceOf(lender.address);

    await expect(
      nftyFinance
        .connect(lender)
        .depositLendingDeskLiquidity(lendingDeskId, liquidityAmount)
    )
      .to.emit(nftyFinance, "LendingDeskLiquidityDeposited")
      .withArgs(lendingDeskId, liquidityAmount);

    // Check balances
    const newNftyFinanceBalance = await erc20.balanceOf(nftyFinance.target);
    expect(newNftyFinanceBalance).to.equal(
      nftyFinanceBalance + liquidityAmount
    );

    const newLenderBalance = await erc20.balanceOf(lender.address);
    expect(newLenderBalance).to.equal(lenderBalance - liquidityAmount);

    // Check lending desk liquidity
    const newLendingDesk = await nftyFinance.lendingDesks(lendingDeskId);
    expect(newLendingDesk.balance).to.equal(
      lendingDesk.balance + liquidityAmount
    );
  });
});
