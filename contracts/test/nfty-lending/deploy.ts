import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import {
  DIAOracleV2__factory,
  NFTYLending,
  NFTYLending__factory,
  NFTYNotes__factory,
  TestERC20__factory,
} from "typechain-types";

describe("Deploy NFTYLending", () => {
  const deployDependencies = async () => {
    // $NFTY token
    const TestERC20 = (await ethers.getContractFactory(
      "TestERC20"
    )) as TestERC20__factory;
    const nftyToken = await TestERC20.deploy("NFTY Coin", "NFTY");
    await nftyToken.deployed();

    // NFTYNotes
    const NFTYNotes = (await ethers.getContractFactory(
      "NFTYNotes"
    )) as NFTYNotes__factory;
    const promissoryNote = await NFTYNotes.deploy(
      "NFTY Promissory Note",
      "LEND",
      "https://metadata.nfty.finance/LEND/"
    );
    await promissoryNote.deployed();
    const obligationReceipt = await NFTYNotes.deploy(
      "NFTY Obligation Receipt",
      "BORROW",
      "https://metadata.nfty.finance/BORROW/"
    );
    await obligationReceipt.deployed();

    const DIAOracle = (await ethers.getContractFactory(
      "DIAOracleV2"
    )) as DIAOracleV2__factory;
    const diaOracle = await DIAOracle.deploy();
    await diaOracle.deployed();

    const NFTYLending = (await ethers.getContractFactory(
      "NFTYLending"
    )) as NFTYLending__factory;

    return {
      diaOracle,
      nftyToken,
      promissoryNote,
      obligationReceipt,
      NFTYLending,
    };
  };

  it("should fail for zero addr promissory note", async () => {
    const { NFTYLending, obligationReceipt, nftyToken, diaOracle } =
      await loadFixture(deployDependencies);

    await expect(
      upgrades.deployProxy(NFTYLending, [
        ethers.constants.AddressZero, // zero address for promissory note
        obligationReceipt.address,
        nftyToken.address,
      ])
    ).to.be.revertedWith("promissory note is zero addr");
  });

  it("should fail for zero addr obligation receipt", async () => {
    const { NFTYLending, promissoryNote, nftyToken, diaOracle } =
      await loadFixture(deployDependencies);

    await expect(
      upgrades.deployProxy(NFTYLending, [
        promissoryNote.address,
        ethers.constants.AddressZero, // zero address for obligation receipt
        nftyToken.address,
      ])
    ).to.be.revertedWith("obligation receipt is zero addr");
  });

  it("should fail for zero addr nfty token", async () => {
    const { NFTYLending, promissoryNote, diaOracle, obligationReceipt } =
      await loadFixture(deployDependencies);

    await expect(
      upgrades.deployProxy(NFTYLending, [
        promissoryNote.address,
        obligationReceipt.address,
        ethers.constants.AddressZero, // zero address for obligation receipt
      ])
    ).to.be.revertedWith("nfty contract is zero addr");
  });

  it("should deploy", async () => {
    const {
      NFTYLending,
      promissoryNote,
      obligationReceipt,
      nftyToken,
      diaOracle,
    } = await loadFixture(deployDependencies);
    const [owner] = await ethers.getSigners();

    const nftyLending = (await upgrades.deployProxy(NFTYLending, [
      promissoryNote.address,
      obligationReceipt.address,
      nftyToken.address,
    ])) as NFTYLending;

    // check expected values set in constructor
    expect(await nftyLending.owner()).to.equal(owner.address);
    expect(await nftyLending.paused()).to.be.false;
  });
});
