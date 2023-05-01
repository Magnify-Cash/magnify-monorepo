const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MINIMUM_BASKET_SIZE, SHOP_STATUS } = require("./utils/consts");
const { deployEscrow } = require("./utils/funcs");

describe("Create liquidity shop", function () {
  // create shop params
  const validName = "My Shop";
  const validLiquidity = MINIMUM_BASKET_SIZE; // initial liquidity for the shop, in shop currency tokens
  const validInterestA = 20; // interest rate for the shop, in percentage (i.e. 20%)
  const validInterestB = 30;
  const validInterestC = 40;
  const validMaxOffer = 10000; // Max offer for the NFT collection accepted as loan collateral, in shop currency tokens
  const validAutomaticApproval = true; // checks whether valid offers can be automatically accepted without intervention from the shop owner
  const validAllowRefinancing = false; // unimplemented feature

  before(async function () {
    [owner, bob, alice] = await ethers.getSigners();

    [
      this.escrow,
      this.promissoryNote,
      this.obligationReceipt,
      this.nftyToken,
      this.currency,
      this.nftCollection,
    ] = await deployEscrow();
  });

  it("should fail for invalid ERC20", async function () {
    await expect(
      this.escrow.createLiquidityShop(
        validName,
        ethers.constants.AddressZero, // zero address is not and can never be whitelisted
        this.nftCollection.address,
        validLiquidity,
        validInterestA,
        validInterestB,
        validInterestC,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("unallowed erc20");
  });

  it("should fail for invalid ERC721", async function () {
    await expect(
      this.escrow.createLiquidityShop(
        validName,
        this.currency.address,
        ethers.constants.AddressZero, // zero address is not and can never be whitelisted
        validLiquidity,
        validInterestA,
        validInterestB,
        validInterestC,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("unallowed nft");
  });

  it("should fail for liquidity below minimum basket size", async function () {
    const invalidLiquidityAmounts = [0, 20, MINIMUM_BASKET_SIZE.sub(1)];
    for (let i = 0; i < invalidLiquidityAmounts.length; i++) {
      const invalidLiquidityAmount = invalidLiquidityAmounts[i];
      expect(MINIMUM_BASKET_SIZE.gt(invalidLiquidityAmount)).to.be.true; // check that value is actually invalid
      await expect(
        this.escrow.createLiquidityShop(
          validName,
          this.currency.address,
          this.nftCollection.address,
          invalidLiquidityAmount,
          validInterestA,
          validInterestB,
          validInterestC,
          validMaxOffer,
          validAutomaticApproval,
          validAllowRefinancing
        )
      ).to.be.revertedWith("amount < min basket size");
    }
  });

  it("should fail for invalid name", async function () {
    await expect(
      this.escrow.createLiquidityShop(
        "", // name cannot be empty
        this.currency.address,
        this.nftCollection.address,
        validLiquidity,
        validInterestA,
        validInterestB,
        validInterestC,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("empty shop name");
  });

  it("should fail for invalid max offer", async function () {
    await expect(
      this.escrow.createLiquidityShop(
        validName,
        this.currency.address,
        this.nftCollection.address,
        validLiquidity,
        validInterestA,
        validInterestB,
        validInterestC,
        0, // 0 tokens as NFT max offer
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("max offer = 0");
  });

  it("should fail for invalid interests", async function () {
    await expect(
      this.escrow.createLiquidityShop(
        validName,
        this.currency.address,
        this.nftCollection.address,
        validLiquidity,
        0,
        validInterestB,
        validInterestC,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("interestA = 0");

    await expect(
      this.escrow.createLiquidityShop(
        validName,
        this.currency.address,
        this.nftCollection.address,
        validLiquidity,
        validInterestA,
        0,
        validInterestC,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("interestB = 0");

    await expect(
      this.escrow.createLiquidityShop(
        validName,
        this.currency.address,
        this.nftCollection.address,
        validLiquidity,
        validInterestA,
        validInterestB,
        0,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("interestC = 0");
  });

  it("should fail if contract is paused", async function () {
    await this.escrow.setPaused(true);

    await expect(
      this.escrow.createLiquidityShop(
        validName,
        this.currency.address,
        this.nftCollection.address,
        validLiquidity,
        validInterestA,
        validInterestB,
        validInterestC,
        validMaxOffer,
        validAutomaticApproval,
        validAllowRefinancing
      )
    ).to.be.revertedWith("Pausable: paused");

    await this.escrow.setPaused(false);
  });

  it("should pass for valid conditions", async function () {
    const callers = [bob, alice];
    let automaticApproval = true;
    let allowRefinancingTerms = false;

    for (let i = 1; i <= callers.length; i++) {
      const caller = callers[i - 1];

      // set particular shop params for each create shop iteration
      const name = validName + i;
      const liquidityAmount = validLiquidity.mul(i);
      const maxOffer = validMaxOffer * i;
      const interestA = validInterestA + i * 1;
      const interestB = validInterestB + i * 2;
      const interestC = validInterestC + i * 3;
      automaticApproval = !automaticApproval;
      allowRefinancingTerms = !allowRefinancingTerms;

      // mint and approve enough tokens
      await this.currency
        .connect(owner)
        .transfer(caller.address, liquidityAmount);
      await this.currency
        .connect(caller)
        .approve(this.escrow.address, liquidityAmount);

      const callerBalance = await this.currency.balanceOf(caller.address);
      const escrowBalance = await this.currency.balanceOf(this.escrow.address);

      const tx = await this.escrow
        .connect(caller)
        .createLiquidityShop(
          name,
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
      expect(tx).to.emit(this.escrow, "LiquidityShopCreated");
      const response = await tx.wait();

      // check balances
      const newCallerBalance = await this.currency.balanceOf(caller.address);
      expect(newCallerBalance.eq(callerBalance.sub(liquidityAmount))).to.be
        .true;
      const newEscrowBalance = await this.currency.balanceOf(
        this.escrow.address
      );
      expect(newEscrowBalance.eq(escrowBalance.add(liquidityAmount))).to.be
        .true;

      const shopCreatedEvent = response.events.find(
        (event) => event.event == "LiquidityShopCreated"
      ).args;

      // check that event fields match create shop params
      expect(shopCreatedEvent.erc20).to.equal(this.currency.address);
      expect(shopCreatedEvent.nftCollection).to.equal(
        this.nftCollection.address
      );
      expect(shopCreatedEvent.amount).to.equal(liquidityAmount);
      expect(shopCreatedEvent.interestA).to.equal(interestA);
      expect(shopCreatedEvent.interestB).to.equal(interestB);
      expect(shopCreatedEvent.interestC).to.equal(interestC);
      expect(shopCreatedEvent.maxOffer).to.equal(maxOffer);
      expect(shopCreatedEvent.name).to.equal(name);
      expect(shopCreatedEvent.automaticApproval).to.equal(automaticApproval);
      expect(shopCreatedEvent.allowRefinancingTerms).to.equal(
        allowRefinancingTerms
      );
      // shop owner should be caller
      expect(shopCreatedEvent.owner).to.equal(caller.address);
      // id should match iteration number
      expect(shopCreatedEvent.id).to.equal(i);

      // check data in storage
      const shopInStorage = await this.escrow.liquidityShops(
        shopCreatedEvent.id
      );

      expect(shopInStorage.erc20).to.equal(this.currency.address);
      expect(shopInStorage.nftCollection).to.equal(this.nftCollection.address);
      // shop owner should be caller
      expect(shopInStorage.owner).to.equal(caller.address);
      expect(shopInStorage.balance).to.equal(liquidityAmount);
      expect(shopInStorage.interestA).to.equal(interestA);
      expect(shopInStorage.interestB).to.equal(interestB);
      expect(shopInStorage.interestC).to.equal(interestC);
      expect(shopInStorage.maxOffer).to.equal(maxOffer);
      expect(shopInStorage.name).to.equal(name);
      expect(shopInStorage.status).to.equal(SHOP_STATUS.ACTIVE);
      expect(shopInStorage.automaticApproval).to.equal(automaticApproval);
      expect(shopInStorage.allowRefinancingTerms).to.equal(
        allowRefinancingTerms
      );
    }
  });
});
