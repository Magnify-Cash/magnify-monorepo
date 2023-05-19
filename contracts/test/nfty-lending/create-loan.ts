import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createLiquidityShop } from "../utils/fixtures";
import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("Create loan", () => {
  const loanDuration = 30;
  const loanAmount = 1000;
  const nftId = 0;

  const createLiquidityShopAndMintTokens = async () => {
    const { borrower, erc20, erc721, nftyToken, nftyLending, ...rest } =
      await createLiquidityShop();

    // Give borrower some NFTY, ERC20, and NFTs
    await erc20.connect(borrower).mint(10000);
    await nftyToken.connect(borrower).mint(10000);
    await erc721.connect(borrower).mint(1);

    // Approve NFTYLending to transfer tokens
    await erc20.connect(borrower).approve(nftyLending.address, 10000);
    await nftyToken.connect(borrower).approve(nftyLending.address, 10000);
    await erc721.connect(borrower).approve(nftyLending.address, nftId);

    return { borrower, erc20, erc721, nftyToken, nftyLending, ...rest };
  };

  it("should fail for invalid shop id", async () => {
    const { nftyLending, liquidityShopId, borrower } = await loadFixture(
      createLiquidityShopAndMintTokens
    );
    const invalidShopId = 2;
    expect(invalidShopId).to.not.equal(liquidityShopId);

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: invalidShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: loanAmount,
      })
    ).to.be.revertedWith("invalid shop id");
  });

  it("should fail for zero loan duration", async () => {
    const { nftyLending, liquidityShopId, borrower } = await loadFixture(
      createLiquidityShopAndMintTokens
    );

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration: 0, // zero loan duration
        amount: loanAmount,
      })
    ).to.be.revertedWith("loan duration = 0");
  });

  it("should fail for invalid loan duration", async () => {
    const { nftyLending, liquidityShopId, borrower } = await loadFixture(
      createLiquidityShopAndMintTokens
    );
    const invalidLoanDuration = 50;

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration: invalidLoanDuration, // invalid loan duration
        amount: loanAmount,
      })
    ).to.be.revertedWith("unallowed loan duration");
  });

  it("should fail for amount above max offer", async () => {
    const { nftyLending, liquidityShopId, borrower, liquidityShop } =
      await loadFixture(createLiquidityShopAndMintTokens);

    const invalidAmount = 2000;
    // make sure amount greater than max offer
    expect(invalidAmount).to.be.greaterThan(liquidityShop.maxOffer);

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: invalidAmount,
      })
    ).to.be.revertedWith("amount > max offer");
  });

  it("should fail if contract is paused", async () => {
    const { nftyLending, liquidityShopId, borrower } = await loadFixture(
      createLiquidityShopAndMintTokens
    );
    await nftyLending.setPaused(true);

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: loanAmount,
      })
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should fail if shop does not have enough balance", async () => {
    const { nftyLending, liquidityShopId, borrower, lender, liquidityShop } =
      await loadFixture(createLiquidityShopAndMintTokens);

    const cashOutAmount = 9500;
    await nftyLending
      .connect(lender)
      .cashOutLiquidityShop(liquidityShopId, cashOutAmount);

    // make sure balance is less than loan amount
    expect(loanAmount).to.be.greaterThan(
      liquidityShop.balance.sub(cashOutAmount)
    );

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: loanAmount,
      })
    ).to.be.revertedWith("insufficient shop balance");
  });

  it("should fail if shop does not allow automatic approval", async () => {
    const { nftyLending, liquidityShopId, borrower, lender, liquidityShop } =
      await loadFixture(createLiquidityShopAndMintTokens);

    await nftyLending.connect(lender).updateLiquidityShop(
      liquidityShopId,
      liquidityShop.name,
      liquidityShop.interestA,
      liquidityShop.interestB,
      liquidityShop.interestC,
      liquidityShop.maxOffer,
      false, // Set automatic approval to false
      liquidityShop.allowRefinancingTerms
    );

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: loanAmount,
      })
    ).to.be.revertedWith("automatic approval not accepted");
  });

  it("should fail if liquidity shop is not active", async () => {
    const { nftyLending, liquidityShopId, borrower, lender } =
      await loadFixture(createLiquidityShopAndMintTokens);

    await nftyLending.connect(lender).freezeLiquidityShop(liquidityShopId);

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: loanAmount,
      })
    ).to.be.revertedWith("shop must be active");
  });

  it("should create loan", async () => {
    const { nftyLending, liquidityShopId, borrower, lender } =
      await loadFixture(createLiquidityShopAndMintTokens);

    const tx = nftyLending.connect(borrower).createLoan({
      shopId: liquidityShopId,
      nftCollateralId: nftId,
      loanDuration,
      amount: loanAmount,
    });

    await expect(tx)
      .to.emit(nftyLending, "OfferAccepted")
      .withArgs(
        lender.address,
        borrower.address,
        liquidityShopId,
        anyValue,
        anyValue
      );
  });

  it("Expect to fail because price feed is too old", async () => {
    const { nftyLending, liquidityShopId, borrower } = await loadFixture(
      createLiquidityShopAndMintTokens
    );

    // Add 60 days to current time so price feed has expired
    await ethers.provider.send("evm_increaseTime", [60 * 24 * 60 * 60]);

    await expect(
      nftyLending.connect(borrower).createLoan({
        shopId: liquidityShopId,
        nftCollateralId: nftId,
        loanDuration,
        amount: loanAmount,
      })
    ).to.be.revertedWith("NFTY price too old");
  });
});
