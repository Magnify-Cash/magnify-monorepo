const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  deployEscrow,
  validateOffer,
  updateOracleValue,
  withdrawPlatformFees,
} = require("./utils/funcs");
const { MINIMUM_BASKET_SIZE } = require("./utils/consts");

describe("Create loan", function () {
  before(async function () {
    [owner, borrower, lender, alice, bob] = await ethers.getSigners();

    [
      this.escrow,
      this.promissoryNote,
      this.obligationReceipt,
      this.nftyToken,
      this.currency,
      this.nftCollection,
    ] = await deployEscrow();

    // Give borrower an NFT to ask for a loan
    const nftTx = await this.nftCollection.awardItem(borrower.address);
    const nftResponse = await nftTx.wait();
    this.ERC721CollateralEventData = nftResponse.events.find(
      (event) => event.event == "Transfer"
    ).args;

    // shop
    this.shopData = {
      interestA: 20, // interest percentage that borrower has to pay
      interestB: 30,
      interestC: 40,
      maxOffer: ethers.BigNumber.from(10).pow(18).mul(5000), // max offer set by the lender for this liquidity shop
      liquidityShopName: "CreateLiquidityTest",
      automaticApproval: true,
      allowRefinancingTerms: true,
      liquidityAmount: MINIMUM_BASKET_SIZE.add(
        ethers.BigNumber.from(10).pow(18).mul(20000)
      ),
    };

    // Transfer liquidity amount to lender so it can create the shop
    await this.currency.transfer(lender.address, this.shopData.liquidityAmount);

    // Approve liquidity to create shop
    await this.currency
      .connect(lender)
      .approve(this.escrow.address, this.shopData.liquidityAmount);

    const tx = await this.escrow
      .connect(lender)
      .createLiquidityShop(
        this.shopData.liquidityShopName,
        this.currency.address,
        this.nftCollection.address,
        this.shopData.liquidityAmount,
        this.shopData.interestA,
        this.shopData.interestB,
        this.shopData.interestC,
        this.shopData.maxOffer,
        this.shopData.automaticApproval,
        this.shopData.allowRefinancingTerms
      );
    const response = await tx.wait();
    this.createLiquidityShopEvent = response.events.find(
      (event) => event.event == "LiquidityShopCreated"
    ).args;
    this.shopId = this.createLiquidityShopEvent.id;

    const nftyTokenSymbol = await this.nftyToken.symbol();
    const currencySymbol = await this.currency.symbol();

    // Update the timestamp of the price, otherwise it will fail since other tests change the timestamp
    await updateOracleValue(currencySymbol + "/USD");
    await updateOracleValue(nftyTokenSymbol + "/USD");

    // Loan origination fee percentage used to calculate borrower fees
    this.loanOriginationFeePercentage =
      await this.escrow.getLoanOriginationFees();

    const platformFees = await this.escrow.platformFees();

    // Lender fees in percentage
    this.lenderFee = platformFees.lenderPercentage;

    // Borrower fees in percentage
    this.borrowerFee = platformFees.borrowerPercentage;

    // Platform fees in percentage
    this.platformFee = platformFees.platformPercentage;

    // Platform fees that can be withdrawn (in NFTY tokens)
    this.platformBalance = ethers.BigNumber.from(0);
  });

  beforeEach(async function () {
    const loanDuration = 30;
    const loanAmount = ethers.BigNumber.from(10).pow(18).mul(4000);

    this.offer = {
      shopId: this.shopId,
      nftCollateralId: this.ERC721CollateralEventData.tokenId,
      nftCollateral: this.nftCollection.address,
      erc20: this.currency.address,
      loanDuration: loanDuration,
      amount: loanAmount,
    };
  });

  describe("parameter validations", function () {
    it("Expect to fail because not valid liquidity shop id", async function () {
      const invalidLiquidityShopId = 1000;
      expect(invalidLiquidityShopId).to.not.equal(this.shopId);

      this.offer.shopId = invalidLiquidityShopId;

      // If shop id does not exist then it wont have automatic approval set
      await expect(
        this.escrow.connect(borrower).createLoan(this.offer)
      ).to.be.revertedWith("automatic approval not accepted");
    });

    it("Expect to fail because loan duration can not be zero", async function () {
      this.offer.loanDuration = 0;

      await expect(
        this.escrow.connect(borrower).createLoan(this.offer)
      ).to.be.revertedWith("loan duration = 0");
    });

    it("Expect to fail because loan duration not allowed", async function () {
      const invalidLoanDurations = [80, 10, 365];

      for (let i = 0; i < invalidLoanDurations.length; i++) {
        const invalidLoanDuration = invalidLoanDurations[i];

        expect(
          ethers.BigNumber.from(30).eq(invalidLoanDuration) ||
            ethers.BigNumber.from(60).eq(invalidLoanDuration) ||
            ethers.BigNumber.from(90).eq(invalidLoanDuration)
        ).to.be.false;

        this.offer.loanDuration = invalidLoanDuration;

        await expect(
          this.escrow.connect(borrower).createLoan(this.offer)
        ).to.be.revertedWith("unallowed loan duration");
      }
    });

    it("Expect to fail because shop does not have enough balance", async function () {
      this.offer.amount = this.createLiquidityShopEvent.amount.mul(10);
      expect(this.offer.amount > this.createLiquidityShopEvent.amount).to.be
        .true;

      await expect(
        this.escrow.connect(borrower).createLoan(this.offer)
      ).to.be.revertedWith("insufficient shop balance");
    });

    it("Expect to fail because amount above max offer", async function () {
      this.offer.amount = this.createLiquidityShopEvent.maxOffer.add(1);
      await expect(
        this.escrow.connect(borrower).createLoan(this.offer)
      ).to.be.revertedWith("amount > max offer");
    });
  });

  describe("escrow status validation", function () {
    it("Expect to fail because contract paused", async function () {
      await this.escrow.setPaused(true);

      await expect(
        this.escrow.connect(borrower).createLoan(this.offer)
      ).to.be.revertedWith("Pausable: paused");

      await this.escrow.setPaused(false);
    });
  });

  describe("successful cases", function () {
    let loanId = 1;
    before(async function () {
      this.offerDataArray = [
        {
          loanDuration: 30,
          loanAmount: this.createLiquidityShopEvent.maxOffer.mul(20).div(100),
        }, // 20 % of shop foor price as loan amount
        {
          loanDuration: 60,
          loanAmount: this.createLiquidityShopEvent.maxOffer.mul(40).div(100),
        }, // 40 % of shop foor price as loan amount
        {
          loanDuration: 90,
          loanAmount: this.createLiquidityShopEvent.maxOffer.mul(60).div(100),
        }, // 60 % of shop foor price as loan amount
      ];
    });

    it("Expect to pass for valid conditions", async function () {
      const callers = [borrower, alice, bob];

      for (let i = 1; i <= callers.length; i++) {
        const caller = callers[i - 1];
        const offerData = this.offerDataArray[i - 1];

        const escrowData = {
          escrow: this.escrow,
          promissoryNote: this.promissoryNote,
          obligationReceipt: this.obligationReceipt,
          nftyToken: this.nftyToken,
          currency: this.currency,
          nftCollection: this.nftCollection,
          platformFee: this.platformFee,
          lenderFee: this.lenderFee,
          borrowerFee: this.borrowerFee,
          loanOriginationFeePercentage: this.loanOriginationFeePercentage,
        };

        await validateOffer(
          escrowData,
          { ...offerData, shopId: this.shopId, expectedLoanId: loanId },
          caller,
          lender
        );

        const loan = await this.escrow.loans(loanId);
        this.platformBalance = this.platformBalance.add(
          loan.fee.mul(this.platformFee).div(100)
        );

        loanId++;
      }
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        bob.address,
        this.escrow,
        owner,
        this.platformBalance
      );
    });
  });

  describe("Oracle validation", function () {
    beforeEach(async function () {
      // Expire oracle price timestamp
      const currentNewDate = 60 * 24 * 60 * 60;
      // Add 60 days to current time so price feed has expired
      await ethers.provider.send("evm_increaseTime", [currentNewDate]);
    });

    it("Expect to fail because price feed is too old", async function () {
      await expect(
        this.escrow.connect(lender).createLoan(this.offer)
      ).to.be.revertedWith("NFTY price too old");
    });
  });

  describe("status validation", function () {
    before(async function () {
      // Transfer liquidity amount to lender so it can create the shop
      await this.currency.transfer(
        lender.address,
        this.shopData.liquidityAmount
      );

      // Approve liquidity to create shop
      await this.currency
        .connect(lender)
        .approve(this.escrow.address, this.shopData.liquidityAmount);

      const automaticApproval = false;
      const alternativeShopTx = await this.escrow
        .connect(lender)
        .createLiquidityShop(
          this.shopData.liquidityShopName,
          this.currency.address,
          this.nftCollection.address,
          this.shopData.liquidityAmount,
          this.shopData.interestA,
          this.shopData.interestB,
          this.shopData.interestC,
          this.shopData.maxOffer,
          automaticApproval,
          this.shopData.allowRefinancingTerms
        );

      const alternativeShopTxResponse = await alternativeShopTx.wait();
      this.alternativeShopEvent = alternativeShopTxResponse.events.find(
        (event) => event.event == "LiquidityShopCreated"
      ).args;
      this.alternativeShopId = this.alternativeShopEvent.id;
    });

    it("Expect to fail because shop does not allow automatic approval", async function () {
      await expect(
        this.escrow
          .connect(borrower)
          .createLoan({ ...this.offer, shopId: this.alternativeShopId })
      ).to.be.revertedWith("automatic approval not accepted");
    });

    it("Expect to fail because liquidity shop not active", async function () {
      expect(
        await this.escrow.connect(lender).freezeLiquidityShop(this.shopId)
      );

      await expect(
        this.escrow.connect(borrower).createLoan(this.offer)
      ).to.be.revertedWith("shop must be active");
    });
  });
});
