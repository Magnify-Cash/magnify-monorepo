import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployNftyErc721 } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("NFTY ERC721: Set NFTY Finance", () => {
  const nftyFinance = "0x1334C462caE889068b0bf4146C9fd420CF72DbF9";

  it("should fail when caller is not admin", async () => {
    const { nftyErc721, alice } = await loadFixture(deployNftyErc721);
    await expect(nftyErc721.connect(alice).setNftyFinance(nftyFinance))
      .to.be.revertedWithCustomError(nftyErc721, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("should fail for zero address", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721);
    await expect(
      nftyErc721.setNftyFinance(ethers.ZeroAddress)
    ).to.be.revertedWith("NFTY Finance address cannot be zero");
  });

  it("should set NFTY Finance", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721);
    const tx = await nftyErc721.setNftyFinance(nftyFinance);

    // Check emitted event and storage
    expect(tx).to.emit(nftyErc721, "NftyFinanceSet").withArgs(nftyFinance);
    expect(await nftyErc721.nftyFinance()).to.equal(nftyFinance);
  });
});
