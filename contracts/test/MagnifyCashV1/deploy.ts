import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { getEventNames } from "../utils/utils";

describe("Magnify Cash: Deploy", () => {
  const deployDependencies = async () => {
    const [owner, alice, platformWallet] = await ethers.getSigners();

    // Obligation Notes
    const ObligationNotes = await ethers.getContractFactory(
      "MagnifyObligationNotesV1"
    );
    const obligationNotes = await ObligationNotes.deploy(
      "Magnify Obligation Notes",
      "BORROW",
      "https://metadata.magnify.cash/BORROW/",
      owner.address
    );
    await obligationNotes.waitForDeployment();

    // Lending Keys
    const LendingKeys = await ethers.getContractFactory("MagnifyLendingKeysV1");
    const lendingKeys = await LendingKeys.deploy(
      "Magnify Lending Keys",
      "KEYS",
      "https://metadata.magnify.cash/KEYS/",
      owner.address
    );
    await lendingKeys.waitForDeployment();

    const MagnifyCash = await ethers.getContractFactory("MagnifyCashV1");

    return {
      obligationNotes,
      lendingKeys,
      MagnifyCash,
      platformWallet: platformWallet.address,
      owner,
    };
  };

  it("should fail for zero addr obligation receipt", async () => {
    const { MagnifyCash, lendingKeys, platformWallet, owner } =
      await loadFixture(deployDependencies);

    await expect(
      MagnifyCash.deploy(
        ethers.ZeroAddress, // zero address for obligation notes
        lendingKeys.target,
        200,
        platformWallet,
        owner.address
      )
    ).to.be.revertedWithCustomError(MagnifyCash, "ObligationNotesIsZeroAddr");
  });

  it("should fail for zero addr lending keys", async () => {
    const {
      MagnifyCash,
      obligationNotes,
      platformWallet,
      owner,
    } = await loadFixture(deployDependencies);

    await expect(
      MagnifyCash.deploy(
        obligationNotes.target,
        ethers.ZeroAddress, // zero address for lending keys
        200,
        platformWallet,
        owner.address
      )
    ).to.be.revertedWithCustomError(MagnifyCash, "LendingKeysIsZeroAddr");
  });

  it("should deploy", async () => {
    const {
      MagnifyCash,
      obligationNotes,
      lendingKeys,
      platformWallet,
    } = await loadFixture(deployDependencies);
    const [owner] = await ethers.getSigners();

    const magnifyCash = await MagnifyCash.deploy(
      obligationNotes.target,
      lendingKeys.target,
      200,
      platformWallet,
      owner.address
    );

    const tx = magnifyCash.deploymentTransaction();

    // Assert order of 4 emitted events
    const eventNames = await getEventNames(tx!);
    expect(eventNames).to.deep.equal([
      "OwnershipTransferred",
      "LoanOriginationFeeSet",
      "PlatformWalletSet",
      "ProtocolInitialized",
    ]);

    // check if emitted OwnershipTransferred event
    expect(tx)
      .to.emit(magnifyCash, "OwnershipTransferred")
      .withArgs(ethers.ZeroAddress, owner.address);

    // check if emitted LoanOriginationFeeSet event
    expect(tx).to.emit(magnifyCash, "LoanOriginationFeeSet").withArgs(200);

    // check if emitted PlatformWalletSet event
    expect(tx)
      .to.emit(magnifyCash, "PlatformWalletSet")
      .withArgs(platformWallet);

    // check if emitted ProtocolInitialized event
    expect(tx)
      .to.emit(magnifyCash, "ProtocolInitialized")
      .withArgs(
        obligationNotes.target,
        lendingKeys.target
      );

    // check expected values set in constructor
    expect(await magnifyCash.owner()).to.equal(owner.address);
    expect(await magnifyCash.paused()).to.be.false;
    expect(await magnifyCash.obligationNotes()).to.equal(
      obligationNotes.target
    );
    expect(await magnifyCash.lendingKeys()).to.equal(lendingKeys.target);
    expect(await magnifyCash.loanOriginationFee()).to.equal(200);
    expect(await magnifyCash.platformWallet()).to.equal(platformWallet);
  });
});
