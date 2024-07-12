import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deploymagnifyErc721AndMint } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("Magnify ERC721: Burn", () => {
  it("should fail when caller is not Magnify Cash", async () => {
    const { magnifyErc721, tokenId, alice, owner } = await loadFixture(
      deploymagnifyErc721AndMint
    );

    // Check for NFT holder
    await expect(
      magnifyErc721.connect(alice).burn(tokenId)
    ).to.be.revertedWithCustomError(magnifyErc721, "CallerIsNotMagnifyCash");
    // Check for contract owner// admin
    await expect(
      magnifyErc721.connect(owner).burn(tokenId)
    ).to.be.revertedWithCustomError(magnifyErc721, "CallerIsNotMagnifyCash");
  });

  it("should fail when token does not exist", async () => {
    const { magnifyErc721, magnifyCash, tokenId } = await loadFixture(
      deploymagnifyErc721AndMint
    );

    const invalidTokenId = 2;
    expect(invalidTokenId).to.not.equal(tokenId);

    await expect(
      magnifyErc721.connect(magnifyCash).burn(invalidTokenId)
    ).to.be.revertedWithCustomError(magnifyErc721, "TokenDoesNotExist");
  });

  it("should burn", async () => {
    const { magnifyErc721, magnifyCash, tokenId, alice } = await loadFixture(
      deploymagnifyErc721AndMint
    );

    const tx = await magnifyErc721.connect(magnifyCash).burn(tokenId);

    // Check emitted event
    expect(tx)
      .to.emit(magnifyErc721, "Transfer")
      .withArgs(alice.address, ethers.ZeroAddress, tokenId);
  });
});
