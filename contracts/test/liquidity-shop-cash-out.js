const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MINIMUM_BASKET_SIZE } = require("./utils/consts");
const { deployEscrow } = require("./utils/funcs");

describe("Cash out liquidity shop", function () {
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
    const interestA = 20;
    const interestB = 30;
    const interestC = 40;
    const maxOffer = 10;
    const liquidityShopName = "My-Shop";
    const [automaticApproval, allowRefinancingTerms] = [true, true];
    const liquidityAmount = MINIMUM_BASKET_SIZE;
    await this.currency.approve(this.escrow.address, liquidityAmount);
    const tx = await this.escrow.createLiquidityShop(
      liquidityShopName,
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
    this.shopOwner = createEvent.owner;
  });

  it("should fail for invalid id", async function () {
    const invalidShopId = 2;
    expect(this.shopId).to.not.equal(invalidShopId); // check if actually invalid
    await expect(
      this.escrow.liquidityShopCashOut(invalidShopId)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for invalid caller", async function () {
    // valid ID, but caller is not owner
    await expect(
      this.escrow.connect(alice).liquidityShopCashOut(this.shopId)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail if contract is paused", async function () {
    await this.escrow.setPaused(true);

    await expect(
      this.escrow.liquidityShopCashOut(this.shopId)
    ).to.be.revertedWith("Pausable: paused");

    await this.escrow.setPaused(false);
  });

  it("should pass for valid conditions", async function () {
    const liquidityAmount = 20000;
    await this.currency.approve(this.escrow.address, liquidityAmount);
    await this.escrow.addLiquidityToShop(this.shopId, liquidityAmount);

    const escrowBalance = await this.currency.balanceOf(this.escrow.address);
    const ownerBalance = await this.currency.balanceOf(this.shopOwner);

    const tx = await this.escrow.liquidityShopCashOut(this.shopId);
    expect(tx).to.emit(this.escrow, "LiquidityShopCashOut");
    const response = await tx.wait();

    // check event fields
    const cashOutEvent = response.events.find(
      (event) => event.event == "LiquidityShopCashOut"
    ).args;
    expect(cashOutEvent.owner).to.equal(owner.address);
    expect(cashOutEvent.id).to.equal(this.shopId);
    expect(cashOutEvent.cashoutAmount).to.equal(
      this.shopBalance.add(liquidityAmount)
    );

    // check balances
    const newEscrowBalance = await this.currency.balanceOf(this.escrow.address);
    expect(newEscrowBalance).to.equal(
      escrowBalance.sub(cashOutEvent.cashoutAmount)
    );
    const newOwnerBalance = await this.currency.balanceOf(this.shopOwner);
    expect(newOwnerBalance).to.equal(
      ownerBalance.add(cashOutEvent.cashoutAmount)
    );
  });

  it("should fail for insufficient balance", async function () {
    // shop is already cashed out
    await expect(
      this.escrow.liquidityShopCashOut(this.shopId)
    ).to.be.revertedWith("shop balance = 0");
  });
});
