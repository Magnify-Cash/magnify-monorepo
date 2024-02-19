import {
  initializeLendingDesk,
  initializeLendingDeskAndAddLoanConfig,
} from "../utils/fixtures";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("NFTY Finance: Remove lending desk loan config", () => {
  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lender, lendingDeskId, loanConfig } =
      await loadFixture(initializeLendingDeskAndAddLoanConfig);

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    // Try freeze and unfreeze both
    await expect(
      nftyFinance
        .connect(lender)
        .removeLendingDeskLoanConfig(
          invalidLendingDeskId,
          loanConfig.nftCollection
        )
    ).to.be.revertedWithCustomError(nftyFinance, "InvalidLendingDeskId");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { nftyFinance, lendingDeskId, loanConfig } = await loadFixture(
      initializeLendingDeskAndAddLoanConfig
    );

    await expect(
      nftyFinance.removeLendingDeskLoanConfig(
        lendingDeskId,
        loanConfig.nftCollection
      )
    ).to.be.revertedWithCustomError(nftyFinance, "CallerIsNotLendingDeskOwner");
  });

  it("should fail when loan config does not exist", async () => {
    const { nftyFinance, lendingDeskId, lender, erc721 } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      nftyFinance
        .connect(lender)
        .removeLendingDeskLoanConfig(lendingDeskId, erc721.target)
    ).to.be.revertedWithCustomError(nftyFinance, "UnsupportedNFTCollection");
  });

  it("should remove loan config", async () => {
    const { nftyFinance, lendingDeskId, lender, loanConfig } =
      await loadFixture(initializeLendingDeskAndAddLoanConfig);

    await expect(
      nftyFinance
        .connect(lender)
        .removeLendingDeskLoanConfig(lendingDeskId, loanConfig.nftCollection)
    )
      .to.emit(nftyFinance, "LendingDeskLoanConfigRemoved")
      .withArgs(lendingDeskId, loanConfig.nftCollection);

    // Check if removed in storage
    const loanConfigInStorage = await nftyFinance.lendingDeskLoanConfigs(
      lendingDeskId,
      loanConfig.nftCollection
    );
    expect(loanConfigInStorage.nftCollection).to.equal(ethers.ZeroAddress);
  });

  it("should fail if contract is paused", async () => {
    const { nftyFinance, lendingDeskId, lender, loanConfig } =
      await loadFixture(initializeLendingDeskAndAddLoanConfig);
    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance
        .connect(lender)
        .removeLendingDeskLoanConfig(lendingDeskId, loanConfig.nftCollection)
    ).to.be.revertedWithCustomError(nftyFinance, "EnforcedPause");
  });
});
