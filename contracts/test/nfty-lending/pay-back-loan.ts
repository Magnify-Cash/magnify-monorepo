import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { LiquidityShopStatus, TEST_SIGNATURE_EXPIRY } from "../utils/consts";

describe("Pay Back Loan", function () {
  // accounts
  let admin;
  let shopOwner;
  let alice;
  let bob;
  let charlie;
  let dave;
  let eve;

  before(async function () {
    [admin, shopOwner, alice, bob, charlie, dave, eve] =
      await ethers.getSigners();

    [
      this.escrow,
      this.promissoryNote,
      this.obligationReceipt,
      this.nftyToken,
      this.currency,
      this.collateral,
      this.DIAOracle,
    ] = await deployEscrow();

    const nftyLendingFactory = await ethers.getContractFactory("NFTYLending");

    const otherEscrow = await upgrades.deployProxy(nftyLendingFactory, [
      [],
      [],
      this.promissoryNote.address,
      this.obligationReceipt.address,
      this.nftyToken.address,
      this.DIAOracle.address,
    ]);
    await otherEscrow.deployed();

    // fees
    const platformFees = await this.escrow.platformFees();
    const platformFee = platformFees.platformPercentage;
    const borrowerFee = platformFees.borrowerPercentage;
    const loanOriginationFee = await this.escrow.getLoanOriginationFees();

    // create liquidity shop params
    const interestA = 30; // interest percentage that borrower has to pay
    const interestB = 35;
    const interestC = 40;
    const maxOffer = ethers.BigNumber.from(10).pow(18).mul(3000); // max offer set by the lender for this liquidity shop
    const liquidityShopName = "My-Shop";
    const [automaticApproval, allowRefinancingTerms] = [false, true];
    const liquidityAmount = MINIMUM_BASKET_SIZE.mul(10);

    // set up for create shop from lender
    await this.currency.transfer(shopOwner.address, liquidityAmount);
    await this.currency
      .connect(shopOwner)
      .approve(this.escrow.address, liquidityAmount);

    const createShopTx = await this.escrow
      .connect(shopOwner)
      .createLiquidityShop(
        liquidityShopName,
        this.currency.address,
        this.collateral.address,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      );
    const createShopResponse = await createShopTx.wait();
    const createShopEvent = createShopResponse.events.find(
      (event) => event.event == "LiquidityShopCreated"
    ).args;

    this.lending = {
      escrow: this.escrow,
      otherEscrow: otherEscrow,
      promissoryNote: this.promissoryNote,
      obligationReceipt: this.obligationReceipt,
      loanOriginationFee: loanOriginationFee,
      platformFee: platformFee,
      borrowerFee: borrowerFee,
      shopId: createShopEvent.id,
      shopOwner: shopOwner,
      maxOffer: maxOffer,
      currency: this.currency,
      collateral: this.collateral,
      nftyToken: this.nftyToken,
    };

    this.offer = {
      shopId: createShopEvent.id,
      collateral: this.collateral,
      loanDuration: 30, // Days
      loanAmount: this.lending.maxOffer.mul(15).div(100), // 15% of shop max offer as loan amount
    };

    const nftyTokenSymbol = await this.nftyToken.symbol();
    const currencySymbol = await this.currency.symbol();

    // Update the timestamp of the price, otherwise it will fail since other tests change the timestamp
    await updateOracleValue(currencySymbol + "/USD");
    await updateOracleValue(nftyTokenSymbol + "/USD");

    // Platform fees that can be withdrawn (in NFTY tokens)
    this.platformBalance = ethers.BigNumber.from(0);
  });

  before(async function () {
    this.loan = await acceptOffer(
      alice,
      this.lending.shopOwner,
      this.lending.escrow,
      this.offer,
      this.nftyToken,
      this.lending.currency.address
    );

    this.platformBalance = this.loan.fees
      .mul(this.lending.platformFee)
      .div(100);
  });

  it("should fail for invalid obligation receipt", async function () {
    const invalidNFTYNotesId = 23;
    expect(await this.lending.obligationReceipt.exists(invalidNFTYNotesId)).to
      .be.false;

    await expect(
      this.lending.escrow
        .connect(this.loan.borrower)
        .payBackLoan(invalidNFTYNotesId, this.loan.amountToPay)
    ).to.be.revertedWith("invalid obligation receipt");
  });

  it("should fail for invalid promissory note", async function () {
    // generate existing obligation receipt but not promissory note
    const nftyNotesId = 42;
    const encodedLoan = ethers.utils.solidityPack(
      ["address", "uint256"],
      [this.lending.escrow.address, this.loan.id]
    );
    await this.lending.obligationReceipt.setLoanCoordinator(admin.address);
    await this.lending.obligationReceipt.mint(
      alice.address,
      nftyNotesId,
      encodedLoan
    );
    expect(await this.lending.promissoryNote.exists(nftyNotesId)).to.be.false;

    await expect(
      this.lending.escrow
        .connect(this.loan.borrower)
        .payBackLoan(nftyNotesId, this.loan.amountToPay)
    ).to.be.revertedWith("invalid promissory note");
  });

  it("should fail for loan not coordinated by escrow", async function () {
    await expect(
      this.lending.otherEscrow
        .connect(this.loan.borrower)
        .payBackLoan(this.loan.nftyNotesId, this.loan.amountToPay)
    ).to.be.revertedWith("not loan coordinator");
  });

  it("should fail for invalid caller", async function () {
    expect(this.loan.borrower).to.not.equal(bob.address);
    await expect(
      this.lending.escrow
        .connect(bob)
        .payBackLoan(this.loan.nftyNotesId, this.loan.amountToPay)
    ).to.be.revertedWith("not obligation receipt owner");
  });

  it("should fail for payment greater than debt", async function () {
    await expect(
      this.lending.escrow
        .connect(this.loan.borrower)
        .payBackLoan(this.loan.nftyNotesId, this.loan.amountToPay.add(1))
    ).to.be.revertedWith("payment amount > debt");
  });

  it("should fail for payment smaller than minimum payment amount", async function () {
    expect(this.loan.amountToPay.gt(MINIMUM_PAYMENT_AMOUNT)).to.be.true;
    await expect(
      this.lending.escrow
        .connect(this.loan.borrower)
        .payBackLoan(this.loan.nftyNotesId, MINIMUM_PAYMENT_AMOUNT.sub(1))
    ).to.be.revertedWith("insufficient payment amount");
  });

  it("should fail if contract is paused", async function () {
    await this.escrow.setPaused(true);

    await expect(
      this.lending.escrow
        .connect(this.loan.borrower)
        .payBackLoan(this.loan.nftyNotesId, this.loan.amountToPay)
    ).to.be.revertedWith("Pausable: paused");

    await this.escrow.setPaused(false);
  });

  describe("in a single payment", function () {
    it("should pass", async function () {
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        charlie.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("for a loan amount smaller than the minimum payment amount", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(10).div(100); // 10% of shop max offer as loan amount
      const loanDuration = 90; // days
      const nonce = 2;

      this.loan = await acceptOffer(
        alice,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address,
        { nonce: nonce, expiry: TEST_SIGNATURE_EXPIRY }
      );

      expect(this.loan.amountToPay.lt(MINIMUM_PAYMENT_AMOUNT)).to.be.true;

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should fail if paying less than the remainder", async function () {
      await expect(
        this.lending.escrow
          .connect(this.loan.borrower)
          .payBackLoan(this.loan.nftyNotesId, this.loan.amountToPay.sub(1))
      ).to.be.revertedWith("insufficient payment amount");
    });

    it("should pass if paying exactly the remainder", async function () {
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        dave.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("in multiple payments", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(40).div(100); // 40% of shop max offer as loan amount
      const loanDuration = 60; // days
      const nonce = 3;

      this.loan = await acceptOffer(
        alice,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address,
        { nonce: nonce, expiry: TEST_SIGNATURE_EXPIRY }
      );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should pass", async function () {
      const amountOfPayments = 3;
      const paybackAmount = this.loan.amountToPay.div(amountOfPayments);
      for (let i = 0; i < amountOfPayments - 1; i++) {
        await payBackAndVerify(this.lending, this.loan, paybackAmount);
      }
      // make sure last payment liquidates the loan
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        eve.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("paying exactly the minimum", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(40).div(100); // 40% of shop max offer as loan amount
      const loanDuration = 30; // days
      const nonce = 4;

      this.loan = await acceptOffer(
        alice,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address,
        { nonce: nonce, expiry: TEST_SIGNATURE_EXPIRY }
      );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should pass", async function () {
      // pay so that the remainder is exactly the minimum
      await payBackAndVerify(
        this.lending,
        this.loan,
        this.loan.amountToPay.sub(MINIMUM_PAYMENT_AMOUNT)
      );
      expect(this.loan.amountToPay).to.equal(MINIMUM_PAYMENT_AMOUNT);

      await payBackAndVerify(this.lending, this.loan, MINIMUM_PAYMENT_AMOUNT);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        alice.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("making an invalid last payment", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(35).div(100); // 35% of shop max offer as loan amount
      const loanDuration = 30; // days

      this.loan = await acceptOffer(
        eve,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address
      );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should fail", async function () {
      // pay so that the remainder is exactly the minimum
      await payBackAndVerify(
        this.lending,
        this.loan,
        this.loan.amountToPay.sub(MINIMUM_PAYMENT_AMOUNT)
      );
      expect(this.loan.amountToPay).to.equal(MINIMUM_PAYMENT_AMOUNT);

      await expect(
        this.lending.escrow
          .connect(this.loan.borrower)
          .payBackLoan(this.loan.nftyNotesId, MINIMUM_PAYMENT_AMOUNT.sub(1))
      ).to.be.revertedWith("insufficient payment amount");
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        bob.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("from transferred obligation receipt", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(40).div(100); // 40% of shop max offer as loan amount
      const loanDuration = 90; // days

      this.loan = await acceptOffer(
        charlie,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address
      );

      this.lending.obligationReceipt
        .connect(charlie)
        .transferFrom(charlie.address, dave.address, this.loan.nftyNotesId);

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should pass", async function () {
      this.loan.borrower = dave;
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        charlie.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("to transferred promissory note", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(26).div(100); // 26% of shop max offer as loan amount
      const loanDuration = 30; // days
      const nonce = 2;

      this.loan = await acceptOffer(
        eve,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address,
        { nonce: nonce, expiry: TEST_SIGNATURE_EXPIRY }
      );

      this.lending.promissoryNote
        .connect(this.lending.shopOwner)
        .transferFrom(
          this.lending.shopOwner.address,
          alice.address,
          this.loan.nftyNotesId
        );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should pass", async function () {
      this.loan.lender = alice;
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        dave.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("from transferred obligation receipt and to transferred promissory note", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(10).div(100); // 10% of shop max offer as loan amount
      const loanDuration = 30; // days

      this.loan = await acceptOffer(
        bob,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address
      );

      this.lending.obligationReceipt
        .connect(bob)
        .transferFrom(bob.address, alice.address, this.loan.nftyNotesId);
      this.lending.promissoryNote
        .connect(this.lending.shopOwner)
        .transferFrom(
          this.lending.shopOwner.address,
          charlie.address,
          this.loan.nftyNotesId
        );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should pass", async function () {
      this.loan.lender = charlie;
      this.loan.borrower = alice;
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        eve.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("using transferred NFTY notes in multiple payments", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(29).div(100); // 29% of shop max offer as loan amount
      const loanDuration = 30; // days
      const nonce = 2;

      this.loan = await acceptOffer(
        bob,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address,
        { nonce: nonce, expiry: TEST_SIGNATURE_EXPIRY }
      );

      this.lending.obligationReceipt
        .connect(bob)
        .transferFrom(bob.address, alice.address, this.loan.nftyNotesId);
      this.lending.promissoryNote
        .connect(this.lending.shopOwner)
        .transferFrom(
          this.lending.shopOwner.address,
          charlie.address,
          this.loan.nftyNotesId
        );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);
    });

    it("should pass", async function () {
      this.loan.lender = charlie;
      this.loan.borrower = alice;

      // pay back half and transfer NFTY notes
      const paybackAmount = this.loan.amountToPay.div(2);
      await payBackAndVerify(this.lending, this.loan, paybackAmount);

      this.lending.obligationReceipt
        .connect(alice)
        .transferFrom(alice.address, dave.address, this.loan.nftyNotesId);
      this.lending.promissoryNote
        .connect(charlie)
        .transferFrom(charlie.address, eve.address, this.loan.nftyNotesId);

      this.loan.lender = eve;
      this.loan.borrower = dave;
      await payBackAndVerify(this.lending, this.loan, this.loan.amountToPay);
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        alice.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });

  describe("after loan expired", function () {
    before(async function () {
      const loanAmount = this.lending.maxOffer.mul(20).div(100); // 20% of shop max offer as loan amount
      const loanDuration = 60; // days

      this.loan = await acceptOffer(
        dave,
        this.lending.shopOwner,
        this.lending.escrow,
        { ...this.offer, loanAmount: loanAmount, loanDuration: loanDuration },
        this.nftyToken,
        this.currency.address
      );

      this.platformBalance = this.loan.fees
        .mul(this.lending.platformFee)
        .div(100);

      // increase time to expire loan
      const daysInSeconds = 60 * 24 * 60;
      const currentNewDate = daysInSeconds * (loanDuration + 1); // expire by one day
      await ethers.provider.send("evm_increaseTime", [currentNewDate]);
    });

    it("should fail", async function () {
      await expect(
        this.lending.escrow
          .connect(this.loan.borrower)
          .payBackLoan(this.loan.nftyNotesId, this.loan.amountToPay)
      ).to.be.revertedWith("loan has expired");
    });

    it("should withdraw expected platform fees", async function () {
      await withdrawPlatformFees(
        this.nftyToken,
        bob.address,
        this.escrow,
        admin,
        this.platformBalance
      );
    });
  });
});

async function payBackAndVerify(lendingData, loan, payBackAmount) {
  const {
    escrow,
    currency,
    promissoryNote,
    obligationReceipt,
    borrowerFee,
    shopId,
    nftyToken,
    collateral,
  } = lendingData;
  const lender = loan.lender;
  const borrower = loan.borrower;

  let borrowerFees = loan.fees.mul(borrowerFee).div(100);

  // transfer liquidity to pay back loan & approve for escrow
  await currency.transfer(borrower.address, payBackAmount);
  await currency.connect(borrower).approve(escrow.address, payBackAmount);

  const initialLenderCurrency = await currency.balanceOf(lender.address);
  const initialLenderNftyToken = await nftyToken.balanceOf(lender.address);
  const initialEscrowCurrency = await currency.balanceOf(escrow.address);
  const initialEscrowNftyToken = await nftyToken.balanceOf(escrow.address);
  const initialBorrowerCurrency = await currency.balanceOf(borrower.address);
  const initialBorrowerNftyToken = await nftyToken.balanceOf(borrower.address);

  const initialLoan = await escrow.loans(loan.id);

  const payBackLoanTx = await escrow
    .connect(borrower)
    .payBackLoan(loan.nftyNotesId, payBackAmount);
  const payBackLoanResponse = await payBackLoanTx.wait();
  expect(payBackLoanTx).to.emit(escrow, "PaidBackLoan");

  // check event fields
  const paymentMadeEvent = payBackLoanResponse.events.find(
    (event) => event.event == "PaymentMade"
  ).args;
  expect(paymentMadeEvent.obligationReceiptOwner).to.equal(borrower.address);
  expect(paymentMadeEvent.promissoryNoteOwner).to.equal(lender.address);
  expect(paymentMadeEvent.loanId).to.equal(loan.id);
  expect(paymentMadeEvent.paidAmount).to.equal(payBackAmount);

  const remainder = loan.amountToPay.sub(payBackAmount);
  expect(paymentMadeEvent.remainder).to.equal(remainder);

  loan.amountToPay = loan.amountToPay.sub(payBackAmount);

  if (remainder.eq(0)) {
    const interest = await getLoanInterest(
      escrow,
      shopId,
      initialLoan.duration
    );

    // loan fully paid
    const paidBackLoanEvent = payBackLoanResponse.events.find(
      (event) => event.event == "PaidBackLoan"
    ).args;
    expect(paidBackLoanEvent.obligationReceiptOwner).to.equal(borrower.address);
    expect(paidBackLoanEvent.promissoryNoteOwner).to.equal(lender.address);
    expect(paidBackLoanEvent.liquidityShopId).to.equal(shopId);
    expect(paidBackLoanEvent.loanId).to.equal(loan.id);
    expect(paidBackLoanEvent.paidAmount).to.equal(
      loan.amountBorrowed.add(loan.amountBorrowed.mul(interest).div(100))
    );
    expect(paidBackLoanEvent.borrowerFees).to.equal(borrowerFees);
    expect(paidBackLoanEvent.nftyNotesId).to.equal(loan.nftyNotesId);
    expect(paidBackLoanEvent.nftCollateralId).to.equal(loan.collateralId);

    // NFTY Notes should be burned
    expect(await promissoryNote.exists(loan.nftyNotesId)).to.be.false;
    expect(await obligationReceipt.exists(loan.nftyNotesId)).to.be.false;

    // NFT should go back to borrower
    expect(await collateral.ownerOf(loan.collateralId)).equal(borrower.address);
  } else {
    borrowerFees = 0; // borrower fees are returned only when loan is fully paid
  }

  // check storage
  const storageLoan = await escrow.loans(loan.id);
  expect(storageLoan.amount).to.equal(initialLoan.amount);
  expect(storageLoan.remainder).to.equal(remainder);
  expect(storageLoan.duration).to.equal(initialLoan.duration);
  expect(storageLoan.startTime).to.equal(initialLoan.startTime);
  expect(storageLoan.nftCollateralId).to.equal(initialLoan.nftCollateralId);
  expect(storageLoan.fee).to.equal(initialLoan.fee);
  if (remainder.eq(0)) {
    expect(storageLoan.status).to.equal(LOAN_STATUS.RESOLVED);
  } else {
    expect(storageLoan.status).to.equal(LOAN_STATUS.ACTIVE);
  }
  expect(storageLoan.liquidityShopId).to.equal(initialLoan.liquidityShopId);
  expect(storageLoan.nftyNotesId).to.equal(initialLoan.nftyNotesId);
  expect(storageLoan.platformFees.lenderPercentage).to.equal(
    initialLoan.platformFees.lenderPercentage
  );
  expect(storageLoan.platformFees.platformPercentage).to.equal(
    initialLoan.platformFees.platformPercentage
  );
  expect(storageLoan.platformFees.borrowerPercentage).to.equal(
    initialLoan.platformFees.borrowerPercentage
  );

  // check balances
  expect(await currency.balanceOf(lender.address)).to.equal(
    initialLenderCurrency.add(payBackAmount)
  );
  expect(await nftyToken.balanceOf(lender.address)).to.equal(
    initialLenderNftyToken
  );
  expect(await currency.balanceOf(escrow.address)).to.equal(
    initialEscrowCurrency
  );
  expect(await nftyToken.balanceOf(escrow.address)).to.equal(
    initialEscrowNftyToken.sub(borrowerFees)
  );
  expect(await currency.balanceOf(borrower.address)).to.equal(
    initialBorrowerCurrency.sub(payBackAmount)
  );
  expect(await nftyToken.balanceOf(borrower.address)).to.equal(
    initialBorrowerNftyToken.add(borrowerFees)
  );
}
