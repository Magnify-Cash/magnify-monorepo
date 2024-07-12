import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deploymagnifyErc721AndSetMagnifyCash } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("Magnify ERC721: Mint", () => {
  const tokenId = 1;
  const mintTo = "0x1334C462caE889068b0bf4146C9fd420CF72DbF9";

  it("should fail when caller is not Magnify Cash", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721AndSetMagnifyCash);

    await expect(
      magnifyErc721.mint(mintTo, tokenId)
    ).to.be.revertedWithCustomError(magnifyErc721, "CallerIsNotMagnifyCash");
  });

  it("should fail when minting to zero address", async () => {
    const { magnifyErc721, magnifyCash } = await loadFixture(
      deploymagnifyErc721AndSetMagnifyCash
    );

    await expect(
      magnifyErc721.connect(magnifyCash).mint(ethers.ZeroAddress, tokenId)
    ).to.be.revertedWithCustomError(magnifyErc721, "MintToZeroAddress");
  });

  it("should fail when token already exists", async () => {
    const { magnifyErc721, magnifyCash } = await loadFixture(
      deploymagnifyErc721AndSetMagnifyCash
    );
    await magnifyErc721.connect(magnifyCash).mint(mintTo, tokenId);

    await expect(
      magnifyErc721.connect(magnifyCash).mint(mintTo, tokenId)
    ).to.be.revertedWithCustomError(magnifyErc721, "TokenAlreadyExists");
  });

  it("should mint", async () => {
    const { magnifyErc721, magnifyCash } = await loadFixture(
      deploymagnifyErc721AndSetMagnifyCash
    );
    const tx = await magnifyErc721.connect(magnifyCash).mint(mintTo, tokenId);

    // Check emitted event and storage
    expect(tx)
      .to.emit(magnifyErc721, "Transfer")
      .withArgs(ethers.ZeroAddress, mintTo, tokenId);
    expect(await magnifyErc721.ownerOf(tokenId)).to.equal(mintTo);
  });
});
