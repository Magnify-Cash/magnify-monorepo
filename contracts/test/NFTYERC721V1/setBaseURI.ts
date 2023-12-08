import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployNftyErc721 } from "../utils/fixtures";

describe("NFTY ERC721: Set base URI", () => {
  it("should fail when caller is not admin", async () => {
    const { nftyErc721, alice } = await loadFixture(deployNftyErc721);
    await expect(nftyErc721.connect(alice).setBaseURI(""))
      .to.be.revertedWithCustomError(nftyErc721, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("should fail when base URI is empty", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721);
    await expect(nftyErc721.setBaseURI("")).to.be.revertedWith(
      "base URI cannot be empty"
    );
  });

  it("should set base URI", async () => {
    const { nftyErc721 } = await loadFixture(deployNftyErc721);
    const baseUri = "https://example.com/";
    const tx = await nftyErc721.setBaseURI(baseUri);

    // Check emitted event and storage
    expect(tx).to.emit(nftyErc721, "BaseURISet").withArgs(baseUri);
    expect(await nftyErc721.baseURI()).to.equal(baseUri);
  });
});
