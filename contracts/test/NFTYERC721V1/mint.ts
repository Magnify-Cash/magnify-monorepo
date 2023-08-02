import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployNftyErc721AndSetNftyFinance } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("NFTY ERC721: Mint", () => {
  const tokenId = 1;
  const mintTo = "0x1334C462caE889068b0bf4146C9fd420CF72DbF9";

  it("should fail when caller is not NFTY Finance", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721AndSetNftyFinance);

    await expect(nftyErc721.mint(mintTo, tokenId)).to.be.revertedWith(
      "caller is not NFTY Finance"
    );
  });

  it("should fail when minting to zero address", async () => {
    const { nftyErc721, nftyFinance } = await loadFixture(
      deployNftyErc721AndSetNftyFinance
    );

    await expect(
      nftyErc721
        .connect(nftyFinance)
        .mint(ethers.constants.AddressZero, tokenId)
    ).to.be.revertedWith("to address cannot be zero");
  });

  it("should fail when token already exists", async () => {
    const { nftyErc721, nftyFinance } = await loadFixture(
      deployNftyErc721AndSetNftyFinance
    );
    await nftyErc721.connect(nftyFinance).mint(mintTo, tokenId);

    await expect(
      nftyErc721.connect(nftyFinance).mint(mintTo, tokenId)
    ).to.be.revertedWith("token already exists");
  });

  it("should mint", async () => {
    const { nftyErc721, nftyFinance } = await loadFixture(
      deployNftyErc721AndSetNftyFinance
    );
    const tx = await nftyErc721.connect(nftyFinance).mint(mintTo, tokenId);

    // Check emitted event and storage
    expect(tx)
      .to.emit(nftyErc721, "Transfer")
      .withArgs(ethers.constants.AddressZero, mintTo, tokenId);
    expect(await nftyErc721.ownerOf(tokenId)).to.equal(mintTo);
  });
});