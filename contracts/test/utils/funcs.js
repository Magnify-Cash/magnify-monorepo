const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  TEST_NFT_IMAGE_1,
  DIA_ORACLE_ADDRESS,
  TEST_CURRENCIES,
  TEST_TOKEN_SUPPLY,
  TEST_SIGNATURE_EXPIRY,
  MINIMUM_BASKET_SIZE,
  MINIMUM_PAYMENT_AMOUNT,
  TEST_FEE_TOKEN_NAME,
  LOAN_STATUS,
  TEST_FEE_TOKEN_SYMBOL,
  TEST_TOKEN_NAME,
  TEST_TOKEN_SYMBOL,
  DIA_ORACLE_UPDATER,
} = require("./consts");

module.exports = {
  oracle: null,
  deployEscrow: async () => {
    // ERC20s
    const erc20Factory = await ethers.getContractFactory("ERC20TestToken");
    const currency = await erc20Factory.deploy(
      TEST_TOKEN_NAME,
      TEST_TOKEN_SYMBOL,
      TEST_TOKEN_SUPPLY
    );
    await currency.deployed();

    const nftyToken = await erc20Factory.deploy(
      TEST_FEE_TOKEN_NAME,
      TEST_FEE_TOKEN_SYMBOL,
      TEST_TOKEN_SUPPLY
    );
    await nftyToken.deployed();

    const unlistedCurrency = await erc20Factory.deploy(
      TEST_TOKEN_NAME,
      TEST_TOKEN_SYMBOL,
      TEST_TOKEN_SUPPLY
    );
    await unlistedCurrency.deployed();

    // ERC721s
    const erc721Factory = await ethers.getContractFactory("ERC721TestToken");
    const nftCollection = await erc721Factory.deploy();
    await nftCollection.deployed();

    const unlistedCollateral = await erc721Factory.deploy();
    await unlistedCollateral.deployed();

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

    const DIAOracle = await module.exports.getOracle();

    // escrow
    const NFTYLendingFactory = await ethers.getContractFactory("NFTYLending");
    const escrow = await upgrades.deployProxy(NFTYLendingFactory, [
      [
        {
          addr: currency.address,
          minBasket: MINIMUM_BASKET_SIZE,
          minPayment: MINIMUM_PAYMENT_AMOUNT,
        },
      ],
      [{ addr: nftCollection.address, img: TEST_NFT_IMAGE_1 }],
      promissoryNote.address,
      obligationReceipt.address,
      nftyToken.address,
      DIAOracle.address,
    ]);
    await escrow.deployed();

    await promissoryNote.setLoanCoordinator(escrow.address);
    await obligationReceipt.setLoanCoordinator(escrow.address);

    return [
      escrow,
      promissoryNote,
      obligationReceipt,
      nftyToken,
      currency,
      nftCollection,
      DIAOracle,
      unlistedCurrency,
      unlistedCollateral,
    ];
  },

  getLoanInterest: async (escrow, shopId, duration) => {
    const shop = await escrow.liquidityShops(shopId);
    if (ethers.BigNumber.from(30).eq(duration)) {
      return shop.interestA;
    } else if (ethers.BigNumber.from(60).eq(duration)) {
      return shop.interestB;
    } else if (ethers.BigNumber.from(90).eq(duration)) {
      return shop.interestC;
    }
  },

  acceptOffer: async (
    borrower,
    shopOwner,
    escrow,
    offer,
    nftyToken,
    currencyAddress,
    signature = { nonce: 1, expiry: TEST_SIGNATURE_EXPIRY }
  ) => {
    const fees = await escrow.getOfferFees(offer.loanAmount, currencyAddress);
    // Give caller an NFT to ask for a loan
    const nftTx = await offer.collateral.awardItem(borrower.address);
    const nftResponse = await nftTx.wait();
    const collateralEventData = nftResponse.events.find(
      (event) => event.event == "Transfer"
    ).args;

    // Approve NFT as collateral
    await offer.collateral
      .connect(borrower)
      .approve(escrow.address, collateralEventData.tokenId);

    const chainId = (await ethers.provider.getNetwork()).chainId;

    const offerData = {
      shopId: offer.shopId,
      nftCollateralId: collateralEventData.tokenId,
      loanDuration: offer.loanDuration,
      amount: offer.loanAmount,
    };

    signature = await module.exports.getSignature(
      borrower,
      offerData,
      chainId,
      signature.nonce,
      signature.expiry
    );

    // Approve and transfer fees to ask for loan
    await nftyToken.transfer(borrower.address, fees);
    await nftyToken.connect(borrower).approve(escrow.address, fees);

    const tx = await escrow
      .connect(shopOwner)
      .acceptOffer(offerData, signature);

    const response = await tx.wait();
    const acceptOfferEventData = response.events.find(
      (event) => event.event == "OfferAccepted"
    ).args;

    const interest = await module.exports.getLoanInterest(
      escrow,
      acceptOfferEventData.liquidityShopId,
      offerData.loanDuration
    );

    return {
      liquidityShopId: acceptOfferEventData.liquidityShopId,
      lender: shopOwner,
      borrower: borrower,
      id: acceptOfferEventData.loanId,
      nftyNotesId: acceptOfferEventData.nftyNotesId,
      blockNumber: response.blockNumber,
      collateralId: collateralEventData.tokenId,
      amountBorrowed: offer.loanAmount,
      amountToPay: offer.loanAmount.add(
        offer.loanAmount.mul(interest).div(100)
      ),
      fees: fees,
    };
  },

  signMessage: async function (signer, offer, signature, chainId) {
    const hash = ethers.utils.solidityKeccak256(
      [
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        offer.shopId,
        offer.nftCollateralId,
        offer.loanDuration,
        offer.amount,
        signature.signer,
        signature.nonce,
        signature.expiry,
        chainId,
      ]
    );

    return await signer.signMessage(ethers.utils.arrayify(hash));
  },
  getSignature: async (
    signer,
    offer,
    chainId,
    nonce = 1,
    expiryInDays = TEST_SIGNATURE_EXPIRY
  ) => {
    // we need to use the block timestamp since mined transactions in tests increase blockchain time
    const currentBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );

    const signature = {
      signer: signer.address,
      nonce: nonce,
      expiry: Math.floor(currentBlock.timestamp + 60 * 60 * 24 * expiryInDays),
    };

    signature.signature = module.exports.signMessage(
      signer,
      offer,
      signature,
      chainId
    );

    return signature;
  },

  getOracle: async () => {
    if (this.oracle) {
      return this.oracle;
    }
    const [owner] = await ethers.getSigners();
    const DIAOracleFactory = await ethers.getContractFactory("DIAOracleV2");
    const DIAOracle = DIAOracleFactory.attach(DIA_ORACLE_ADDRESS);
    const oracleUpdater = await ethers.getImpersonatedSigner(
      DIA_ORACLE_UPDATER
    );

    // Oracle updater does not have enough balance to update the oracle address
    await network.provider.send("hardhat_setBalance", [
      oracleUpdater.address,
      ethers.utils.parseEther("10.0").toHexString(),
    ]);

    await DIAOracle.connect(oracleUpdater).updateOracleUpdaterAddress(
      owner.address
    );
    this.oracle = DIAOracle;
    return this.oracle;
  },

  updateOracleValue: async (currency) => {
    // Update the timestamp of the price, otherwise it will fail
    const currentBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );

    await this.oracle.setValue(
      currency,
      TEST_CURRENCIES[currency].price,
      currentBlock.timestamp
    );
  },

  validateErc20: async (escrow, erc20) => {
    const tx = await escrow.setErc20(erc20.address, {
      allowed: erc20.allowed,
      minimumBasketSize: erc20.minimumBasketSize,
      minimumPaymentAmount: erc20.minimumPaymentAmount,
    });
    const response = await tx.wait();

    // check event
    const setErc20Event = response.events.find(
      (event) => event.event == "Erc20Set"
    ).args;
    expect(setErc20Event.addr).to.equal(erc20.address);
    expect(setErc20Event.allowed).to.equal(erc20.allowed);
    expect(setErc20Event.minimumBasketSize).to.equal(erc20.minimumBasketSize);
    expect(setErc20Event.minimumPaymentAmount).to.equal(
      erc20.minimumPaymentAmount
    );

    // check storage
    const storageErc20 = await escrow.erc20s(erc20.address);
    expect(storageErc20.allowed).to.equal(erc20.allowed);
    expect(storageErc20.minimumBasketSize).to.equal(erc20.minimumBasketSize);
    expect(storageErc20.minimumPaymentAmount).to.equal(
      erc20.minimumPaymentAmount
    );
  },

  validateNft: async (escrow, nft) => {
    const tx = await escrow.setNft(nft.address, {
      allowed: nft.allowed,
      image: nft.image,
    });
    const response = await tx.wait();

    // check event
    const setNftEvent = response.events.find(
      (event) => event.event == "NftSet"
    ).args;
    expect(setNftEvent.addr).to.equal(nft.address);
    expect(setNftEvent.allowed).to.equal(nft.allowed);
    expect(setNftEvent.image).to.equal(nft.image);

    // check storage
    const storageNft = await escrow.nfts(nft.address);
    expect(storageNft.allowed).to.equal(nft.allowed);
    expect(storageNft.image).to.equal(nft.image);
  },

  validateOffer: async (
    escrowData,
    offerData,
    caller,
    lender,
    signature = {}
  ) => {
    const fees = await escrowData.escrow
      .connect(caller)
      .getOfferFees(offerData.loanAmount, escrowData.currency.address);
    // Give caller an NFT to ask for a loan
    const nftTx = await escrowData.nftCollection.awardItem(caller.address);
    const nftResponse = await nftTx.wait();
    const collateralEventData = nftResponse.events.find(
      (event) => event.event == "Transfer"
    ).args;

    // Approve NFT as collateral
    await escrowData.nftCollection
      .connect(caller)
      .approve(escrowData.escrow.address, collateralEventData.tokenId);

    const offer = {
      shopId: offerData.shopId,
      nftCollateralId: collateralEventData.tokenId,
      nftCollateral: escrowData.nftCollection.address,
      erc20: escrowData.currency.address,
      loanDuration: offerData.loanDuration,
      amount: offerData.loanAmount,
    };

    // Approve and transfer fees to ask for loan
    await escrowData.nftyToken.transfer(caller.address, fees);
    await escrowData.nftyToken
      .connect(caller)
      .approve(escrowData.escrow.address, fees);

    // Validate currency balance
    const escrowInitialBalance = await escrowData.currency.balanceOf(
      escrowData.escrow.address
    );
    const borrowerInitialBalance = await escrowData.currency.balanceOf(
      caller.address
    );

    // Validate balance in NFTY for fees
    const lenderNftyInitialBalance = await escrowData.nftyToken.balanceOf(
      lender.address
    );
    const borrowerNftyInitialBalance = await escrowData.nftyToken.balanceOf(
      caller.address
    );
    const escrowNftyInitialBalance = await escrowData.nftyToken.balanceOf(
      escrowData.escrow.address
    );

    let tx;

    if (signature.signer != undefined) {
      const chainId = (await ethers.provider.getNetwork()).chainId;
      signature.signature = await module.exports.signMessage(
        caller,
        offer,
        signature,
        chainId
      );
      tx = await escrowData.escrow
        .connect(lender)
        .acceptOffer(offer, signature);
    } else {
      tx = await escrowData.escrow.connect(caller).createLoan(offer);
    }

    await expect(tx).to.emit(escrowData.escrow, "OfferAccepted");

    const response = await tx.wait();
    const acceptOfferBlock = await ethers.provider.getBlock(
      response.blockNumber
    );
    const acceptOfferEventData = response.events.find(
      (event) => event.event == "OfferAccepted"
    ).args;

    // Validate currency balance
    const escrowFinalBalance = await escrowData.currency.balanceOf(
      escrowData.escrow.address
    );
    const borrowerFinalBalance = await escrowData.currency.balanceOf(
      caller.address
    );

    // Borrower should have loan and escrow should have less balance
    expect(borrowerFinalBalance).to.equal(
      borrowerInitialBalance.add(offer.amount)
    );
    expect(escrowFinalBalance).to.equal(escrowInitialBalance.sub(offer.amount));

    // Validate balance in NFTY for fees
    const lenderNftyFinalBalance = await escrowData.nftyToken.balanceOf(
      lender.address
    );
    const borrowerNftyFinalBalance = await escrowData.nftyToken.balanceOf(
      caller.address
    );
    const escrowNftyFinalBalance = await escrowData.nftyToken.balanceOf(
      escrowData.escrow.address
    );

    const deductedFees = fees
      .mul(escrowData.lenderFee)
      .div(100)
      .add(fees.mul(escrowData.platformFee).div(100))
      .add(fees.mul(escrowData.borrowerFee).div(100));

    // Validate NFTY fees
    expect(borrowerNftyFinalBalance).to.equal(
      borrowerNftyInitialBalance.sub(deductedFees)
    );
    expect(escrowNftyFinalBalance).to.equal(
      escrowNftyInitialBalance.add(
        fees
          .mul(escrowData.platformFee)
          .div(100)
          .add(fees.mul(escrowData.borrowerFee).div(100))
      )
    );
    expect(lenderNftyFinalBalance).to.equal(
      lenderNftyInitialBalance.add(fees.mul(escrowData.lenderFee).div(100))
    );

    // Escrow should have NFT
    expect(
      await escrowData.nftCollection.ownerOf(collateralEventData.tokenId)
    ).equal(escrowData.escrow.address);

    // Obligation receipt should have been created to caller
    expect(
      await escrowData.obligationReceipt.ownerOf(
        acceptOfferEventData.nftyNotesId
      )
    ).to.equal(caller.address);

    // Promissory note should have been created to lender
    expect(
      await escrowData.promissoryNote.ownerOf(acceptOfferEventData.nftyNotesId)
    ).to.equal(lender.address);

    // check event
    // accept offer lender should match 'lender'
    expect(acceptOfferEventData.lender).to.equal(lender.address);
    // accept offer borrower should match 'caller' address
    expect(acceptOfferEventData.borrower).to.equal(caller.address);
    // accept offer shop ID should match shop
    expect(acceptOfferEventData.liquidityShopId).to.equal(offerData.shopId);
    // accept offer loan id should be the first created
    expect(acceptOfferEventData.loanId).to.equal(offerData.expectedLoanId);

    // check storage
    const loan = await escrowData.escrow.loans(offerData.expectedLoanId);
    const interest = await module.exports.getLoanInterest(
      escrowData.escrow,
      offerData.shopId,
      offerData.loanDuration
    );

    expect(loan.amount).to.equal(offer.amount);
    expect(loan.remainder).to.equal(
      offer.amount.add(offer.amount.mul(interest).div(100))
    );
    expect(loan.duration).to.equal(offer.loanDuration);
    expect(loan.startTime).to.equal(acceptOfferBlock.timestamp);
    expect(loan.nftCollateralId).to.equal(offer.nftCollateralId);
    expect(loan.fee).to.equal(fees);
    expect(loan.status).to.equal(LOAN_STATUS.ACTIVE);
    expect(loan.liquidityShopId).to.equal(offer.shopId);
    expect(loan.nftyNotesId).to.equal(acceptOfferEventData.nftyNotesId);
    expect(loan.platformFees.lenderPercentage).to.equal(escrowData.lenderFee);
    expect(loan.platformFees.platformPercentage).to.equal(
      escrowData.platformFee
    );
    expect(loan.platformFees.borrowerPercentage).to.equal(
      escrowData.borrowerFee
    );
  },

  withdrawPlatformFees: async (
    nftyToken,
    receiver,
    escrow,
    owner,
    expectedBalance
  ) => {
    const receiverInitialBalance = await nftyToken.balanceOf(receiver);
    const escrowInitialBalance = await nftyToken.balanceOf(escrow.address);

    await escrow.connect(owner).withdrawPlatformFees(receiver);

    const receiverFinalBalance = await nftyToken.balanceOf(receiver);
    const escrowFinalBalance = await nftyToken.balanceOf(escrow.address);

    expect(receiverFinalBalance).to.equal(
      receiverInitialBalance.add(expectedBalance)
    );
    expect(escrowFinalBalance).to.equal(
      escrowInitialBalance.sub(expectedBalance)
    );
  },
};
