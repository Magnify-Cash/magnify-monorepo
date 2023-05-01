const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  TEST_TOKEN_SUPPLY,
  TEST_NFT_IMAGE_1,
  MINIMUM_BASKET_SIZE,
  MINIMUM_PAYMENT_AMOUNT,
  TEST_FEE_TOKEN_NAME,
  TEST_FEE_TOKEN_SYMBOL,
  TEST_TOKEN_NAME,
  TEST_TOKEN_SYMBOL,
} = require("./utils/consts");

describe("Escrow", function () {
  let owner;
  let alice;

  before(async function () {
    [owner, alice] = await ethers.getSigners();

    // ERC20s
    const erc20Factory = await ethers.getContractFactory("ERC20TestToken");
    this.currency = await erc20Factory.deploy(
      TEST_TOKEN_NAME,
      TEST_TOKEN_SYMBOL,
      TEST_TOKEN_SUPPLY
    );
    await this.currency.deployed();

    // ERC721s
    const erc721Factory = await ethers.getContractFactory("ERC721TestToken");
    this.collateral = await erc721Factory.deploy();
    await this.collateral.deployed();

    const nftyNotesFactory = await ethers.getContractFactory("NFTYNotes");
    this.promissoryNote = await nftyNotesFactory.deploy(
      "NFTY Promissory Note",
      "PSN",
      ""
    );
    await this.promissoryNote.deployed();
    this.obligationReceipt = await nftyNotesFactory.deploy(
      "NFTY Obligation Receipt",
      "OGR",
      ""
    );
    await this.obligationReceipt.deployed();

    const DIAOracleFactory = await ethers.getContractFactory("DIAOracleV2");

    this.DIAOracle = await DIAOracleFactory.deploy();
    await this.DIAOracle.deployed();

    this.NFTYLendingFactory = await ethers.getContractFactory("NFTYLending");

    this.nftyToken = await erc20Factory.deploy(
      TEST_FEE_TOKEN_NAME,
      TEST_FEE_TOKEN_SYMBOL,
      TEST_TOKEN_SUPPLY
    );
    await this.nftyToken.deployed();
  });

  it("should fail to deploy with invalid promissory note", async function () {
    await expect(
      upgrades.deployProxy(this.NFTYLendingFactory, [
        [
          {
            addr: this.currency.address,
            minBasket: MINIMUM_BASKET_SIZE,
            minPayment: MINIMUM_PAYMENT_AMOUNT,
          },
        ],
        [{ addr: this.collateral.address, img: TEST_NFT_IMAGE_1 }],
        ethers.constants.AddressZero,
        this.obligationReceipt.address,
        this.nftyToken.address,
        this.DIAOracle.address,
      ])
    ).to.be.revertedWith("promissory note is zero addr");
  });

  it("should fail to deploy with invalid obligation receipt", async function () {
    await expect(
      upgrades.deployProxy(this.NFTYLendingFactory, [
        [
          {
            addr: this.currency.address,
            minBasket: MINIMUM_BASKET_SIZE,
            minPayment: MINIMUM_PAYMENT_AMOUNT,
          },
        ],
        [{ addr: this.collateral.address, img: TEST_NFT_IMAGE_1 }],
        this.promissoryNote.address,
        ethers.constants.AddressZero,
        this.nftyToken.address,
        this.DIAOracle.address,
      ])
    ).to.be.revertedWith("obligation receipt is zero addr");
  });

  it("should fail to deploy with invalid nfty token address", async function () {
    await expect(
      upgrades.deployProxy(this.NFTYLendingFactory, [
        [
          {
            addr: this.currency.address,
            minBasket: MINIMUM_BASKET_SIZE,
            minPayment: MINIMUM_PAYMENT_AMOUNT,
          },
        ],
        [{ addr: this.collateral.address, img: TEST_NFT_IMAGE_1 }],
        this.promissoryNote.address,
        this.obligationReceipt.address,
        ethers.constants.AddressZero,
        this.DIAOracle.address,
      ])
    ).to.be.revertedWith("nfty contract is zero addr");
  });

  it("should fail to deploy with invalid oracle address", async function () {
    await expect(
      upgrades.deployProxy(this.NFTYLendingFactory, [
        [
          {
            addr: this.currency.address,
            minBasket: MINIMUM_BASKET_SIZE,
            minPayment: MINIMUM_PAYMENT_AMOUNT,
          },
        ],
        [{ addr: this.collateral.address, img: TEST_NFT_IMAGE_1 }],
        this.promissoryNote.address,
        this.obligationReceipt.address,
        this.nftyToken.address,
        ethers.constants.AddressZero,
      ])
    ).to.be.revertedWith("oracle is zero addr");
  });

  it("should deploy", async function () {
    const NFTYLending = await upgrades.deployProxy(this.NFTYLendingFactory, [
      [
        {
          addr: this.currency.address,
          minBasket: MINIMUM_BASKET_SIZE,
          minPayment: MINIMUM_PAYMENT_AMOUNT,
        },
      ],
      [{ addr: this.collateral.address, img: TEST_NFT_IMAGE_1 }],
      this.promissoryNote.address,
      this.obligationReceipt.address,
      this.nftyToken.address,
      this.DIAOracle.address,
    ]);
    await NFTYLending.deployed();

    // check expected values set in constructor
    const escrowOwner = await NFTYLending.owner();
    expect(escrowOwner).to.equal(owner.address);

    const whitelistedCurrency = await NFTYLending.erc20s(this.currency.address);
    expect(whitelistedCurrency.allowed).to.be.true;
    expect(whitelistedCurrency.minimumBasketSize).to.equal(MINIMUM_BASKET_SIZE);
    expect(whitelistedCurrency.minimumPaymentAmount).to.equal(
      MINIMUM_PAYMENT_AMOUNT
    );

    const whitelistedCollateral = await NFTYLending.nfts(
      this.collateral.address
    );
    expect(whitelistedCollateral.allowed).to.be.true;
    expect(whitelistedCollateral.image).to.equal(TEST_NFT_IMAGE_1);

    const nftyToken = await NFTYLending.nftyTokenContract();
    expect(nftyToken).to.equal(this.nftyToken.address);

    expect(await NFTYLending.paused()).to.be.false;

    this.escrow = NFTYLending;
  });

  it("should deploy without whitelisted tokens", async function () {
    const NFTYLending = await upgrades.deployProxy(this.NFTYLendingFactory, [
      [],
      [],
      this.promissoryNote.address,
      this.obligationReceipt.address,
      this.nftyToken.address,
      this.DIAOracle.address,
    ]);
    await NFTYLending.deployed();
  });

  it("should fail to withdraw platform fees when there are none", async function () {
    await expect(
      this.escrow.withdrawPlatformFees(alice.address)
    ).to.be.revertedWith("collected platform fees = 0");
  });

  it("should fail to pause escrow by non-owner", async function () {
    await expect(this.escrow.connect(alice).setPaused(true)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should pause contract", async function () {
    expect(await this.escrow.paused()).to.be.false;
    const tx = await this.escrow.setPaused(true);
    expect(tx).to.emit(this.escrow, "Paused");
    const response = await tx.wait();
    const pausedEvent = response.events.find(
      (event) => event.event == "Paused"
    ).args;

    expect(pausedEvent.account).to.equal(owner.address);

    expect(await this.escrow.paused()).to.be.true;
  });

  it("should fail to unpause escrow by non-owner", async function () {
    await expect(
      this.escrow.connect(alice).setPaused(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should unpause contract", async function () {
    expect(await this.escrow.paused()).to.be.true;
    const tx = await this.escrow.setPaused(false);

    expect(tx).to.emit(this.escrow, "Unpaused");
    const response = await tx.wait();
    const pausedEvent = response.events.find(
      (event) => event.event == "Unpaused"
    ).args;

    expect(pausedEvent.account).to.equal(owner.address);

    expect(await this.escrow.paused()).to.be.false;
  });
});
