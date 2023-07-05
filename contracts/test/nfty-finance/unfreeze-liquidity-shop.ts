import { createLiquidityShop } from "../utils/fixtures";
import { expect } from "chai";
import { LiquidityShopStatus } from "../utils/consts";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Unfreeze liquidity shop", () => {
  const createAndFreezeLiquidityShop = async () => {
    const { lender, nftyLending, liquidityShopId, ...rest } =
      await createLiquidityShop();
    await nftyLending.connect(lender).freezeLiquidityShop(liquidityShopId);
    return { lender, nftyLending, liquidityShopId, ...rest };
  };

  it("should fail for invalid id", async () => {
    const { nftyLending, lender, liquidityShopId } = await loadFixture(
      createAndFreezeLiquidityShop
    );

    const invalidShopId = 2;
    expect(liquidityShopId).to.not.equal(invalidShopId); // check if actually invalid

    await expect(
      nftyLending.connect(lender).unfreezeLiquidityShop(invalidShopId)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for invalid caller", async () => {
    const { nftyLending, liquidityShopId } = await loadFixture(
      createAndFreezeLiquidityShop
    );

    await expect(
      nftyLending.unfreezeLiquidityShop(liquidityShopId)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail for non frozen shops", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      // load the create shop fixture which doesn't freeze it
      createLiquidityShop
    );

    await expect(
      nftyLending.connect(lender).unfreezeLiquidityShop(liquidityShopId)
    ).to.be.revertedWith("shop not frozen");
  });

  it("should unfreeze liquidity shop", async () => {
    const { nftyLending, liquidityShopId, lender, liquidityShop } =
      await loadFixture(createAndFreezeLiquidityShop);

    await expect(
      nftyLending.connect(lender).unfreezeLiquidityShop(liquidityShopId)
    )
      .to.emit(nftyLending, "LiquidityShopUnfrozen")
      .withArgs(lender.address, liquidityShopId, liquidityShop.balance);

    const newShop = await nftyLending.liquidityShops(liquidityShopId);
    expect(newShop.status).to.equal(LiquidityShopStatus.Active);
  });

  it("should fail if contract is paused", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      createAndFreezeLiquidityShop
    );
    await nftyLending.setPaused(true);

    await expect(
      nftyLending.connect(lender).unfreezeLiquidityShop(liquidityShopId)
    ).to.be.revertedWith("Pausable: paused");
  });
});
