import "@nomicfoundation/hardhat-toolbox";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";
import "dotenv/config";
// import "@nomicfoundation/hardhat-foundry";

// Import tasks
import "./tasks/deploy-nft-collection";
import "./tasks/deploy-magnify-erc721";
import "./tasks/deploy-token";
import "./tasks/deploy";

dotEnvConfig({ path: "../.env" });

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    coinmarketcap: process.env.CMC_KEY,
    showTimeSpent: true,
    excludeContracts: ["contracts/test"],
    onlyCalledMethods: false,
  },
  solidity: {
    version: "0.8.22",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000000,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    baseSepolia: {
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY]
    }
  },
};

export default config;
