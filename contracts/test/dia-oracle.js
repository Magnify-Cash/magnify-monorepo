const { expect } = require("chai");
const { ethers } = require("hardhat");

const { TEST_CURRENCIES } = require("./utils/consts");

describe("DIA OracleV2", function () {
  before(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const DIAOracleFactory = await ethers.getContractFactory("DIAOracleV2");
    this.DIAOracle = await DIAOracleFactory.deploy();
    await this.DIAOracle.deployed();
  });

  it("should set and get multiple price values", async function () {
    for (let i = 0; i < TEST_CURRENCIES.length; i++) {
      const currency = TEST_CURRENCIES[i];
      const tx = await this.DIAOracle.setValue(
        currency,
        TEST_CURRENCIES[currency].price,
        TEST_CURRENCIES[currency].timestamp
      );
      expect(tx).to.emit(this.DIAOracle, "OracleUpdate");
      const response = await tx.wait();

      const oracleUpdateEvent = response.events.find(
        (event) => event.event == "OracleUpdate"
      ).args;

      expect(oracleUpdateEvent.key).to.equal(currency);
      expect(oracleUpdateEvent.value).to.equal(TEST_CURRENCIES[currency].price);
      expect(oracleUpdateEvent.timestamp).to.equal(
        TEST_CURRENCIES[currency].timestamp
      );

      const storageCurrency = await this.DIAOracle.getValue(currency);
      expect(storageCurrency[1]).to.equal(TEST_CURRENCIES[currency].timestamp);
      expect(storageCurrency[0]).to.equal(TEST_CURRENCIES[currency].price);
    }
  });

  it("should fail to set price values from non-oracle-updater", async function () {
    const currency = "NFTY/USD";
    await expect(
      this.DIAOracle.connect(alice).setValue(
        currency,
        TEST_CURRENCIES[currency].price,
        TEST_CURRENCIES[currency].timestamp
      )
    ).to.be.reverted;
  });

  it("should fail to update oracle-updater from non-oracle-updater", async function () {
    await expect(
      this.DIAOracle.connect(alice).updateOracleUpdaterAddress(bob.address)
    ).to.be.reverted;
  });

  it("should update oracle-updater", async function () {
    const tx = await this.DIAOracle.updateOracleUpdaterAddress(alice.address);
    expect(tx).to.emit(this.DIAOracle, "UpdaterAddressChange");
    const response = await tx.wait();

    const updatedAddressChangeEvent = response.events.find(
      (event) => event.event == "UpdaterAddressChange"
    ).args;

    expect(updatedAddressChangeEvent.newUpdater).to.equal(alice.address);

    await this.DIAOracle.connect(alice).updateOracleUpdaterAddress(
      owner.address
    );
  });

  it("new oracle-updater should be able to set values ", async function () {
    for (let i = 0; i < TEST_CURRENCIES.length; i++) {
      const currency = TEST_CURRENCIES[i];
      const tx = await this.DIAOracle.setValue(
        currency,
        TEST_CURRENCIES[currency].price,
        TEST_CURRENCIES[currency].timestamp
      );
      expect(tx).to.emit(this.DIAOracle, "OracleUpdate");
      const response = await tx.wait();

      const oracleUpdateEvent = response.events.find(
        (event) => event.event == "OracleUpdate"
      ).args;

      expect(oracleUpdateEvent.key).to.equal(currency);
      expect(oracleUpdateEvent.value).to.equal(TEST_CURRENCIES[currency].price);
      expect(oracleUpdateEvent.timestamp).to.equal(
        TEST_CURRENCIES[currency].timestamp
      );

      const storageCurrency = await this.DIAOracle.getValue(currency);
      expect(storageCurrency[1]).to.equal(TEST_CURRENCIES[currency].timestamp);
      expect(storageCurrency[0]).to.equal(TEST_CURRENCIES[currency].price);
    }
  });
});
