import {
  initializeLendingDesk,
  initializeLendingDeskAndAddLoanConfig,
} from "../utils/fixtures";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("Magnify Cash: Remove lending desk loan config", () => {
  it("should fail for invalid lending desk id", async () => {
    const { magnifyCash, lender, lendingDeskId, loanConfig } =
      await loadFixture(initializeLendingDeskAndAddLoanConfig);

    const invalidLendingDeskId = 2;
    expect(lendingDeskId).to.not.equal(invalidLendingDeskId); // check if actually invalid

    // Try freeze and unfreeze both
    await expect(
      magnifyCash
        .connect(lender)
        .removeLendingDeskLoanConfig(
          invalidLendingDeskId,
          loanConfig.nftCollection
        )
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLendingDeskId");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { magnifyCash, lendingDeskId, loanConfig } = await loadFixture(
      initializeLendingDeskAndAddLoanConfig
    );

    await expect(
      magnifyCash.removeLendingDeskLoanConfig(
        lendingDeskId,
        loanConfig.nftCollection
      )
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotLendingDeskOwner");
  });

  it("should fail when loan config does not exist", async () => {
    const { magnifyCash, lendingDeskId, lender, erc721 } = await loadFixture(
      initializeLendingDesk
    );

    await expect(
      magnifyCash
        .connect(lender)
        .removeLendingDeskLoanConfig(lendingDeskId, erc721.target)
    ).to.be.revertedWithCustomError(magnifyCash, "UnsupportedNFTCollection");
  });

  it("should remove loan config", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfig } =
      await loadFixture(initializeLendingDeskAndAddLoanConfig);

    await expect(
      magnifyCash
        .connect(lender)
        .removeLendingDeskLoanConfig(lendingDeskId, loanConfig.nftCollection)
    )
      .to.emit(magnifyCash, "LendingDeskLoanConfigRemoved")
      .withArgs(lendingDeskId, loanConfig.nftCollection);

    // Check if removed in storage
    const loanConfigInStorage = await magnifyCash.lendingDeskLoanConfigs(
      lendingDeskId,
      loanConfig.nftCollection
    );
    expect(loanConfigInStorage.nftCollection).to.equal(ethers.ZeroAddress);
  });

  it("should fail if contract is paused", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfig } =
      await loadFixture(initializeLendingDeskAndAddLoanConfig);
    await magnifyCash.setPaused(true);

    await expect(
      magnifyCash
        .connect(lender)
        .removeLendingDeskLoanConfig(lendingDeskId, loanConfig.nftCollection)
    ).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });
});
