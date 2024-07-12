import { expect } from "chai";
import { ethers } from "hardhat";

describe("Magnify ERC721: Deploy", function () {
  const name = "Magnify ERC721";
  const symbol = "MAG";
  const baseUri = "https://metadata.magnify-erc721.local";

  it("should deploy", async () => {
    const [owner] = await ethers.getSigners();

    const MagnifyERC721V1 = await ethers.getContractFactory("MagnifyERC721V1");
    const magnifyErc721 = await MagnifyERC721V1.deploy(
      name,
      symbol,
      baseUri,
      owner.address
    );
    await magnifyErc721.waitForDeployment();

    // Check emitted event
    expect(magnifyErc721.deploymentTransaction)
      .to.emit(magnifyErc721, "Deployed")
      .withArgs(name, symbol, baseUri);

    // Check storage
    expect(await magnifyErc721.baseURI()).to.equal(baseUri);
    expect(await magnifyErc721.owner()).to.equal(owner.address);
    expect(await magnifyErc721.name()).to.equal(name);
    expect(await magnifyErc721.symbol()).to.equal(symbol);
    expect(await magnifyErc721.baseURI()).to.equal(baseUri);
  });

  it("should fail to deploy with empty name", async () => {
    const [owner] = await ethers.getSigners();

    const MagnifyERC721V1 = await ethers.getContractFactory("MagnifyERC721V1");
    await expect(
      MagnifyERC721V1.deploy("", symbol, baseUri, owner.address)
    ).to.be.revertedWithCustomError(MagnifyERC721V1, "NameIsEmpty");
  });

  it("should fail to deploy with empty symbol", async () => {
    const [owner] = await ethers.getSigners();

    const MagnifyERC721V1 = await ethers.getContractFactory("MagnifyERC721V1");
    await expect(
      MagnifyERC721V1.deploy(name, "", baseUri, owner.address)
    ).to.be.revertedWithCustomError(MagnifyERC721V1, "SymbolIsEmpty");
  });

  it("should fail to deploy with empty base URI", async () => {
    const [owner] = await ethers.getSigners();

    const MagnifyERC721V1 = await ethers.getContractFactory("MagnifyERC721V1");
    await expect(
      MagnifyERC721V1.deploy(name, symbol, "", owner.address)
    ).to.be.revertedWithCustomError(MagnifyERC721V1, "BaseURIIsEmpty");
  });
});
