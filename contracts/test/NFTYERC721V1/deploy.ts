import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTY ERC721: Deploy", function () {
  const name = "NFTY ERC721";
  const symbol = "NFTY";
  const baseUri = "https://metadata.nfty-erc721.local";

  it("should deploy", async () => {
    const [owner] = await ethers.getSigners();

    const NFTYERC721V1 = await ethers.getContractFactory("NFTYERC721V1");
    const nftyErc721 = await NFTYERC721V1.deploy(
      name,
      symbol,
      baseUri,
      owner.address
    );
    await nftyErc721.waitForDeployment();

    // Check emitted event
    expect(nftyErc721.deploymentTransaction)
      .to.emit(nftyErc721, "Deployed")
      .withArgs(name, symbol, baseUri);

    // Check storage
    expect(await nftyErc721.baseURI()).to.equal(baseUri);
    expect(await nftyErc721.owner()).to.equal(owner.address);
    expect(await nftyErc721.name()).to.equal(name);
    expect(await nftyErc721.symbol()).to.equal(symbol);
    expect(await nftyErc721.baseURI()).to.equal(baseUri);
  });

  it("should fail to deploy with empty name", async () => {
    const [owner] = await ethers.getSigners();

    const NFTYERC721V1 = await ethers.getContractFactory("NFTYERC721V1");
    await expect(
      NFTYERC721V1.deploy("", symbol, baseUri, owner.address)
    ).to.be.revertedWithCustomError(NFTYERC721V1, "NameIsEmpty");
  });

  it("should fail to deploy with empty symbol", async () => {
    const [owner] = await ethers.getSigners();

    const NFTYERC721V1 = await ethers.getContractFactory("NFTYERC721V1");
    await expect(
      NFTYERC721V1.deploy(name, "", baseUri, owner.address)
    ).to.be.revertedWithCustomError(NFTYERC721V1, "SymbolIsEmpty");
  });

  it("should fail to deploy with empty base URI", async () => {
    const [owner] = await ethers.getSigners();

    const NFTYERC721V1 = await ethers.getContractFactory("NFTYERC721V1");
    await expect(
      NFTYERC721V1.deploy(name, symbol, "", owner.address)
    ).to.be.revertedWithCustomError(NFTYERC721V1, "BaseURIIsEmpty");
  });
});
