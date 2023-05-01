const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  TEST_NFT_IMAGE_1,
  TEST_NFT_IMAGE_2,
  MINIMUM_BASKET_SIZE,
  MINIMUM_PAYMENT_AMOUNT,
  TEST_NFT_IMAGE_3,
  TEST_NFT_BASE_URI,
} = require("./utils/consts");
const { deployEscrow, validateErc20, validateNft } = require("./utils/funcs");

describe("Tokens", function () {
  before(async function () {
    [owner, alice] = await ethers.getSigners();

    this.nftyNotesFactory = await ethers.getContractFactory("NFTYNotes");

    [
      this.escrow,
      this.promissoryNote,
      this.obligationReceipt,
      this.nftyToken,
      this.currency,
      this.collateral,
      this.unlistedCurrency,
      this.unlistedCollateral,
    ] = await deployEscrow();
  });

  it("should get unlisted ERC20", async function () {
    const erc20 = await this.escrow.erc20s(this.unlistedCurrency.address);
    expect(erc20.allowed).to.be.false;
    expect(erc20.minimumBasketSize).to.equal(0);
    expect(erc20.minimumPaymentAmount).to.equal(0);
  });

  it("should fail to set ERC20 from non-owner", async function () {
    await expect(
      this.escrow.connect(alice).setErc20(this.unlistedCurrency.address, {
        allowed: true,
        minimumBasketSize: MINIMUM_BASKET_SIZE,
        minimumPaymentAmount: MINIMUM_PAYMENT_AMOUNT,
      })
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should fail set ERC20 with address 0", async function () {
    await expect(
      this.escrow.setErc20(ethers.constants.AddressZero, {
        allowed: true,
        minimumBasketSize: MINIMUM_BASKET_SIZE,
        minimumPaymentAmount: MINIMUM_PAYMENT_AMOUNT,
      })
    ).to.be.revertedWith("erc20 is zero addr");
  });

  it("should fail set ERC20 with a minimum basket size of 0", async function () {
    await expect(
      this.escrow.setErc20(this.unlistedCurrency.address, {
        allowed: true,
        minimumBasketSize: 0,
        minimumPaymentAmount: MINIMUM_PAYMENT_AMOUNT,
      })
    ).to.be.revertedWith("basketSize = 0");
  });

  it("should fail set ERC20 with a minimum payment amount of 0", async function () {
    await expect(
      this.escrow.setErc20(this.unlistedCurrency.address, {
        allowed: true,
        minimumBasketSize: MINIMUM_BASKET_SIZE,
        minimumPaymentAmount: 0,
      })
    ).to.be.revertedWith("paymentAmount = 0");
  });

  it("should register ERC20", async function () {
    this.registeredCurrency = this.unlistedCurrency.address; // will be registered if the following call is successful

    await validateErc20(this.escrow, {
      address: this.registeredCurrency,
      allowed: true,
      minimumBasketSize: MINIMUM_BASKET_SIZE,
      minimumPaymentAmount: MINIMUM_PAYMENT_AMOUNT,
    });
  });

  it("should set ERC20 allowed", async function () {
    this.newAllowed = false;

    await validateErc20(this.escrow, {
      address: this.registeredCurrency,
      allowed: this.newAllowed,
      minimumBasketSize: MINIMUM_BASKET_SIZE,
      minimumPaymentAmount: MINIMUM_PAYMENT_AMOUNT,
    });
  });

  it("should set ERC20 minimum basket size", async function () {
    this.newBasketSize = MINIMUM_BASKET_SIZE.mul(2);

    await validateErc20(this.escrow, {
      address: this.registeredCurrency,
      allowed: this.newAllowed,
      minimumBasketSize: this.newBasketSize,
      minimumPaymentAmount: MINIMUM_PAYMENT_AMOUNT,
    });
  });

  it("should set ERC20 minimum payment amount", async function () {
    this.newPaymentAmount = MINIMUM_PAYMENT_AMOUNT.div(2);

    await validateErc20(this.escrow, {
      address: this.registeredCurrency,
      allowed: this.newAllowed,
      minimumBasketSize: this.newBasketSize,
      minimumPaymentAmount: this.newPaymentAmount,
    });
  });

  it("should set multiple ERC20 attributes", async function () {
    const newAllowed = true;
    const newBasketSize = this.newBasketSize.div(5);
    const newPaymentAmount = this.newPaymentAmount.mul(3);

    await validateErc20(this.escrow, {
      address: this.registeredCurrency,
      allowed: newAllowed,
      minimumBasketSize: newBasketSize,
      minimumPaymentAmount: newPaymentAmount,
    });
  });

  describe("Whitelisted Erc20s", function () {
    before(async function () {
      const newAllowed = true;
      this.whitelistedErc20s = [this.currency, this.unlistedCurrency];

      for (let i = 0; i < this.whitelistedErc20s.length; i++) {
        await this.escrow.setErc20(this.whitelistedErc20s[i].address, {
          allowed: newAllowed,
          minimumBasketSize: this.newBasketSize,
          minimumPaymentAmount: this.newPaymentAmount,
        });
      }
    });

    it("should return all whitelisted Erc20s", async function () {
      const whitelistedErc20s = await this.escrow.getWhitelistedErc20s();
      expect(whitelistedErc20s.length).to.equal(this.whitelistedErc20s.length);

      for (let i = 0; i < whitelistedErc20s.length; i++) {
        const whitelistedErc20 = this.whitelistedErc20s.find(
          (erc20) => erc20.address === whitelistedErc20s[i].addr
        );
        expect(whitelistedErc20s[i].addr).to.equal(whitelistedErc20.address);
        expect(whitelistedErc20s[i].minPayment).to.equal(this.newPaymentAmount);
        expect(whitelistedErc20s[i].minBasket).to.equal(this.newBasketSize);
      }
    });

    it("should not return removed Erc20", async function () {
      const erc20Address = this.whitelistedErc20s[0].address;
      const newAllowed = false;
      let whitelistedErc20s = await this.escrow.getWhitelistedErc20s();
      expect(whitelistedErc20s.length).to.equal(this.whitelistedErc20s.length);
      expect(whitelistedErc20s.map((erc20) => erc20.addr)).to.contain(
        erc20Address
      );

      // Remove the first Erc20 on the list
      await this.escrow.setErc20(erc20Address, {
        allowed: newAllowed,
        minimumBasketSize: this.newBasketSize,
        minimumPaymentAmount: this.newPaymentAmount,
      });

      whitelistedErc20s = await this.escrow.getWhitelistedErc20s();
      expect(whitelistedErc20s.length).to.equal(
        this.whitelistedErc20s.length - 1
      );
      expect(whitelistedErc20s.map((erc20) => erc20.addr)).to.not.contain(
        erc20Address
      );
    });

    it("should return an empty list", async function () {
      const newAllowed = false;
      let whitelistedErc20s = await this.escrow.getWhitelistedErc20s();
      expect(whitelistedErc20s.length).to.be.greaterThan(0);

      for (let i = 0; i < this.whitelistedErc20s.length; i++) {
        // Remove all Erc20s on the list
        await this.escrow.setErc20(this.whitelistedErc20s[i].address, {
          allowed: newAllowed,
          minimumBasketSize: this.newBasketSize,
          minimumPaymentAmount: this.newPaymentAmount,
        });
      }

      whitelistedErc20s = await this.escrow.getWhitelistedErc20s();
      expect(whitelistedErc20s.length).to.equal(0);
    });
  });

  it("should get unlisted NFT", async function () {
    const nft = await this.escrow.nfts(this.unlistedCollateral.address);
    expect(nft.allowed).to.be.false;
    expect(nft.image).to.equal("");
  });

  it("should fail to set NFT from non-owner", async function () {
    await expect(
      this.escrow.connect(alice).setNft(this.unlistedCollateral.address, {
        allowed: true,
        image: TEST_NFT_IMAGE_1,
      })
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should fail to set NFT with address 0", async function () {
    await expect(
      this.escrow.setNft(ethers.constants.AddressZero, {
        allowed: true,
        image: TEST_NFT_IMAGE_1,
      })
    ).to.be.revertedWith("nft is zero addr");
  });

  it("should fail to set NFT with empty image", async function () {
    await expect(
      this.escrow.setNft(this.unlistedCollateral.address, {
        allowed: true,
        image: "",
      })
    ).to.be.revertedWith("empty image");
  });

  it("should register NFT", async function () {
    this.registeredCollateral = this.unlistedCollateral.address; // will be registered if the following call is successful

    await validateNft(this.escrow, {
      address: this.registeredCollateral,
      allowed: true,
      image: TEST_NFT_IMAGE_1,
    });
  });

  it("should set NFT allowed", async function () {
    this.newAllowed = false;

    await validateNft(this.escrow, {
      address: this.registeredCollateral,
      allowed: this.newAllowed,
      image: TEST_NFT_IMAGE_1,
    });
  });

  it("should set NFT image", async function () {
    this.newImage = TEST_NFT_IMAGE_2;

    await validateNft(this.escrow, {
      address: this.registeredCollateral,
      allowed: this.newAllowed,
      image: this.newImage,
    });
  });

  it("should set NFT baseUri", async function () {
    const baseUri = TEST_NFT_BASE_URI;
    expect((await this.collateral.baseURI()) == TEST_NFT_BASE_URI).to.be.false;

    await this.collateral.setBaseURI(baseUri);
    expect((await this.collateral.baseURI()) == TEST_NFT_BASE_URI).to.be.true;
  });

  it("should fail to set baseUri from non-owner", async function () {
    const baseUri = TEST_NFT_BASE_URI;

    await expect(
      this.collateral.connect(alice).setBaseURI(baseUri)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should set multiple NFT attributes", async function () {
    const newAllowed = true;
    const newImage = TEST_NFT_IMAGE_3;

    await validateNft(this.escrow, {
      address: this.registeredCollateral,
      allowed: newAllowed,
      image: newImage,
    });
  });

  describe("Whitelisted Nfts", function () {
    before(async function () {
      this.whitelistedNfts = [this.collateral, this.unlistedCollateral];
      const allowed = true;
      this.image = TEST_NFT_IMAGE_1;

      for (let i = 0; i < this.whitelistedNfts.length; i++) {
        await this.escrow.setNft(this.whitelistedNfts[i].address, {
          allowed: allowed,
          image: this.image,
        });
      }
    });

    it("should return all whitelisted nfts", async function () {
      const whitelistedNfts = await this.escrow.getWhitelistedNfts();
      expect(whitelistedNfts.length).to.equal(this.whitelistedNfts.length);

      for (let i = 0; i < whitelistedNfts.length; i++) {
        const whitelistedNft = this.whitelistedNfts.find(
          (nft) => nft.address === whitelistedNfts[i].addr
        );
        expect(whitelistedNfts[i].addr).to.equal(whitelistedNft.address);
        expect(whitelistedNfts[i].img).to.equal(this.image);
      }
    });

    it("should not return removed nft", async function () {
      const nftAddress = this.whitelistedNfts[0].address;
      const newAllowed = false;
      let whitelistedNfts = await this.escrow.getWhitelistedNfts();
      expect(whitelistedNfts.length).to.equal(this.whitelistedNfts.length);
      expect(whitelistedNfts.map((nft) => nft.addr)).to.contain(nftAddress);

      // Remove the first Nft on the list
      await this.escrow.setNft(nftAddress, {
        allowed: newAllowed,
        image: this.image,
      });

      whitelistedNfts = await this.escrow.getWhitelistedNfts();
      expect(whitelistedNfts.length).to.equal(this.whitelistedNfts.length - 1);
      expect(whitelistedNfts.map((nft) => nft.addr)).to.not.contain(nftAddress);
    });

    it("should return an empty list", async function () {
      const newAllowed = false;
      let whitelistedNfts = await this.escrow.getWhitelistedNfts();
      expect(whitelistedNfts.length).to.be.greaterThan(0);

      for (let i = 0; i < this.whitelistedNfts.length; i++) {
        await this.escrow.setNft(this.whitelistedNfts[i].address, {
          allowed: newAllowed,
          image: this.image,
        });
      }

      whitelistedNfts = await this.escrow.getWhitelistedNfts();
      expect(whitelistedNfts.length).to.equal(0);
    });
  });
});
