import axios from "axios";
import * as deployments from "../../deployments.json";

export type Token = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export type NftCollection = {
  name: string;
  address: string;
  symbol: string;
  logoURI: string;
  isErc1155: boolean;
};

type Whitelists = {
  tokens: () => Promise<Token[]>;
  nftCollections: () => Promise<NftCollection[]>;
};

type Config = {
  whitelists: Whitelists;
};

const allConfigs: { [key: string]: Config } = {
  // Mainnet
  polygon: {
    whitelists: {
      tokens: async () => {
        const tokenListResponse = await axios.get(
          "https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link"
        );
        return tokenListResponse.data.tokens as Token[];
      },
      nftCollections: async () => [],
    },
  },
  mumbai: {
    whitelists: {
      tokens: async () => [
        {
          name: "NFTY Token",
          address: "0xe04a61312b0b3b2C9B7Fba376D144d0238Ca6b02",
          symbol: "NFTY",
          logoURI: "/public/images/tokens/NFTY.svg",
          decimals: 18,
        },
        {
          name: "USD Coin",
          address: "0x7d1216A946af1f30efF7fF16744363CCfAdBFAc3",
          symbol: "USDC",
          logoURI:
            "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
          decimals: 18,
        },
        {
          name: "Dai Stablecoin",
          address: "0x939e2b90538D8cBC344221F597976c91b39145Cd",
          symbol: "DAI",
          decimals: 18,
          logoURI:
            "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
        },
      ],
      nftCollections: async () => [
        {
          name: "Doodles",
          address: "0x5C4967dB6be9dB2cB5672488FaE1634a19636E70",
          symbol: "DOODLE",
          logoURI:
            "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ",
          isErc1155: false,
        },
        {
          name: "PolygonPunks",
          address: "0x709d7e16a75abF20c16655Fd553E4959B34636Ba",
          symbol: "ρ",
          logoURI:
            "https://i.seadn.io/gcs/files/498c0d117d7f1c95993804b7712721c7.png",
          isErc1155: false,
        },
      ],
    },
  },
  local: {
    whitelists: {
      tokens: async () => [
        {
          name: "NFTY Token",
          address: deployments.nftyToken.address,
          symbol: "NFTY",
          logoURI: "/public/images/tokens/NFTY.svg",
          decimals: 18,
        },
        {
          name: "USD Coin",
          address: deployments.usdc.address,
          symbol: "USDC",
          logoURI:
            "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
          decimals: 18,
        },
        {
          name: "Dai Stablecoin",
          address: deployments.dai.address,
          symbol: "DAI",
          decimals: 18,
          logoURI:
            "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
        },
      ],
      nftCollections: async () => [
        {
          name: "Doodles",
          address: deployments.doodles.address,
          symbol: "DOODLE",
          logoURI:
            "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ",
          isErc1155: false,
        },
        {
          name: "PolygonPunks",
          address: deployments.punks.address,
          symbol: "ρ",
          logoURI:
            "https://i.seadn.io/gcs/files/498c0d117d7f1c95993804b7712721c7.png",
          isErc1155: false,
        },
      ],
    },
  },
};

export const config =
  // @ts-ignore
  allConfigs[import.meta.env.VITE_CHAIN_NAME];
