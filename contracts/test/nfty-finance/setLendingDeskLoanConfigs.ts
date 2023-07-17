import { BigNumber, ethers } from "ethers";
import { initializeLendingDesk } from "../utils/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { LoanConfig } from "../utils/consts";

describe("Set lending desk loan configs", () => {
  const setup = async () => {
    const { erc721, erc1155, ...rest } = await loadFixture(
      initializeLendingDesk
    );

    const loanConfigParams: LoanConfig[] = [
      {
        nftCollection: erc721.address,
        nftCollectionIsErc1155: false,
        minAmount: ethers.utils.parseUnits("10", 18),
        maxAmount: ethers.utils.parseUnits("10", 18),
        minDuration: ethers.utils.parseUnits("10", 18),
        maxDuration: ethers.utils.parseUnits("10", 18),
        minInterest: ethers.utils.parseUnits("10", 18),
        maxInterest: ethers.utils.parseUnits("10", 18),
      },
      {
        nftCollection: erc1155.address,
        nftCollectionIsErc1155: true,
        minAmount: ethers.utils.parseUnits("80", 18),
        maxAmount: ethers.utils.parseUnits("200", 18),
        minDuration: ethers.utils.parseUnits("24", 18),
        maxDuration: ethers.utils.parseUnits("240", 18),
        minInterest: ethers.utils.parseUnits("2", 18),
        maxInterest: ethers.utils.parseUnits("15", 18),
      },
    ];

    return { erc721, erc1155, loanConfigParams, ...rest };
  };

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

  it("should fail for zero value of numeric params", async () => {
    const { nftyFinance, erc721, lendingDeskId, lender, loanConfigParams } =
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
          maxAmount: BigNumber.from(0),
        },
      ])
    ).to.be.revertedWith("max amount = 0");

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
          maxInterest: BigNumber.from(0),
        },
      ])
    ).to.be.revertedWith("max interest = 0");

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
          maxDuration: BigNumber.from(0),
        },
      ])
    ).to.be.revertedWith("max duration = 0");
  });

  it("should add loan configs", async () => {
    const {
      nftyFinance,
      erc721,
      erc1155,
      lendingDeskId,
      lender,
      loanConfigParams,
    } = await loadFixture(setup);

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
      const loanConfig = loanConfigParams[i];

      expect(loanConfig).to.not.be.undefined;
      expect(eventLoanConfig.minAmount).to.equal(loanConfig?.minAmount);
      expect(eventLoanConfig.maxAmount).to.equal(loanConfig?.maxAmount);
      expect(eventLoanConfig.minDuration).to.equal(loanConfig?.minDuration);
      expect(eventLoanConfig.maxDuration).to.equal(loanConfig?.maxDuration);
      expect(eventLoanConfig.minInterest).to.equal(loanConfig?.minInterest);
      expect(eventLoanConfig.maxInterest).to.equal(loanConfig?.maxInterest);
    }
  });
});
