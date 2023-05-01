import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import { task } from "hardhat/config";
import { DIAOracleV2__factory } from "../../typechain-types";

// Task to deploy DIA Oracle
task("deploy-oracle", "Deploys DIA Oracle contract").setAction(
  async (_, hre) => {
    // Deploy contract
    const DIAOracle = (await hre.ethers.getContractFactory(
      "DIAOracleV2"
    )) as DIAOracleV2__factory;
    const diaOracleV2 = await DIAOracle.deploy();
    await diaOracleV2.deployed();

    // Print details
    console.log("DIA Oracle deployed @", diaOracleV2.address);
    return diaOracleV2;
  }
);
