import "@nomicfoundation/hardhat-toolbox";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";
import 'dotenv/config'


// Import tasks
import "./tasks/deploy-nft-collection";
import "./tasks/deploy-nfty-notes";
import "./tasks/deploy-oracle";
import "./tasks/deploy-token";
import "./tasks/deploy";
import "./tasks/set-node-admin";
import "./tasks/set-oracle-price";

dotEnvConfig({ path: "../.env" });

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: "USD",
    coinmarketcap: process.env.CMC_KEY,
    showTimeSpent: true,
    excludeContracts: ["contracts/test"]
   // onlyCalledMethods: false
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  // @ts-ignore
  typechain: { outDir: "../typechain-types" },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    testnet: {
      url: "https://matic-mumbai.chainstacklabs.com",
      // @ts-ignore
      accounts: [process.env.PRIVATE_KEY],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      // @ts-ignore
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3" + process.env.INFURA_API_KEY,
    },
  },
};

export default config;
