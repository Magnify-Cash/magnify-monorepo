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
  11155111: {
    ethName: "Sepolia Ether",
    chainId: 11155111,
    ethFaucetUrl: "https://sepoliafaucet.com",
    blockscanUrl: "https://sepolia.etherscan.io",
    contracts: {
      tokens: [
        {
          name: "USD Coin",
          address: "0x4ddAAC5Fe361d47D90cB8A44C62a23534D50277C",
          symbol: "USDC",
          mintAmount: 100,
        },
        {
          name: "Dai Stablecoin",
          address: "0xB9db76EC97a0dE506fb588D539394db06b2c974B",
          symbol: "DAI",
          mintAmount: 100,
        },
      ],
      nftCollections: [
        {
          name: "Doodles",
          address: "0x627021E82e6a1737659D37516637E4fbf9a27f19",
          symbol: "DOODLE",
          mintAmount: 10,
        },
        {
          name: "PolygonPunks",
          address: "0xC040eBCc5aEC07338c469F8C5367a561Ba34aD89",
          symbol: "ρ",
          mintAmount: 10,
        },
      ],
    },
  },
  31337: {
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
  84532: {
    ethName: "Base Sepolia",
    chainId: 84532,
    ethFaucetUrl: "https://faucet.quicknode.com/base/sepolia",
    blockscanUrl: "https://sepolia.basescan.org",
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

export const config = allConfigs;
