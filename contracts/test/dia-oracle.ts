import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { TEST_CURRENCIES } from "./utils/consts";
import { DIAOracleV2__factory } from "../../typechain-types";

describe("DIA Oracle V2", () => {
  const deployContractFixture = async () => {
    const DIAOracle = (await ethers.getContractFactory(
      "DIAOracleV2"
    )) as DIAOracleV2__factory;
    const [owner, alice, bob] = await ethers.getSigners();
    const diaOracle = await DIAOracle.deploy();
    await diaOracle.deployed();

    return { diaOracle, owner, alice, bob };
  };

  it("should set and get multiple price values", async () => {
    const { diaOracle } = await loadFixture(deployContractFixture);

    // Run the test for each pair of currencies
    for (const [pair, details] of Object.entries(TEST_CURRENCIES)) {
      const tx = await diaOracle.setValue(
        pair,
        details.price,
        details.timestamp
      );

      // Check if Oracle emits expected event
      expect(tx)
        .to.emit(diaOracle, "OracleUpdate")
        .withArgs(pair, details.price, details.timestamp);

      // Check if Oracle returns expected data
      const storedDetails = await diaOracle.getValue(pair);
      expect(storedDetails[1]).to.equal(details.timestamp);
      expect(storedDetails[0]).to.equal(details.price);
    }
  });

  it("should fail to set price from non-oracle-updater", async () => {
    const { diaOracle, alice } = await loadFixture(deployContractFixture);

    const currency = "NFTY/USD";
    await expect(
      diaOracle
        .connect(alice)
        .setValue(
          currency,
          TEST_CURRENCIES[currency].price,
          TEST_CURRENCIES[currency].timestamp
        )
    ).to.be.reverted;
  });

  it("should fail to update oracle-updater from non-oracle-updater", async () => {
    const { diaOracle, alice, bob } = await loadFixture(deployContractFixture);

    await expect(
      diaOracle.connect(alice).updateOracleUpdaterAddress(bob.address)
    ).to.be.reverted;
  });

  it("should update oracle-updater", async () => {
    const { diaOracle, alice } = await loadFixture(deployContractFixture);

    const tx = await diaOracle.updateOracleUpdaterAddress(alice.address);
    expect(tx)
      .to.emit(diaOracle, "UpdaterAddressChange")
      .withArgs(alice.address);

    // New oracle updater should be able to set value
    const currency = "NFTY/USD";
    await expect(
      diaOracle
        .connect(alice)
        .setValue(
          currency,
          TEST_CURRENCIES[currency].price,
          TEST_CURRENCIES[currency].timestamp
        )
    ).to.not.be.reverted;
  });
});
