import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createLiquidityShop } from "../utils/fixtures";
import { expect } from "chai";

describe("Cash out liquidity shop", () => {
  const cashOutAmount = 1000;

  it("should fail for invalid shop id", async () => {
    const { nftyLending, liquidityShopId } = await loadFixture(
      createLiquidityShop
    );
    const invalidShopId = 2;

    expect(liquidityShopId).to.not.equal(invalidShopId); // check if actually invalid
    await expect(
      nftyLending.cashOutLiquidityShop(invalidShopId, cashOutAmount)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for non owner caller", async () => {
    const { nftyLending, liquidityShopId, alice } = await loadFixture(
      createLiquidityShop
    );

    // valid ID, but caller is not owner
    await expect(
      nftyLending
        .connect(alice)
        .cashOutLiquidityShop(liquidityShopId, cashOutAmount)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail if contract is paused", async () => {
    const { nftyLending, liquidityShopId, alice } = await loadFixture(
      createLiquidityShop
    );
    await nftyLending.setPaused(true);

    await expect(
      nftyLending.cashOutLiquidityShop(liquidityShopId, cashOutAmount)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should cash out liquidity shop", async () => {
    const { nftyLending, liquidityShopId, lender, erc20, liquidityShop } =
      await loadFixture(createLiquidityShop);

    const nftyLendingBalance = await erc20.balanceOf(nftyLending.address);
    const lenderBalance = await erc20.balanceOf(lender.address);
    const shopBalance = liquidityShop.balance;

    // make sure shop and NFTYLending balance is same
    expect(shopBalance).to.equal(nftyLendingBalance);

    // make sure amount is less than balance
    expect(cashOutAmount).to.be.lessThan(liquidityShop.balance);

    await expect(
      nftyLending
        .connect(lender)
        .cashOutLiquidityShop(liquidityShopId, cashOutAmount)
    )
      .to.emit(nftyLending, "LiquidityShopCashedOut")
      .withArgs(
        lender.address,
        liquidityShopId,
        cashOutAmount,
        shopBalance.sub(cashOutAmount)
      );

    // check balances
    const newNftyLendingBalance = await erc20.balanceOf(nftyLending.address);
    expect(newNftyLendingBalance).to.equal(
      nftyLendingBalance.sub(cashOutAmount)
    );
    const newLenderBalance = await erc20.balanceOf(lender.address);
    expect(newLenderBalance).to.equal(lenderBalance.add(cashOutAmount));

    // check storage
    const newShop = await nftyLending.liquidityShops(liquidityShopId);
    expect(newShop.balance).to.equal(shopBalance.sub(cashOutAmount));
  });

  it("should fail for insufficient balance", async () => {
    const { nftyLending, liquidityShopId, lender, erc20, liquidityShop } =
      await loadFixture(createLiquidityShop);
    const highCashOutAmount = 20000;

    // make sure amount is greater than balance
    expect(highCashOutAmount).to.be.greaterThan(liquidityShop.balance);

    await expect(
      nftyLending
        .connect(lender)
        .cashOutLiquidityShop(liquidityShopId, highCashOutAmount)
    ).to.be.revertedWith("insufficient shop balance");
  });
});
