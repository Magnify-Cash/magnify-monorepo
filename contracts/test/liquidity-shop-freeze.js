const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SHOP_STATUS, MINIMUM_BASKET_SIZE } = require("./utils/consts");
const { deployEscrow } = require("./utils/funcs");

describe("Freeze liquidity shop", function () {
  before(async function () {
    [owner, alice] = await ethers.getSigners();

    [
      this.escrow,
      this.promissoryNote,
      this.obligationReceipt,
      this.nftyToken,
      this.currency,
      this.nftCollection,
    ] = await deployEscrow();

    // shop
    const shopName = "TestShop";
    const interestA = 20;
    const interestB = 30;
    const interestC = 40;
    const maxOffer = 10;
    const [automaticApproval, allowRefinancingTerms] = [true, true];
    const liquidityAmount = MINIMUM_BASKET_SIZE;
    await this.currency.approve(this.escrow.address, liquidityAmount);
    const tx = await this.escrow.createLiquidityShop(
      shopName,
      this.currency.address,
      this.nftCollection.address,
      liquidityAmount,
      interestA,
      interestB,
      interestC,
      maxOffer,
      automaticApproval,
      allowRefinancingTerms
    );
    const response = await tx.wait();
    const createEvent = response.events.find(
      (event) => event.event == "LiquidityShopCreated"
    ).args;
    this.shopId = createEvent.id;
    this.shopBalance = createEvent.amount;
  });

  it("should fail for invalid id", async function () {
    const invalidShopId = 2;
    expect(this.shopId).to.not.equal(invalidShopId); // check if actually invalid

    await expect(
      this.escrow.freezeLiquidityShop(invalidShopId)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for invalid caller", async function () {
    // valid ID, but caller is not owner
    await expect(
      this.escrow.connect(alice).freezeLiquidityShop(this.shopId)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should pass for valid conditions", async function () {
    const tx = await this.escrow.freezeLiquidityShop(this.shopId);
    expect(tx).to.emit(this.escrow, "LiquidityShopFrozen");
    const response = await tx.wait();

    // check event fields
    const freezeEvent = response.events.find(
      (event) => event.event == "LiquidityShopFrozen"
    ).args;
    expect(freezeEvent.owner).to.equal(owner.address);
    expect(freezeEvent.id).to.equal(this.shopId);
    expect(freezeEvent.balance).to.equal(this.shopBalance); // balance should not change

    const shop = await this.escrow.liquidityShops(this.shopId);
    expect(shop.status).to.equal(SHOP_STATUS.FROZEN);
  });

  it("should fail for non active shops", async function () {
    // shop already frozen
    await expect(
      this.escrow.freezeLiquidityShop(this.shopId)
    ).to.be.revertedWith("shop not active");
  });

  it("should fail if contract is paused", async function () {
    await this.escrow.setPaused(true);

    await expect(
      this.escrow.freezeLiquidityShop(this.shopId)
    ).to.be.revertedWith("Pausable: paused");
  });
});
