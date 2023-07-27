import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTYERC721V1__factory } from "../../../typechain-types";

describe("NFTY ERC721: Deploy", function () {
  const name = "NFTY ERC721";
  const symbol = "NFTY";
  const baseUri = "https://metadata.nfty-erc721.local";

  it("should deploy", async () => {
    const [owner] = await ethers.getSigners();

    const NFTYERC721V1 = (await ethers.getContractFactory(
      "NFTYERC721V1"
    )) as NFTYERC721V1__factory;
    const nftyErc721 = await NFTYERC721V1.deploy(name, symbol, baseUri);
    await nftyErc721.deployed();

    // Check emitted event
    expect(nftyErc721.deployTransaction)
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
    const NFTYERC721V1 = (await ethers.getContractFactory(
      "NFTYERC721V1"
    )) as NFTYERC721V1__factory;
    await expect(NFTYERC721V1.deploy("", symbol, baseUri)).to.be.revertedWith(
      "name cannot be empty"
    );
  });

  it("should fail to deploy with empty symbol", async () => {
    const NFTYERC721V1 = (await ethers.getContractFactory(
      "NFTYERC721V1"
    )) as NFTYERC721V1__factory;
    await expect(NFTYERC721V1.deploy(name, "", baseUri)).to.be.revertedWith(
      "symbol cannot be empty"
    );
  });

  it("should fail to deploy with empty base URI", async () => {
    const NFTYERC721V1 = (await ethers.getContractFactory(
      "NFTYERC721V1"
    )) as NFTYERC721V1__factory;
    await expect(NFTYERC721V1.deploy(name, symbol, "")).to.be.revertedWith(
      "base URI cannot be empty"
    );
  });
});
