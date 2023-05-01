const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  signMessage,
  getSignature,
  deployEscrow,
  validateOffer,
  updateOracleValue,
  withdrawPlatformFees,
} = require("./utils/funcs");

describe("Accept offer", function () {
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
    const interestA = 20;
    const interestB = 30;
    const interestC = 40;
    const maxOffer = ethers.BigNumber.from(10).pow(18).mul(15000);
    const liquidityShopName = "CreateLiquidityTest";
    const [automaticApproval, allowRefinancingTerms] = [true, true];
    const liquidityAmount = ethers.BigNumber.from(10).pow(18).mul(50000); // currency tokens

    // Transfer liquidity amount to lender so it can create the shop
    await this.currency.transfer(lender.address, liquidityAmount);

    // Approve liquidity to create shop
    await this.currency
      .connect(lender)
      .approve(this.escrow.address, liquidityAmount);

    const tx = await this.escrow
      .connect(lender)
      .createLiquidityShop(
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
    const loanAmount = this.createLiquidityShopEvent.maxOffer.mul(30).div(100); // 30% of the max offer possible
    this.fees = this.escrow.getOfferFees(loanAmount, this.currency.address);

    this.offer = {
      shopId: this.shopId,
      nftCollateralId: this.ERC721CollateralEventData.tokenId,
      loanDuration: loanDuration,
      amount: loanAmount,
    };

    const days = 1; // To expire signature in a day

    const currentBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );

    this.signature = {
      signer: borrower.address,
      nonce: 1,
      expiry: Math.floor(currentBlock.timestamp + 60 * 60 * 24 * days), // Expire signature in a day
    };

    this.chainId = (await ethers.provider.getNetwork()).chainId;
  });

  describe("parameter validations", function () {
    it("Expect to fail because not valid liquidity shop id", async function () {
      const invalidLiquidityShopId = 2;
      expect(invalidLiquidityShopId).to.not.equal(this.shopId);

      this.offer.shopId = invalidLiquidityShopId;
      // If shop id does not exist then owner will not match caller
      await expect(
        this.escrow
          .connect(lender)
          .acceptOffer(
            this.offer,
            await getSignature(borrower, this.offer, this.chainId)
          )
      ).to.be.revertedWith("caller is not shop owner");
    });

    it("Expect to fail because not valid owner for liquidity shop id", async function () {
      expect(this.createLiquidityShopEvent.owner).to.not.equal(alice.address);

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(alice).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("caller is not shop owner");
    });

    it("Expect to fail because offer amount is zero", async function () {
      this.offer.amount = 0;

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("amount = 0");
    });

    it("Expect to fail because loan duration can not be zero", async function () {
      this.offer.loanDuration = 0;
      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
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
        this.signature.signature = await signMessage(
          borrower,
          this.offer,
          this.signature,
          this.chainId
        );

        await expect(
          this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
        ).to.be.revertedWith("unallowed loan duration");
      }
    });

    it("Expect to fail because shop does not have enough balance", async function () {
      this.offer.amount = this.createLiquidityShopEvent.amount.mul(10);
      expect(this.offer.amount > this.createLiquidityShopEvent.amount).to.be
        .true;

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("insufficient shop balance");
    });

    it("Expect to fail because amount is above max offer amount", async function () {
      this.offer.amount = this.createLiquidityShopEvent.maxOffer.add(1);

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("amount > max offer");
    });
  });

  describe("signature validations", function () {
    it("Expect to fail because signature has expired", async function () {
      const currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );

      // Expire signature now 8 minutes from the block timestamp
      this.signature.expiry = currentBlock.timestamp - 480;

      expect(currentBlock.timestamp).to.be.greaterThan(this.signature.expiry);

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("signature has expired");
    });

    it("Expect to fail because signature is address zero", async function () {
      this.signature.signer = ethers.constants.AddressZero;

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("invalid signature");
    });

    it("Expect to fail because wrong signer", async function () {
      // Signed with Alice instead of borrower
      expect(this.signature.signer).to.not.equal(alice.address);

      this.signature.signature = await signMessage(
        alice,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("invalid signature");
    });

    it("Expect to fail because signature parameters were modified", async function () {
      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      this.offer.amount = this.offer.amount.add(1);

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("invalid signature");
    });

    it("Expect to fail because not correct chain id", async function () {
      this.chainId++;
      const currentChainId = (await ethers.provider.getNetwork()).chainId;

      expect(currentChainId).to.not.equal(this.chainId);

      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("invalid signature");
    });
  });

  describe("successful cases", function () {
    let loanId = 1;
    before(async function () {
      this.offerDataArray = [
        {
          loanDuration: 30,
          loanAmount: this.createLiquidityShopEvent.maxOffer.mul(20).div(100),
        }, // 20 % of shop max offer as loan amount
        {
          loanDuration: 60,
          loanAmount: this.createLiquidityShopEvent.maxOffer.mul(40).div(100),
        }, // 40 % of shop max offer as loan amount
        {
          loanDuration: 90,
          loanAmount: this.createLiquidityShopEvent.maxOffer.mul(60).div(100),
        }, // 60 % of shop max offer as loan amount
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

        const days = 1;

        const currentBlock = await ethers.provider.getBlock(
          await ethers.provider.getBlockNumber()
        );

        this.signature = {
          signer: caller.address,
          nonce: 1,
          expiry: Math.floor(currentBlock.timestamp + 60 * 60 * 24 * days), // Expire signature in a day
        };

        await validateOffer(
          escrowData,
          { ...offerData, shopId: this.shopId, expectedLoanId: loanId },
          caller,
          lender,
          this.signature
        );

        const loan = await this.escrow.loans(loanId);
        this.platformBalance = this.platformBalance.add(
          loan.fee.mul(this.platformFee).div(100)
        );

        loanId++;
      }
    });

    it("should fail to withdraw platform fees from non-owner", async function () {
      await expect(
        this.escrow.connect(alice).withdrawPlatformFees(alice.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail to withdraw platform fees to zero-address", async function () {
      await expect(
        this.escrow
          .connect(owner)
          .withdrawPlatformFees(ethers.constants.AddressZero)
      ).to.be.revertedWith("invalid receiver");
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        alice.address,
        this.escrow,
        owner,
        this.platformBalance
      );
    });

    it("should fail to withdraw platform fees after having just withdrawn", async function () {
      await expect(
        this.escrow.withdrawPlatformFees(alice.address)
      ).to.be.revertedWith("collected platform fees = 0");
    });
  });

  describe("nonce validation", function () {
    it("Expect to fail because nonce has already been used by user", async function () {
      // Approve and transfer fees to ask for loan
      this.nftyToken.transfer(borrower.address, this.fees);
      this.nftyToken.connect(borrower).approve(this.escrow.address, this.fees);
      // Approve NFT as collateral
      await this.nftCollection
        .connect(borrower)
        .approve(this.escrow.address, this.ERC721CollateralEventData.tokenId);

      // Using new nonce to test it
      this.signature.nonce = 2;
      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      expect(
        await this.escrow.connect(borrower).isValidNonce(this.signature.nonce)
      ).to.be.true;

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.emit(this.escrow, "OfferAccepted");

      expect(
        await this.escrow.connect(borrower).isValidNonce(this.signature.nonce)
      ).to.be.false;

      // Use the same data including the already used nonce
      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("nonce invalid");
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
      const days = 70;
      const currentBlock = await ethers.provider.getBlock(
        await ethers.provider.getBlockNumber()
      );

      // Using new nonce to test it
      this.signature.nonce = 5;
      (this.signature.expiry = Math.floor(
        currentBlock.timestamp + 60 * 60 * 24 * days
      )), // Expire signature in 70 days
        (this.signature.signature = await signMessage(
          borrower,
          this.offer,
          this.signature,
          this.chainId
        ));

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("NFTY price too old");
    });
  });

  describe("escrow status validation", function () {
    it("Expect to fail because contract paused", async function () {
      await this.escrow.setPaused(true);

      // Using new nonce to test it
      this.signature.nonce = 6;
      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("Pausable: paused");

      await this.escrow.setPaused(false);
    });
  });

  describe("status validation", function () {
    it("Expect to fail because liquidity shop not active", async function () {
      expect(
        await this.escrow.connect(lender).freezeLiquidityShop(this.shopId)
      );

      // Using new nonce to test it
      this.signature.nonce = 4;
      this.signature.signature = await signMessage(
        borrower,
        this.offer,
        this.signature,
        this.chainId
      );

      await expect(
        this.escrow.connect(lender).acceptOffer(this.offer, this.signature)
      ).to.be.revertedWith("shop must be active");
    });
  });
});
