import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { createLiquidityShop } from "../fixtures";

describe("Add liquidity to shop", () => {
  const liquidityAmount = 1000;

  const createLiquidityShopAndApproveErc20 = async () => {
    const { nftyLending, lender, erc20, ...rest } = await loadFixture(
      createLiquidityShop
    );

    // Mint ERC20 to lender and approve to NFTYLending
    await erc20.connect(lender).mint(liquidityAmount);
    await erc20.connect(lender).approve(nftyLending.address, liquidityAmount);

    return {
      nftyLending,
      lender,
      erc20,
      ...rest,
    };
  };

  it("should fail for zero amount", async () => {
    const { nftyLending, lender, liquidityShopId } = await loadFixture(
      createLiquidityShopAndApproveErc20
    );

    await expect(
      nftyLending.connect(lender).addLiquidityToShop(liquidityShopId, 0)
    ).to.be.revertedWith("amount = 0");
  });

  it("should fail for invalid caller", async () => {
    const { nftyLending, liquidityShopId } = await loadFixture(
      createLiquidityShopAndApproveErc20
    );

    await expect(
      nftyLending.addLiquidityToShop(liquidityShopId, liquidityAmount)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail for invalid shop id", async () => {
    const { nftyLending, liquidityShopId } = await loadFixture(
      createLiquidityShopAndApproveErc20
    );

    const invalidShopId = 2;
    expect(liquidityShopId).to.not.equal(invalidShopId); // check if actually invalid

    await expect(
      nftyLending.addLiquidityToShop(invalidShopId, liquidityAmount)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail if contract is paused", async () => {
    const { nftyLending, liquidityShopId } = await loadFixture(
      createLiquidityShopAndApproveErc20
    );
    await nftyLending.setPaused(true);

    await expect(
      nftyLending.addLiquidityToShop(liquidityShopId, liquidityAmount)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should add liquidity to shop", async () => {
    const { nftyLending, lender, liquidityShopId, liquidityShop, erc20 } =
      await loadFixture(createLiquidityShopAndApproveErc20);

    const nftyLendingBalance = await erc20.balanceOf(nftyLending.address);
    const lenderBalance = await erc20.balanceOf(lender.address);

    await expect(
      nftyLending
        .connect(lender)
        .addLiquidityToShop(liquidityShopId, liquidityAmount)
    )
      .to.emit(nftyLending, "LiquidityAddedToShop")
      .withArgs(
        lender.address,
        liquidityShopId,
        liquidityShop.balance.add(liquidityAmount),
        liquidityAmount
      );

    // Check balances
    const newNftyLendingBalance = await erc20.balanceOf(nftyLending.address);
    expect(newNftyLendingBalance).to.equal(
      nftyLendingBalance.add(liquidityAmount)
    );

    const newLenderBalance = await erc20.balanceOf(lender.address);
    expect(newLenderBalance).to.equal(lenderBalance.sub(liquidityAmount));
  });
});
