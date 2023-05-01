const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MINIMUM_BASKET_SIZE } = require("./utils/consts");
const { deployEscrow } = require("./utils/funcs");

describe("Add liquidity to shop", function () {
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
  });

  it("should fail for invalid amount", async function () {
    const liquidityAmount = 0;
    await expect(
      this.escrow.addLiquidityToShop(this.shopId, liquidityAmount)
    ).to.be.revertedWith("amount = 0");
  });

  it("should fail for invalid caller", async function () {
    // valid ID, but caller is not owner
    const liquidityAmount = 100;
    await expect(
      this.escrow
        .connect(alice)
        .addLiquidityToShop(this.shopId, liquidityAmount)
    ).to.be.revertedWith("caller is not owner");
  });

  it("should fail for invalid id", async function () {
    const invalidShopId = 2;
    expect(this.shopId).to.not.equal(invalidShopId); // check if actually invalid
    const liquidityAmount = 100;
    await expect(
      this.escrow.addLiquidityToShop(invalidShopId, liquidityAmount)
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail if contract is paused", async function () {
    const liquidityAmount = 100;
    await this.escrow.setPaused(true);

    await expect(
      this.escrow.addLiquidityToShop(this.shopId, liquidityAmount)
    ).to.be.revertedWith("Pausable: paused");

    await this.escrow.setPaused(false);
  });

  it("should pass for valid conditions", async function () {
    const escrowBalance = await this.currency.balanceOf(this.escrow.address);
    const ownerBalance = await this.currency.balanceOf(owner.address);

    const liquidityAmount = 100;
    await this.currency.approve(this.escrow.address, liquidityAmount);
    const tx = await this.escrow.addLiquidityToShop(
      this.shopId,
      liquidityAmount
    );
    expect(tx).to.emit(this.escrow, "LiquidityAddedToShop");
    const response = await tx.wait();

    // check event fields
    const addLiquidityEvent = response.events.find(
      (event) => event.event == "LiquidityAddedToShop"
    ).args;
    expect(addLiquidityEvent.owner).to.equal(owner.address);
    expect(addLiquidityEvent.id).to.equal(this.shopId);
    expect(addLiquidityEvent.balance).to.equal(
      this.shopBalance.add(liquidityAmount)
    );
    expect(addLiquidityEvent.liquidityAdded).to.equal(liquidityAmount);

    // check balances
    const newEscrowBalance = await this.currency.balanceOf(this.escrow.address);
    expect(newEscrowBalance).to.equal(
      escrowBalance.add(addLiquidityEvent.liquidityAdded)
    );
    const newOwnerBalance = await this.currency.balanceOf(owner.address);
    expect(newOwnerBalance).to.equal(
      ownerBalance.sub(addLiquidityEvent.liquidityAdded)
    );

    // update balance for next test
    this.shopBalance = this.shopBalance.add(liquidityAmount);
  });

  it("should be able to add liquidity again", async function () {
    const escrowBalance = await this.currency.balanceOf(this.escrow.address);
    const ownerBalance = await this.currency.balanceOf(owner.address);

    const liquidityAmount = 200;
    await this.currency.approve(this.escrow.address, liquidityAmount);
    const tx = await this.escrow.addLiquidityToShop(
      this.shopId,
      liquidityAmount
    );
    expect(tx).to.emit(this.escrow, "LiquidityAddedToShop");
    const response = await tx.wait();

    // check event fields
    const addLiquidityEvent = response.events.find(
      (event) => event.event == "LiquidityAddedToShop"
    ).args;
    expect(addLiquidityEvent.balance).to.equal(
      this.shopBalance.add(liquidityAmount)
    );
    expect(addLiquidityEvent.liquidityAdded).to.equal(liquidityAmount);

    // check balances
    const newEscrowBalance = await this.currency.balanceOf(this.escrow.address);
    expect(newEscrowBalance).to.equal(
      escrowBalance.add(addLiquidityEvent.liquidityAdded)
    );
    const newOwnerBalance = await this.currency.balanceOf(owner.address);
    expect(newOwnerBalance).to.equal(
      ownerBalance.sub(addLiquidityEvent.liquidityAdded)
    );
  });
});
