import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  NFTYFinanceV1,
  NFTYFinanceV1__factory,
  NFTYLendingKeysV1__factory,
  NFTYObligationNotesV1__factory,
  NFTYPromissoryNotesV1__factory,
} from "typechain-types";

describe("Deploy NFTYFinance", () => {
  const deployDependencies = async () => {
    // Promissory Notes
    const PromissoryNotes = (await ethers.getContractFactory(
      "NFTYPromissoryNotesV1"
    )) as NFTYPromissoryNotesV1__factory;
    const promissoryNotes = await PromissoryNotes.deploy(
      "NFTY Promissory Notes",
      "LEND",
      "https://metadata.nfty.finance/LEND/"
    );
    await promissoryNotes.deployed();

    // Obligation Notes
    const ObligationNotes = (await ethers.getContractFactory(
      "NFTYObligationNotesV1"
    )) as NFTYObligationNotesV1__factory;
    const obligationNotes = await ObligationNotes.deploy(
      "NFTY Obligation Notes",
      "BORROW",
      "https://metadata.nfty.finance/BORROW/"
    );
    await obligationNotes.deployed();

    // Lending Keys
    const LendingKeys = (await ethers.getContractFactory(
      "NFTYLendingKeysV1"
    )) as NFTYLendingKeysV1__factory;
    const lendingKeys = await LendingKeys.deploy(
      "NFTY Lending Keys",
      "KEYS",
      "https://metadata.nfty.finance/KEYS/"
    );
    await lendingKeys.deployed();

    const NFTYFinance = (await ethers.getContractFactory(
      "NFTYFinanceV1"
    )) as NFTYFinanceV1__factory;

    return {
      promissoryNotes,
      obligationNotes,
      lendingKeys,
      NFTYFinance,
    };
  };

  it("should fail for zero addr promissory note", async () => {
    const { NFTYFinance, obligationNotes, lendingKeys } = await loadFixture(
      deployDependencies
    );

    await expect(
      NFTYFinance.deploy(
        ethers.constants.AddressZero, // zero address for promissory note
        obligationNotes.address,
        lendingKeys.address,
        200
      )
    ).to.be.revertedWith("promissory note is zero addr");
  });

  it("should fail for zero addr obligation receipt", async () => {
    const { NFTYFinance, promissoryNotes, lendingKeys } = await loadFixture(
      deployDependencies
    );

    await expect(
      NFTYFinance.deploy(
        promissoryNotes.address,
        ethers.constants.AddressZero, // zero address for obligation notes
        lendingKeys.address,
        200
      )
    ).to.be.revertedWith("obligation note is zero addr");
  });

  it("should fail for zero addr lending keys", async () => {
    const { NFTYFinance, promissoryNotes, obligationNotes } = await loadFixture(
      deployDependencies
    );

    await expect(
      NFTYFinance.deploy(
        promissoryNotes.address,
        obligationNotes.address,
        ethers.constants.AddressZero, // zero address for lending keys
        200
      )
    ).to.be.revertedWith("lending keys is zero addr");
  });

  it("should deploy", async () => {
    const { NFTYFinance, promissoryNotes, obligationNotes, lendingKeys } =
      await loadFixture(deployDependencies);
    const [owner] = await ethers.getSigners();

    const nftyFinance = (await NFTYFinance.deploy(
      promissoryNotes.address,
      obligationNotes.address,
      lendingKeys.address,
      200
    )) as NFTYFinanceV1;

    // check if emitted OwnershipTransferred event
    expect(nftyFinance.deployTransaction)
      .to.emit(nftyFinance, "OwnershipTransferred")
      .withArgs(ethers.constants.AddressZero, owner.address);

    // check expected values set in constructor
    expect(await nftyFinance.owner()).to.equal(owner.address);
    expect(await nftyFinance.paused()).to.be.false;
    expect(await nftyFinance.promissoryNotes()).to.equal(
      promissoryNotes.address
    );
    expect(await nftyFinance.obligationNotes()).to.equal(
      obligationNotes.address
    );
    expect(await nftyFinance.lendingKeys()).to.equal(lendingKeys.address);
    expect(await nftyFinance.loanOriginationFee()).to.equal(200);
  });
});
