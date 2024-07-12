import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deploymagnifyErc721 } from "../utils/fixtures";

describe("Magnify ERC721: Set base URI", () => {
  it("should fail when caller is not admin", async () => {
    const { magnifyErc721, alice } = await loadFixture(deploymagnifyErc721);
    await expect(
      magnifyErc721.connect(alice).setBaseURI("")
    ).to.be.revertedWithCustomError(magnifyErc721, "Unauthorized");
  });

  it("should fail when base URI is empty", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721);
    await expect(magnifyErc721.setBaseURI("")).to.be.revertedWithCustomError(
      magnifyErc721,
      "BaseURIIsEmpty"
    );
  });

  it("should set base URI", async () => {
    const { magnifyErc721 } = await loadFixture(deploymagnifyErc721);
    const baseUri = "https://example.com/";
    const tx = await magnifyErc721.setBaseURI(baseUri);

    // Check emitted event and storage
    expect(tx).to.emit(magnifyErc721, "BaseURISet").withArgs(baseUri);
    expect(await magnifyErc721.baseURI()).to.equal(baseUri);
  });
});
