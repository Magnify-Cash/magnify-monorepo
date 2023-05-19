import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createLiquidityShop } from "../utils/fixtures";
import { expect } from "chai";

describe("Update liquidity shop", () => {
  const name = "My Shop: Updated";
  const interestA = 5;
  const interestB = 10;
  const interestC = 15;
  const maxOffer = 2000;
  const automaticApproval = false;
  const allowRefinancingTerms = true;

  it("should update liquidity shop", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      createLiquidityShop
    );

    await expect(
      nftyLending
        .connect(lender)
        .updateLiquidityShop(
          liquidityShopId,
          name,
          interestA,
          interestB,
          interestC,
          maxOffer,
          automaticApproval,
          allowRefinancingTerms
        )
    )
      .to.emit(nftyLending, "LiquidityShopUpdated")
      .withArgs(
        liquidityShopId,
        name,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      );

    // Assert storage is updated
    const newShop = await nftyLending.liquidityShops(liquidityShopId);
    expect(newShop.name).to.equal(name);
    expect(newShop.interestA).to.equal(interestA);
    expect(newShop.interestB).to.equal(interestB);
    expect(newShop.interestC).to.equal(interestC);
    expect(newShop.maxOffer).to.equal(maxOffer);
    expect(newShop.automaticApproval).to.equal(automaticApproval);
    expect(newShop.allowRefinancingTerms).to.equal(allowRefinancingTerms);
  });

  it("should fail when contract is paused", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      createLiquidityShop
    );
    await nftyLending.setPaused(true);

    await expect(
      nftyLending
        .connect(lender)
        .updateLiquidityShop(
          liquidityShopId,
          name,
          interestA,
          interestB,
          interestC,
          maxOffer,
          automaticApproval,
          allowRefinancingTerms
        )
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should fail for invalid shop id", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      createLiquidityShop
    );

    const invalidShopId = 2;
    // make sure it's not same as actual shop id
    expect(invalidShopId).to.not.equal(liquidityShopId);

    await expect(
      nftyLending
        .connect(lender)
        .updateLiquidityShop(
          invalidShopId,
          name,
          interestA,
          interestB,
          interestC,
          maxOffer,
          automaticApproval,
          allowRefinancingTerms
        )
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for non owner caller", async () => {
    const { nftyLending, liquidityShopId } = await loadFixture(
      createLiquidityShop
    );

    await expect(
      nftyLending.updateLiquidityShop(
        liquidityShopId,
        name,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail for zero interests", async () => {
    const { nftyLending, lender, liquidityShopId } = await loadFixture(
      createLiquidityShop
    );

    await expect(
      nftyLending.connect(lender).updateLiquidityShop(
        liquidityShopId,
        name,
        0, // interestA = 0
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("interestA = 0");

    await expect(
      nftyLending.connect(lender).updateLiquidityShop(
        liquidityShopId,
        name,
        interestA,
        0, // interestB = 0
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("interestB = 0");

    await expect(
      nftyLending.connect(lender).updateLiquidityShop(
        liquidityShopId,
        name,
        interestA,
        interestB,
        0, // interestC = 0
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("interestC = 0");
  });

  it("should fail for zero max offer", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      createLiquidityShop
    );

    await expect(
      nftyLending.connect(lender).updateLiquidityShop(
        liquidityShopId,
        name,
        interestA,
        interestB,
        interestC,
        0, // maxOffer = 0
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("max offer = 0");
  });

  it("should fail for empty shop name", async () => {
    const { nftyLending, liquidityShopId, lender } = await loadFixture(
      createLiquidityShop
    );

    await expect(
      nftyLending.connect(lender).updateLiquidityShop(
        liquidityShopId,
        "", // empty shop name
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("empty shop name");
  });
});
