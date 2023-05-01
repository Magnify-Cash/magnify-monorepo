const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SHOP_STATUS, MINIMUM_BASKET_SIZE } = require("./utils/consts");
const { deployEscrow } = require("./utils/funcs");

describe("Unfreeze liquidity shop", function () {
  beforeEach(async function () {
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
    const [automaticApproval, allowRefinancingTerms] = [true, true];
    const liquidityAmount = MINIMUM_BASKET_SIZE; // currency tokens
    const interestA = 20;
    const interestB = 30;
    const interestC = 40;
    const maxOffer = 10;
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
      this.escrow.unfreezeLiquidityShop(invalidShopId)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for invalid caller", async function () {
    // valid ID, but caller is not owner
    await expect(
      this.escrow.connect(alice).unfreezeLiquidityShop(this.shopId)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail for non frozen shops", async function () {
    // shop active
    await expect(
      this.escrow.unfreezeLiquidityShop(this.shopId)
    ).to.be.revertedWith("shop not frozen");
  });

  it("should pass for valid conditions", async function () {
    await this.escrow.freezeLiquidityShop(this.shopId);

    const tx = await this.escrow.unfreezeLiquidityShop(this.shopId);
    expect(tx).to.emit(this.escrow, "LiquidityShopUnfrozen");
    const response = await tx.wait();

    // check event fields
    const unfreezeEvent = response.events.find(
      (event) => event.event == "LiquidityShopUnfrozen"
    ).args;
    expect(unfreezeEvent.owner).to.equal(owner.address);
    expect(unfreezeEvent.id).to.equal(this.shopId);
    expect(unfreezeEvent.balance).to.equal(this.shopBalance); // balance should not change

    const shop = await this.escrow.liquidityShops(this.shopId);
    expect(shop.status).to.equal(SHOP_STATUS.ACTIVE);
  });

  it("should fail if contract is paused", async function () {
    await this.escrow.setPaused(true);

    await expect(
      this.escrow.unfreezeLiquidityShop(this.shopId)
    ).to.be.revertedWith("Pausable: paused");
  });
});
