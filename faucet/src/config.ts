import * as deployments from "../../deployments.json";

type Token = {
  name: string;
  address: string;
  symbol: string;
  mintAmount: number;
};

type Contracts = {
  tokens: Token[];
  nftCollections: Token[];
};

type Config = {
  ethName: string;
  ethFaucetUrl: string;
  contracts: Contracts;
  blockscanUrl: string;
  chainId: number;
};

const allConfigs: { [key: string]: Config } = {
  mumbai: {
    ethName: "Mumbai MATIC",
    chainId: 80001,
    ethFaucetUrl: "https://faucet.polygon.technology",
    blockscanUrl: "https://mumbai.polygonscan.com",
    contracts: {
      tokens: [
        {
          name: "NFTY Token",
          address: "0xe04a61312b0b3b2C9B7Fba376D144d0238Ca6b02",
          symbol: "NFTY",
          mintAmount: 100,
        },
        {
          name: "USD Coin",
          address: "0x7d1216A946af1f30efF7fF16744363CCfAdBFAc3",
          symbol: "USDC",
          mintAmount: 100,
        },
        {
          name: "Dai Stablecoin",
          address: "0x939e2b90538D8cBC344221F597976c91b39145Cd",
          symbol: "DAI",
          mintAmount: 100,
        },
      ],
      nftCollections: [
        {
          name: "Doodles",
          address: "0x5C4967dB6be9dB2cB5672488FaE1634a19636E70",
          symbol: "DOODLE",
          mintAmount: 10,
        },
        {
          name: "PolygonPunks",
          address: "0x709d7e16a75abF20c16655Fd553E4959B34636Ba",
          symbol: "ρ",
          mintAmount: 10,
        },
      ],
    },
  },
  local: {
    ethName: "Hardhat Ether",
    chainId: 31337,
    ethFaucetUrl: "https://faucet.polygon.technology",
    blockscanUrl: "https://mumbai.polygonscan.com",
    contracts: {
      tokens: [
        {
          name: "USD Coin",
          address: deployments.usdc.address,
          symbol: "USDC",
          mintAmount: 100,
        },
        {
          name: "Dai Stablecoin",
          address: deployments.dai.address,
          symbol: "DAI",
          mintAmount: 100,
        },
      ],
      nftCollections: [
        {
          name: "Doodles",
          address: deployments.doodles.address,
          symbol: "DOODLE",
          mintAmount: 10,
        },
        {
          name: "PolygonPunks",
          address: deployments.punks.address,
          symbol: "ρ",
          mintAmount: 10,
        },
      ],
    },
  },
};

export const config = allConfigs[import.meta.env.VITE_CHAIN_NAME];
