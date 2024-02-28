import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  initializeLendingDesk,
  initializeLendingDeskAndAddLoanConfig,
} from "../utils/fixtures";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import { LoanConfig } from "../utils/consts";
import { getEvent } from "../utils/utils";

describe("NFTY Finance: Initialize new loan", () => {
  const loanDuration = 30;
  const loanAmount = ethers.parseUnits("20", 18);
  const nftId = 0;
  const maxInterestAllowed = 10000000n;

  const setup = async () => {
    const { borrower, erc20, erc721, nftyFinance, ...rest } =
      await initializeLendingDeskAndAddLoanConfig();

    // Give borrower some ERC20 and NFTs
    await erc20.connect(borrower).mint(10000);
    await erc721.connect(borrower).mint(1);

    // Approve NFTYLending to transfer tokens
    await erc20.connect(borrower).approve(nftyFinance.target, 10000);
    await erc721.connect(borrower).approve(nftyFinance.target, nftId);

    return { borrower, erc20, erc721, nftyFinance, ...rest };
  };

  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    const invalidLendingDeskId = 2;
    expect(invalidLendingDeskId).to.not.equal(lendingDeskId);

    await expect(
      nftyFinance
        .connect(borrower)
        .initializeNewLoan(
          invalidLendingDeskId,
          erc721.target,
          nftId,
          loanDuration,
          loanAmount,
          maxInterestAllowed
        )
    ).to.be.revertedWithCustomError(nftyFinance, "InvalidLendingDeskId");
  });

  it("should fail for duration < min duration", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.target,
        nftId,
        10, // loan duration
        loanAmount,
        maxInterestAllowed
      )
    ).to.be.revertedWithCustomError(nftyFinance, "LoanDurationTooLow");
  });

  it("should fail for duration > max duration", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.target,
        nftId,
        300, // loan duration
        loanAmount,
        maxInterestAllowed
      )
    ).to.be.revertedWithCustomError(nftyFinance, "LoanDurationTooHigh");
  });

  it("should fail for amount < min amount", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.target,
        nftId,
        loanDuration,
        ethers.parseUnits("5", 18), // loan amount
        maxInterestAllowed
      )
    ).to.be.revertedWithCustomError(nftyFinance, "LoanAmountTooLow");
  });

  it("should fail for amount > max amount", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.target,
        nftId,
        loanDuration,
        ethers.parseUnits("200", 18), // loan amount
        maxInterestAllowed
      )
    ).to.be.revertedWithCustomError(nftyFinance, "LoanAmountTooHigh");
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance
        .connect(borrower)
        .initializeNewLoan(
          lendingDeskId,
          erc721.target,
          nftId,
          loanDuration,
          loanAmount,
          maxInterestAllowed
        )
    ).to.be.revertedWithCustomError(nftyFinance, "EnforcedPause");
  });

  it("should fail if lending desk does not support NFT collection", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc20, erc721, lender } =
      await loadFixture(setup);

    // Remove support for ERC721
    await nftyFinance
      .connect(lender)
      .removeLendingDeskLoanConfig(lendingDeskId, erc721.target);

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.target, // not supported
        nftId,
        loanDuration,
        loanAmount,
        maxInterestAllowed
      )
    ).to.be.revertedWithCustomError(nftyFinance, "UnsupportedNFTCollection");
  });

  it("should fail if lending desk does not have enough balance", async () => {
    const {
      nftyFinance,
      lendingDeskId,
      lendingDesk,
      borrower,
      erc721,
      lender,
    } = await loadFixture(setup);

    const withdrawAmount = ethers.parseUnits("990", 18);
    await nftyFinance
      .connect(lender)
      .withdrawLendingDeskLiquidity(lendingDeskId, withdrawAmount);

    // make sure balance is less than loan amount
    expect(loanAmount).to.be.greaterThan(lendingDesk.balance - withdrawAmount);

    await expect(
      nftyFinance
        .connect(borrower)
        .initializeNewLoan(
          lendingDeskId,
          erc721.target,
          nftId,
          loanDuration,
          loanAmount,
          maxInterestAllowed
        )
    ).to.be.revertedWithCustomError(
      nftyFinance,
      "InsufficientLendingDeskBalance"
    );
  });

  it("should fail if liquidity shop is not active", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721, lender } =
      await loadFixture(setup);

    await nftyFinance.connect(lender).setLendingDeskState(lendingDeskId, true);

    await expect(
      nftyFinance
        .connect(borrower)
        .initializeNewLoan(
          lendingDeskId,
          erc721.target,
          nftId,
          loanDuration,
          loanAmount,
          maxInterestAllowed
        )
    ).to.be.revertedWithCustomError(nftyFinance, "LendingDeskIsNotActive");
  });

  it("should create loan", async () => {
    const {
      nftyFinance,
      lendingDeskId,
      borrower,
      erc721,
      erc20,
      platformWallet,
    } = await loadFixture(setup);

    // Check platform wallet balance
    const initialPlatformWalletBalance = await erc20.balanceOf(platformWallet);

    const tx = await nftyFinance
      .connect(borrower)
      .initializeNewLoan(
        lendingDeskId,
        erc721.target,
        nftId,
        loanDuration,
        loanAmount,
        maxInterestAllowed
      );

    const platformFee = (loanAmount * 2n) / 100n; // 2% of loan amount

    // Check emitted event
    await expect(tx).to.emit(nftyFinance, "NewLoanInitialized").withArgs(
      lendingDeskId,
      anyValue, // loanId
      borrower.address,
      erc721.target,
      nftId,
      loanAmount,
      loanDuration,
      anyValue, // interest
      platformFee
    );

    // Check loan details in storage
    const event = await getEvent(tx, "NewLoanInitialized");
    const loanId = event?.loanId;

    const loan = await nftyFinance.loans(loanId);
    expect(loan.amount).to.equal(loanAmount);
    expect(loan.duration).to.equal(loanDuration);
    expect(loan.amountPaidBack).to.equal(0);
    expect(loan.nftCollection).to.equal(erc721.target);
    expect(loan.nftId).to.equal(nftId);
    expect(loan.lendingDeskId).to.equal(lendingDeskId);
    expect(loan.status).to.equal(0); // LoanStatus.Active

    // Check platform wallet balance has increased
    const platformWalletBalance = await erc20.balanceOf(platformWallet);
    expect(platformWalletBalance - initialPlatformWalletBalance).to.equal(
      platformFee
    );
  });

  it("should create loan if lending desk has constant params", async () => {
    const { nftyFinance, lender, lendingDeskId, erc721, erc20, borrower } =
      await loadFixture(initializeLendingDesk);

    // Set loan config with constant values
    const loanConfig: LoanConfig = {
      nftCollection: erc721.target as string,
      nftCollectionIsErc1155: false,
      minAmount: ethers.parseUnits("10", 18),
      maxAmount: ethers.parseUnits("10", 18),
      minDuration: BigInt(24),
      maxDuration: BigInt(24),
      minInterest: BigInt(200),
      maxInterest: 200n,
    };
    await nftyFinance
      .connect(lender)
      .setLendingDeskLoanConfigs(lendingDeskId, [loanConfig]);

    // Give borrower some ERC20 and NFTs
    await erc20.connect(borrower).mint(10000);
    await erc721.connect(borrower).mint(1);

    // Approve NFTYLending to transfer tokens
    await erc20.connect(borrower).approve(nftyFinance.target, 10000);
    await erc721.connect(borrower).approve(nftyFinance.target, nftId);

    // Create loan
    const tx = await nftyFinance
      .connect(borrower)
      .initializeNewLoan(
        lendingDeskId,
        erc721.target,
        nftId,
        24n,
        ethers.parseUnits("10", 18),
        maxInterestAllowed
      );
    // Make sure it passes
    await expect(tx).to.emit(nftyFinance, "NewLoanInitialized");
  });
});
