const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  TEST_TOKEN_NAME,
  TEST_TOKEN_SYMBOL,
  TEST_TOKEN_SUPPLY,
} = require("./utils/consts");

describe("Fees", function () {
  before(async function () {
    [owner, alice] = await ethers.getSigners();

    const nftyNotesFactory = await ethers.getContractFactory("NFTYNotes");
    const promissoryNote = await nftyNotesFactory.deploy(
      "NFTY Promissory Note",
      "PSN",
      ""
    );
    await promissoryNote.deployed();
    const obligationReceipt = await nftyNotesFactory.deploy(
      "NFTY Obligation Receipt",
      "OGR",
      ""
    );
    await obligationReceipt.deployed();

    const erc20Factory = await ethers.getContractFactory("ERC20TestToken");
    const nftyToken = await erc20Factory.deploy(
      TEST_TOKEN_NAME,
      TEST_TOKEN_SYMBOL,
      TEST_TOKEN_SUPPLY
    );
    await nftyToken.deployed();

    const DIAOracleFactory = await ethers.getContractFactory("DIAOracleV2");
    const DIAOracle = await DIAOracleFactory.deploy();
    await DIAOracle.deployed();

    // escrow
    const NFTYLendingFactory = await ethers.getContractFactory("NFTYLending");
    this.escrow = await upgrades.deployProxy(NFTYLendingFactory, [
      [],
      [],
      promissoryNote.address,
      obligationReceipt.address,
      nftyToken.address,
      DIAOracle.address,
    ]);
    await this.escrow.deployed();
  });

  describe("Platform", function () {
    // Lending fees for testing purposes
    const validLenderFees = 15;
    const validBorrowerFees = 15;
    const validPlatformFees = 70;

    it("should fail to set fees that do not add up to 100%", async function () {
      const invalidBorrowerFee = 90;
      expect(
        validLenderFees + invalidBorrowerFee + validPlatformFees
      ).to.be.greaterThan(100);

      await expect(
        this.escrow.setPlatformFees({
          lenderPercentage: validLenderFees,
          platformPercentage: validPlatformFees,
          borrowerPercentage: invalidBorrowerFee,
        })
      ).to.be.revertedWith("fees do not add up to 100%");
    });

    it("should fail to set individual fees lower than 1%", async function () {
      await expect(
        this.escrow.setPlatformFees({
          lenderPercentage: 0,
          platformPercentage: validPlatformFees + validLenderFees,
          borrowerPercentage: validBorrowerFees,
        })
      ).to.be.revertedWith("lender fee < 1%");

      await expect(
        this.escrow.setPlatformFees({
          lenderPercentage: validLenderFees + validBorrowerFees,
          platformPercentage: validPlatformFees,
          borrowerPercentage: 0,
        })
      ).to.be.revertedWith("borrower fee < 1%");

      await expect(
        this.escrow.setPlatformFees({
          lenderPercentage: validLenderFees + validPlatformFees,
          platformPercentage: 0,
          borrowerPercentage: validBorrowerFees,
        })
      ).to.be.revertedWith("platform fee < 1%");
    });

    it("should fail to set fees from non-owner", async function () {
      await expect(
        this.escrow.connect(alice).setPlatformFees({
          lenderPercentage: validLenderFees,
          platformPercentage: validPlatformFees,
          borrowerPercentage: validBorrowerFees,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set valid fees", async function () {
      const validFees = [
        [20, 60, 20],
        [30, 30, 40],
        [70, 15, 15],
      ];

      for (let i = 0; i < validFees.length; i++) {
        const validLenderFee = validFees[i][0];
        const validBorrowerFee = validFees[i][1];
        const validPlatformFee = validFees[i][2];

        const tx = await this.escrow.setPlatformFees({
          lenderPercentage: validLenderFee,
          platformPercentage: validPlatformFee,
          borrowerPercentage: validBorrowerFee,
        });
        const response = await tx.wait();

        const feesSetEventData = response.events.find(
          (event) => event.event == "PlatformFeesSet"
        ).args;
        expect(feesSetEventData.platformFees.lenderPercentage).to.equal(
          validLenderFee
        );
        expect(feesSetEventData.platformFees.borrowerPercentage).to.equal(
          validBorrowerFee
        );
        expect(feesSetEventData.platformFees.platformPercentage).to.equal(
          validPlatformFee
        );

        const platformFeesFromContract = await this.escrow.platformFees();

        expect(platformFeesFromContract.lenderPercentage).to.equal(
          validLenderFee
        );
        expect(platformFeesFromContract.borrowerPercentage).to.equal(
          validBorrowerFee
        );
        expect(platformFeesFromContract.platformPercentage).to.equal(
          validPlatformFee
        );
      }
    });
  });

  describe("Loan origination", function () {
    it("should fail to set fee from non-owner", async function () {
      const loanOriginationFee = 10;
      await expect(
        this.escrow.connect(alice).setLoanOriginationFees(loanOriginationFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail to set fee above 10%", async function () {
      const loanOriginationFee = 11;
      await expect(
        this.escrow.setLoanOriginationFees(loanOriginationFee)
      ).to.be.revertedWith("fee > 10%");
    });

    it("should set fees", async function () {
      const validLoanFees = [0, 1, 10];

      for (let i = 0; i < validLoanFees.length; i++) {
        const tx = await this.escrow.setLoanOriginationFees(validLoanFees[i]);
        const response = await tx.wait();

        const loanOriginationFeeSetEventData = response.events.find(
          (event) => event.event == "LoanOriginationFeesSet"
        ).args;
        expect(loanOriginationFeeSetEventData.loanOriginationFees).to.equal(
          validLoanFees[i]
        );
        expect(await this.escrow.getLoanOriginationFees()).to.equal(
          validLoanFees[i]
        );
      }
    });
  });

  describe("Fee expiration", function () {
    it("should fail to set oracle fee expiration time from non-owner", async function () {
      const feeExpirationTime = 600;
      await expect(
        this.escrow.connect(alice).setFeeExpiration(feeExpirationTime)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should fail to set oracle fee expiration time of zero", async function () {
      const feeExpirationTime = 0;
      await expect(
        this.escrow.setFeeExpiration(feeExpirationTime)
      ).to.be.revertedWith("expiration = 0");
    });

    it("should fail to set oracle fee expiration time with a value bigger than 24 hours", async function () {
      const feeExpirationTime = 60 * 60 * 24 + 1;
      await expect(
        this.escrow.setFeeExpiration(feeExpirationTime)
      ).to.be.revertedWith("expiration > 24hs");
    });

    it("should set oracle fee expiration time", async function () {
      const feeExpirationTimes = [600, 60 * 60 * 24];

      for (let i = 0; i < feeExpirationTimes.length; i++) {
        const feeExpirationTime = feeExpirationTimes[i];
        expect(await this.escrow.feeExpirationTime()).to.not.equal(
          feeExpirationTime
        );

        const tx = await this.escrow.setFeeExpiration(feeExpirationTime);
        const response = await tx.wait();

        const feeExpirationEvent = response.events.find(
          (event) => event.event == "FeeExpirationSet"
        ).args;
        expect(feeExpirationEvent.feeExpirationTime).to.equal(
          feeExpirationTime
        );
        expect(await this.escrow.feeExpirationTime()).to.equal(
          feeExpirationTime
        );
      }
    });
  });
});
