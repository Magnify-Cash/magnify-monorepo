import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployNftyErc721AndMint } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("NFTY ERC721: Burn", () => {
  it("should fail when caller is not NFTY Finance", async () => {
    const { nftyErc721, tokenId, alice, owner } = await loadFixture(
      deployNftyErc721AndMint
    );

    // Check for NFT holder
    await expect(
      nftyErc721.connect(alice).burn(tokenId)
    ).to.be.revertedWithCustomError(nftyErc721, "CallerIsNotNFTYFinance");
    // Check for contract owner// admin
    await expect(
      nftyErc721.connect(owner).burn(tokenId)
    ).to.be.revertedWithCustomError(nftyErc721, "CallerIsNotNFTYFinance");
  });

  it("should fail when token does not exist", async () => {
    const { nftyErc721, nftyFinance, tokenId } = await loadFixture(
      deployNftyErc721AndMint
    );

    const invalidTokenId = 2;
    expect(invalidTokenId).to.not.equal(tokenId);

    await expect(
      nftyErc721.connect(nftyFinance).burn(invalidTokenId)
    ).to.be.revertedWithCustomError(nftyErc721, "TokenDoesNotExist");
  });

  it("should burn", async () => {
    const { nftyErc721, nftyFinance, tokenId, alice } = await loadFixture(
      deployNftyErc721AndMint
    );

    const tx = await nftyErc721.connect(nftyFinance).burn(tokenId);

    // Check emitted event
    expect(tx)
      .to.emit(nftyErc721, "Transfer")
      .withArgs(alice.address, ethers.ZeroAddress, tokenId);
  });
});
