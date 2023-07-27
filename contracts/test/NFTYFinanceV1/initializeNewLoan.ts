import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { initializeLendingDeskAndAddLoanConfig } from "../utils/fixtures";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";

describe("NFTY Finance: Initialize new loan", () => {
  const loanDuration = 30;
  const loanAmount = ethers.utils.parseUnits("20", 18);
  const nftId = 0;

  const setup = async () => {
    const { borrower, erc20, erc721, nftyFinance, ...rest } =
      await initializeLendingDeskAndAddLoanConfig();

    // Give borrower some ERC20 and NFTs
    await erc20.connect(borrower).mint(10000);
    await erc721.connect(borrower).mint(1);

    // Approve NFTYLending to transfer tokens
    await erc20.connect(borrower).approve(nftyFinance.address, 10000);
    await erc721.connect(borrower).approve(nftyFinance.address, nftId);

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
          erc721.address,
          nftId,
          loanDuration,
          loanAmount
        )
    ).to.be.revertedWith("invalid lending desk id");
  });

  it("should fail for duration < min duration", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.address,
        nftId,
        10, // loan duration
        loanAmount
      )
    ).to.be.revertedWith("duration < min duration");
  });

  it("should fail for duration > max duration", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.address,
        nftId,
        300, // loan duration
        loanAmount
      )
    ).to.be.revertedWith("duration > max duration");
  });

  it("should fail for amount < min amount", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.address,
        nftId,
        loanDuration,
        ethers.utils.parseUnits("5", 18) // loan amount
      )
    ).to.be.revertedWith("amount < min amount");
  });

  it("should fail for amount > max amount", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.address,
        nftId,
        loanDuration,
        ethers.utils.parseUnits("200", 18) // loan amount
      )
    ).to.be.revertedWith("amount > max amount");
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
          erc721.address,
          nftId,
          loanDuration,
          loanAmount
        )
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should fail if lending desk does not support NFT collection", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc20, erc721, lender } =
      await loadFixture(setup);

    // Remove support for ERC721
    await nftyFinance
      .connect(lender)
      .removeLendingDeskLoanConfig(lendingDeskId, erc721.address);

    await expect(
      nftyFinance.connect(borrower).initializeNewLoan(
        lendingDeskId,
        erc721.address, // not supported
        nftId,
        loanDuration,
        loanAmount
      )
    ).to.be.revertedWith("lending desk does not support NFT collection");
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

    const withdrawAmount = ethers.utils.parseUnits("990", 18);
    await nftyFinance
      .connect(lender)
      .withdrawLendingDeskLiquidity(lendingDeskId, withdrawAmount);

    // make sure balance is less than loan amount
    expect(loanAmount).to.be.greaterThan(
      lendingDesk.balance.sub(withdrawAmount)
    );

    await expect(
      nftyFinance
        .connect(borrower)
        .initializeNewLoan(
          lendingDeskId,
          erc721.address,
          nftId,
          loanDuration,
          loanAmount
        )
    ).to.be.revertedWith("insufficient lending desk balance");
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
          erc721.address,
          nftId,
          loanDuration,
          loanAmount
        )
    ).to.be.revertedWith("lending desk not active");
  });

  it("should create loan", async () => {
    const { nftyFinance, lendingDeskId, borrower, erc721 } = await loadFixture(
      setup
    );

    const tx = nftyFinance
      .connect(borrower)
      .initializeNewLoan(
        lendingDeskId,
        erc721.address,
        nftId,
        loanDuration,
        loanAmount
      );

    await expect(tx)
      .to.emit(nftyFinance, "NewLoanInitialized")
      .withArgs(
        lendingDeskId,
        anyValue,
        borrower.address,
        erc721.address,
        nftId,
        loanAmount,
        loanDuration,
        anyValue,
        anyValue
      );
  });
});
