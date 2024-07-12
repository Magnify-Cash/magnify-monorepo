import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deploymagnifyErc721 } from "../utils/fixtures";
import { ethers } from "hardhat";

describe("Magnify ERC721: Set Magnify Cash", () => {
  const magnifyCash = "0x1334C462caE889068b0bf4146C9fd420CF72DbF9";

  it("should fail when caller is not admin", async () => {
    const { magnifyErc721, alice } = await loadFixture(deploymagnifyErc721);
    await expect(
      magnifyErc721.connect(alice).setMagnifyCash(magnifyCash)
    ).to.be.revertedWithCustomError(magnifyErc721, "Unauthorized");
  });

  it("should fail for zero address", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721);
    await expect(
      magnifyErc721.setMagnifyCash(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(magnifyErc721, "MagnifyCashIsZeroAddress");
  });

  it("should set Magnify Cash", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721);
    const tx = await magnifyErc721.setMagnifyCash(magnifyCash);

    // Check emitted event and storage
    expect(tx).to.emit(magnifyErc721, "MagnifyCashSet").withArgs(magnifyCash);
    expect(await magnifyErc721.magnifyCash()).to.equal(magnifyCash);
  });
});
