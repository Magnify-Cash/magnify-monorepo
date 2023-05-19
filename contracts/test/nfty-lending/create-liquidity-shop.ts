import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { deployNftyLendingWithTestTokens } from "../utils/fixtures";
import { expect } from "chai";
import { ethers } from "hardhat";
import { LiquidityShopStatus } from "../utils/consts";

describe("Create liquidity shop", () => {
  const name = "My Shop";
  const liquidityAmount = 10000;
  const maxOffer = 1000;
  const interestA = 10;
  const interestB = 20;
  const interestC = 30;
  const automaticApproval = true;
  const allowRefinancingTerms = true;

  it("should fail for zero address ERC20", async () => {
    const { nftyLending, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        name,
        ethers.constants.AddressZero, // zero address
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("invalid erc20");
  });

  it("should fail for zero addr NFT collection", async () => {
    const { nftyLending, erc20 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        ethers.constants.AddressZero, // zero address
        false,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("invalid nft collection");
  });

  it("should fail for invalid ERC721", async () => {
    const { nftyLending, erc20, erc1155 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc1155.address,
        false, // should have been true
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("invalid nft collection");
  });

  it("should fail for invalid ERC1155", async () => {
    const { nftyLending, erc20, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        true, // should have been false
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("invalid nft collection");
  });

  it("should fail for empty name", async () => {
    const { nftyLending, erc20, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        "", // name cannot be empty
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("empty shop name");
  });

  it("should fail for zero max offer", async () => {
    const { nftyLending, erc20, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        0, // 0 max offer
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("max offer = 0");
  });

  it("should fail for zero interests", async () => {
    const { nftyLending, erc20, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        0, // 0 interestB
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("interestA = 0");

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        0, // 0 interestB
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("interestB = 0");

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        interestB,
        0, // 0 interestC
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("interestC = 0");
  });

  it("should fail if contract is paused", async () => {
    const { nftyLending, erc20, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );
    await nftyLending.setPaused(true);

    await expect(
      nftyLending.createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      )
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should create liquidity shop for ERC721", async () => {
    const { nftyLending, erc20, erc721 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );
    const [owner, lender] = await ethers.getSigners();

    // Get ERC20 and approve
    await erc20.connect(lender).mint(liquidityAmount);
    await erc20.connect(lender).approve(nftyLending.address, liquidityAmount);

    // Create liquidity shop
    const tx = await nftyLending
      .connect(lender)
      .createLiquidityShop(
        name,
        erc20.address,
        erc721.address,
        false,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      );

    // Check emitted event
    await expect(tx)
      .emit(nftyLending, "LiquidityShopCreated")
      .withArgs(
        lender.address,
        erc20.address,
        erc721.address,
        interestA,
        interestB,
        interestC,
        maxOffer,
        liquidityAmount,
        anyValue,
        name,
        automaticApproval,
        allowRefinancingTerms
      );

    // Check ERC20 balances
    expect(await erc20.balanceOf(lender.address)).to.equal(0);
    expect(await erc20.balanceOf(nftyLending.address)).to.equal(
      liquidityAmount
    );

    // Get liquidity shop from storage
    const { events } = await tx.wait();
    const event = events?.find(
      (event) => event.event == "LiquidityShopCreated"
    )?.args;
    const liquidityShop = await nftyLending.liquidityShops(event?.id);

    // Asserts
    expect(liquidityShop.erc20).to.equal(erc20.address);
    expect(liquidityShop.nftCollection).to.equal(erc721.address);
    expect(liquidityShop.nftCollectionIsErc1155).to.equal(false);
    expect(liquidityShop.owner).to.equal(lender.address);
    expect(liquidityShop.balance).to.equal(liquidityAmount);
    expect(liquidityShop.interestA).to.equal(interestA);
    expect(liquidityShop.interestB).to.equal(interestB);
    expect(liquidityShop.interestC).to.equal(interestC);
    expect(liquidityShop.maxOffer).to.equal(maxOffer);
    expect(liquidityShop.name).to.equal(name);
    expect(liquidityShop.status).to.equal(LiquidityShopStatus.Active);
    expect(liquidityShop.automaticApproval).to.equal(automaticApproval);
    expect(liquidityShop.allowRefinancingTerms).to.equal(allowRefinancingTerms);
  });

  it("should create liquidity shop for ERC1155", async () => {
    const { nftyLending, erc20, erc1155 } = await loadFixture(
      deployNftyLendingWithTestTokens
    );
    const [owner, lender] = await ethers.getSigners();

    // Get ERC20 and approve
    await erc20.connect(lender).mint(liquidityAmount);
    await erc20.connect(lender).approve(nftyLending.address, liquidityAmount);

    // Create liquidity shop
    const tx = await nftyLending
      .connect(lender)
      .createLiquidityShop(
        name,
        erc20.address,
        erc1155.address,
        true,
        liquidityAmount,
        interestA,
        interestB,
        interestC,
        maxOffer,
        automaticApproval,
        allowRefinancingTerms
      );

    // Check emitted event
    await expect(tx)
      .emit(nftyLending, "LiquidityShopCreated")
      .withArgs(
        lender.address,
        erc20.address,
        erc1155.address,
        interestA,
        interestB,
        interestC,
        maxOffer,
        liquidityAmount,
        anyValue,
        name,
        automaticApproval,
        allowRefinancingTerms
      );

    // Check ERC20 balances
    expect(await erc20.balanceOf(lender.address)).to.equal(0);
    expect(await erc20.balanceOf(nftyLending.address)).to.equal(
      liquidityAmount
    );

    // Get liquidity shop from storage
    const { events } = await tx.wait();
    const event = events?.find(
      (event) => event.event == "LiquidityShopCreated"
    )?.args;
    const liquidityShop = await nftyLending.liquidityShops(event?.id);

    // Asserts
    expect(liquidityShop.erc20).to.equal(erc20.address);
    expect(liquidityShop.nftCollection).to.equal(erc1155.address);
    expect(liquidityShop.nftCollectionIsErc1155).to.equal(true);
    expect(liquidityShop.owner).to.equal(lender.address);
    expect(liquidityShop.balance).to.equal(liquidityAmount);
    expect(liquidityShop.interestA).to.equal(interestA);
    expect(liquidityShop.interestB).to.equal(interestB);
    expect(liquidityShop.interestC).to.equal(interestC);
    expect(liquidityShop.maxOffer).to.equal(maxOffer);
    expect(liquidityShop.name).to.equal(name);
    expect(liquidityShop.status).to.equal(LiquidityShopStatus.Active);
    expect(liquidityShop.automaticApproval).to.equal(automaticApproval);
    expect(liquidityShop.allowRefinancingTerms).to.equal(allowRefinancingTerms);
  });
});
