import { expect } from "chai";
import { LiquidityShopStatus } from "./utils/consts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createLiquidityShop } from "./fixtures";

describe("Freeze liquidity shop", () => {
  it("should fail for invalid shop id", async () => {
    const { liquidityShopId, nftyLending } = await loadFixture(
      createLiquidityShop
    );
    const invalidShopId = 2;

    expect(liquidityShopId).to.not.equal(invalidShopId); // check if actually invalid
    await expect(
      nftyLending.freezeLiquidityShop(invalidShopId)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for non owner caller", async () => {
    const { liquidityShopId, nftyLending, alice } = await loadFixture(
      createLiquidityShop
    );

    await expect(
      nftyLending.connect(alice).freezeLiquidityShop(liquidityShopId)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should freeze liquidity shop", async () => {
    const { liquidityShopId, nftyLending, lender, liquidityShop } =
      await loadFixture(createLiquidityShop);

    await expect(
      nftyLending.connect(lender).freezeLiquidityShop(liquidityShopId)
    )
      .to.emit(nftyLending, "LiquidityShopFrozen")
      .withArgs(lender.address, liquidityShopId, liquidityShop.balance);

    const updatedShop = await nftyLending.liquidityShops(liquidityShopId);
    expect(updatedShop.status).to.equal(LiquidityShopStatus.Frozen);
  });

  it("should fail for non active shops", async () => {
    const { liquidityShopId, nftyLending, lender } = await loadFixture(
      createLiquidityShop
    );

    // freeze shop
    await nftyLending.connect(lender).freezeLiquidityShop(liquidityShopId);

    // shop already frozen
    await expect(
      nftyLending.connect(lender).freezeLiquidityShop(liquidityShopId)
    ).to.be.revertedWith("shop not active");
  });

  it("should fail if contract is paused", async () => {
    const { liquidityShopId, nftyLending, lender } = await loadFixture(
      createLiquidityShop
    );

    await nftyLending.setPaused(true);

    await expect(
      nftyLending.connect(lender).freezeLiquidityShop(liquidityShopId)
    ).to.be.revertedWith("Pausable: paused");
  });
});
