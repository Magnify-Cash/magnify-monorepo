import { ethers } from "ethers";
import { initializeLendingDesk } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { LoanConfig } from "../utils/consts";
import { getEvent } from "../utils/utils";

describe("Magnify Cash: Set lending desk loan configs", () => {
  const setup = async () => {
    const { erc721, erc1155, ...rest } = await loadFixture(
      initializeLendingDesk
    );

    const loanConfigParams: LoanConfig[] = [
      {
        nftCollection: erc721.target as string,
        nftCollectionIsErc1155: false,
        minAmount: ethers.parseUnits("10", 18),
        maxAmount: ethers.parseUnits("100", 18),
        minDuration: 6n,
        maxDuration: 48n,
        minInterest: 10n * 100n,
        maxInterest: 15n * 100n,
      },
      {
        nftCollection: erc1155.target as string,
        nftCollectionIsErc1155: true,
        minAmount: ethers.parseUnits("80", 18),
        maxAmount: ethers.parseUnits("200", 18),
        minDuration: 24n,
        maxDuration: 240n,
        minInterest: 2n * 100n,
        maxInterest: 15n * 100n,
      },
    ];

    return { erc721, erc1155, loanConfigParams, ...rest };
  };

  it("should fail for invalid lending desk id", async () => {
    const { magnifyCash, lender, loanConfigParams, lendingDeskId } =
      await loadFixture(setup);

    const invalidLendingDeskId = 10n;
    expect(invalidLendingDeskId).to.not.equal(lendingDeskId);

    await expect(
      magnifyCash
        .connect(lender)
        .setLendingDeskLoanConfigs(invalidLendingDeskId, loanConfigParams)
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidLendingDeskId");
  });

  it("should fail when contract is paused", async () => {
    const { magnifyCash, lender, loanConfigParams, lendingDeskId } =
      await loadFixture(setup);

    await magnifyCash.setPaused(true);

    await expect(
      magnifyCash
        .connect(lender)
        .setLendingDeskLoanConfigs(lendingDeskId, loanConfigParams)
    ).to.be.revertedWithCustomError(magnifyCash, "EnforcedPause");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { magnifyCash, alice, loanConfigParams, lendingDeskId } =
      await loadFixture(setup);

    await expect(
      magnifyCash
        .connect(alice)
        .setLendingDeskLoanConfigs(lendingDeskId, loanConfigParams)
    ).to.be.revertedWithCustomError(magnifyCash, "CallerIsNotLendingDeskOwner");
  });

  it("should fail for zero addr NFT collection", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          nftCollection: ethers.ZeroAddress,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidNFTCollection");
  });

  it("should fail for invalid ERC721", async () => {
    const { magnifyCash, erc1155, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          nftCollection: erc1155.target,
          nftCollectionIsErc1155: false,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidNFTCollection");
  });

  it("should fail for invalid ERC1155", async () => {
    const { magnifyCash, erc721, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          nftCollection: erc721.target,
          nftCollectionIsErc1155: true,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidNFTCollection");
  });

  it("should fail for invalid value of numeric params", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    // min amount
    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minAmount: 0n,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "MinAmountIsZero");

    // max amount
    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          maxAmount: ethers.parseUnits("5", 18),
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "MaxAmountIsLessThanMin");

    // min interest
    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minInterest: 0n,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "MinInterestIsZero");

    // max interest
    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          maxInterest: 5n * 100n,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "MaxInterestIsLessThanMin");

    // min duration
    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minDuration: 0n,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "MinDurationIsZero");

    // max duration
    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          maxDuration: 5n,
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "MaxDurationIsLessThanMin");
  });

  it("should add loan configs", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    const tx = await magnifyCash
      .connect(lender)
      .setLendingDeskLoanConfigs(lendingDeskId, loanConfigParams);

    // Check emitted event
    await expect(tx)
      .to.emit(magnifyCash, "LendingDeskLoanConfigsSet")
      .withArgs(lendingDeskId, anyValue);

    // Get loan configs from event and check
    const event = await getEvent(tx, "LendingDeskLoanConfigsSet");
    expect(event?.loanConfigs.length).to.equal(2);

    for (let i = 0; i < 2; i++) {
      const eventLoanConfig = event?.loanConfigs[i];
      const loanConfigInput = loanConfigParams[i];

      // Make sure correct event is emitted
      expect({
        nftCollection: eventLoanConfig.nftCollection,
        nftCollectionIsErc1155: eventLoanConfig.nftCollectionIsErc1155,
        minAmount: eventLoanConfig.minAmount,
        maxAmount: eventLoanConfig.maxAmount,
        minDuration: eventLoanConfig.minDuration,
        maxDuration: eventLoanConfig.maxDuration,
        minInterest: eventLoanConfig.minInterest,
        maxInterest: eventLoanConfig.maxInterest,
      }).to.deep.equal(loanConfigInput);

      // Check loan config in storage
      const loanConfig = await magnifyCash.lendingDeskLoanConfigs(
        lendingDeskId, // lending desk id
        loanConfigInput.nftCollection // nft collection
      );
      expect({
        nftCollection: loanConfig.nftCollection,
        nftCollectionIsErc1155: loanConfig.nftCollectionIsErc1155,
        minAmount: loanConfig.minAmount,
        maxAmount: loanConfig.maxAmount,
        minDuration: loanConfig.minDuration,
        maxDuration: loanConfig.maxDuration,
        minInterest: loanConfig.minInterest,
        maxInterest: loanConfig.maxInterest,
      }).to.deep.equal(loanConfigInput);
    }
  });

  it("should update loan configs when duplicate nft collections are passed", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    const tx = await magnifyCash
      .connect(lender)
      .setLendingDeskLoanConfigs(lendingDeskId, [
        loanConfigParams[0],
        loanConfigParams[0], // duplicate
      ]);

    // Check emitted event
    await expect(tx)
      .to.emit(magnifyCash, "LendingDeskLoanConfigsSet")
      .withArgs(lendingDeskId, anyValue);

    // Get loan configs from event and check
    const event = await getEvent(tx, "LendingDeskLoanConfigsSet");
    expect(event?.loanConfigs.length).to.equal(2);

    const eventLoanConfig = event?.loanConfigs[1];
    const loanConfigInput = loanConfigParams[0];

    // Make sure correct event is emitted
    expect({
      nftCollection: eventLoanConfig.nftCollection,
      nftCollectionIsErc1155: eventLoanConfig.nftCollectionIsErc1155,
      minAmount: eventLoanConfig.minAmount,
      maxAmount: eventLoanConfig.maxAmount,
      minDuration: eventLoanConfig.minDuration,
      maxDuration: eventLoanConfig.maxDuration,
      minInterest: eventLoanConfig.minInterest,
      maxInterest: eventLoanConfig.maxInterest,
    }).to.deep.equal(loanConfigInput);

    // Check loan config in storage
    const loanConfig = await magnifyCash.lendingDeskLoanConfigs(
      lendingDeskId, // lending desk id
      loanConfigInput.nftCollection // nft collection
    );
    expect({
      nftCollection: loanConfig.nftCollection,
      nftCollectionIsErc1155: loanConfig.nftCollectionIsErc1155,
      minAmount: loanConfig.minAmount,
      maxAmount: loanConfig.maxAmount,
      minDuration: loanConfig.minDuration,
      maxDuration: loanConfig.maxDuration,
      minInterest: loanConfig.minInterest,
      maxInterest: loanConfig.maxInterest,
    }).to.deep.equal(loanConfigInput);
  });

  it("should fail if duration and amount are constant but interest is not", async () => {
    const { magnifyCash, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      magnifyCash.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minDuration: 24n * 10n,
          maxDuration: 24n * 10n,
          minAmount: ethers.parseUnits("100", 18),
          maxAmount: ethers.parseUnits("100", 18),
        },
      ])
    ).to.be.revertedWithCustomError(magnifyCash, "InvalidInterest");
  });
});
