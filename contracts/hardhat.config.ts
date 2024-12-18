import "@nomicfoundation/hardhat-toolbox";
import { config as dotEnvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/types";
import "dotenv/config";
// import "@nomicfoundation/hardhat-foundry";

// Import tasks
import "./tasks/deploy-nft-collection";
import "./tasks/deploy-magnify-erc721";
import "./tasks/deploy_mainnet";
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
    onlyCalledMethods: false
  },
  solidity: {
    version: "0.8.22",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000000
      }
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY]
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIVATE_KEY]
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY]
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY]
    },
    worldchain: {
      url: "https://worldchain-mainnet.g.alchemy.com/public",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    /*
     * If the project targets multiple EVM-compatible networks that have different explorers, then it is necessary
     * to set multiple API keys.
     *
     * Note. This is not necessarily the same name that is used to define the network.
     * To see the full list of supported networks, run `$ npx hardhat verify --list-networks`. The identifiers
     * shown there are the ones that should be used as keys in the `apiKey` object.
     *
     * See the link for details:
     * https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan#multiple-api-keys-and-alternative-block-explorers.
     */
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      base: process.env.BASE_API_KEY,
      worldchain: process.env.WORLD_API_KEY
    },
    customChains: [
      {
        network: "worldchain",
        chainId: 480,
        urls: {
          apiURL: "https://api.worldscan.org/api",
          browserURL: "https://worldscan.org/"
        }
      }
    ]
  }
};

export default config;
