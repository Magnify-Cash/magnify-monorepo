import { BigNumber, ethers } from "ethers";
import { initializeLendingDesk } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { LoanConfig } from "../utils/consts";

describe("NFTY Finance: Set lending desk loan configs", () => {
  const setup = async () => {
    const { erc721, erc1155, ...rest } = await loadFixture(
      initializeLendingDesk
    );

    const loanConfigParams: LoanConfig[] = [
      {
        nftCollection: erc721.address,
        nftCollectionIsErc1155: false,
        minAmount: ethers.utils.parseUnits("10", 18),
        maxAmount: ethers.utils.parseUnits("100", 18),
        minDuration: BigNumber.from(6),
        maxDuration: BigNumber.from(48),
        minInterest: BigNumber.from(10 * 100),
        maxInterest: BigNumber.from(15 * 100),
      },
      {
        nftCollection: erc1155.address,
        nftCollectionIsErc1155: true,
        minAmount: ethers.utils.parseUnits("80", 18),
        maxAmount: ethers.utils.parseUnits("200", 18),
        minDuration: BigNumber.from(24),
        maxDuration: BigNumber.from(240),
        minInterest: BigNumber.from(2 * 100),
        maxInterest: BigNumber.from(15 * 100),
      },
    ];

    return { erc721, erc1155, loanConfigParams, ...rest };
  };

  it("should fail for invalid lending desk id", async () => {
    const { nftyFinance, lender, loanConfigParams, lendingDeskId } =
      await loadFixture(setup);

    const invalidLendingDeskId = 10;
    expect(invalidLendingDeskId).to.not.equal(lendingDeskId.toNumber());

    await expect(
      nftyFinance
        .connect(lender)
        .setLendingDeskLoanConfigs(invalidLendingDeskId, loanConfigParams)
    ).to.be.revertedWith("invalid lending desk id");
  });

  it("should fail when contract is paused", async () => {
    const { nftyFinance, lender, loanConfigParams, lendingDeskId } =
      await loadFixture(setup);

    await nftyFinance.setPaused(true);

    await expect(
      nftyFinance
        .connect(lender)
        .setLendingDeskLoanConfigs(lendingDeskId, loanConfigParams)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should fail when caller is not lending desk owner", async () => {
    const { nftyFinance, alice, loanConfigParams, lendingDeskId } =
      await loadFixture(setup);

    await expect(
      nftyFinance
        .connect(alice)
        .setLendingDeskLoanConfigs(lendingDeskId, loanConfigParams)
    ).to.be.revertedWith("not lending desk owner");
  });

  it("should fail for zero addr NFT collection", async () => {
    const { nftyFinance, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          nftCollection: ethers.constants.AddressZero,
        },
      ])
    ).to.be.revertedWith("invalid nft collection");
  });

  it("should fail for invalid ERC721", async () => {
    const { nftyFinance, erc1155, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          nftCollection: erc1155.address,
          nftCollectionIsErc1155: false,
        },
      ])
    ).to.be.revertedWith("invalid nft collection");
  });

  it("should fail for invalid ERC1155", async () => {
    const { nftyFinance, erc721, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          nftCollection: erc721.address,
          nftCollectionIsErc1155: true,
        },
      ])
    ).to.be.revertedWith("invalid nft collection");
  });

  it("should fail for invalid value of numeric params", async () => {
    const { nftyFinance, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    // min amount
    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minAmount: BigNumber.from(0),
        },
      ])
    ).to.be.revertedWith("min amount = 0");

    // max amount
    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          maxAmount: ethers.utils.parseUnits("5", 18),
        },
      ])
    ).to.be.revertedWith("max amount < min amount");

    // min interest
    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minInterest: BigNumber.from(0),
        },
      ])
    ).to.be.revertedWith("min interest = 0");

    // max interest
    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          maxInterest: BigNumber.from(5 * 100),
        },
      ])
    ).to.be.revertedWith("max interest < min interest");

    // min duration
    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minDuration: BigNumber.from(0),
        },
      ])
    ).to.be.revertedWith("min duration = 0");

    // max duration
    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          maxDuration: BigNumber.from(5),
        },
      ])
    ).to.be.revertedWith("max duration < min duration");
  });

  it("should add loan configs", async () => {
    const { nftyFinance, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    const tx = await nftyFinance
      .connect(lender)
      .setLendingDeskLoanConfigs(lendingDeskId, loanConfigParams);

    // Check emitted event
    await expect(tx)
      .to.emit(nftyFinance, "LendingDeskLoanConfigsSet")
      .withArgs(lendingDeskId, anyValue);

    // Get loan configs from event and check
    const { events } = await tx.wait();
    const event = events?.find(
      (event) => event.event == "LendingDeskLoanConfigsSet"
    )?.args;
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
      const loanConfig = await nftyFinance.lendingDeskLoanConfigs(
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
    const { nftyFinance, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    const tx = await nftyFinance
      .connect(lender)
      .setLendingDeskLoanConfigs(lendingDeskId, [
        loanConfigParams[0],
        loanConfigParams[0], // duplicate
      ]);

    // Check emitted event
    await expect(tx)
      .to.emit(nftyFinance, "LendingDeskLoanConfigsSet")
      .withArgs(lendingDeskId, anyValue);

    // Get loan configs from event and check
    const { events } = await tx.wait();
    const event = events?.find(
      (event) => event.event == "LendingDeskLoanConfigsSet"
    )?.args;
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
    const loanConfig = await nftyFinance.lendingDeskLoanConfigs(
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
    const { nftyFinance, lendingDeskId, lender, loanConfigParams } =
      await loadFixture(setup);

    await expect(
      nftyFinance.connect(lender).setLendingDeskLoanConfigs(lendingDeskId, [
        {
          ...loanConfigParams[0],
          minDuration: BigNumber.from(24 * 10),
          maxDuration: BigNumber.from(24 * 10),
          minAmount: ethers.utils.parseUnits("100", 18),
          maxAmount: ethers.utils.parseUnits("100", 18),
        },
      ])
    ).to.be.revertedWith(
      "interest must be constant if amount and duration are constant"
    );
  });
});
