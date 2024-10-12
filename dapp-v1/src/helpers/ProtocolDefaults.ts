import { magnifyCashV1Address } from "../wagmi-generated";

export const MAGNIFY_CASH_MAINNET_GRAPH: string =
  "https://api.ghostlogs.xyz/gg/pub/580feb28-c6e6-49f2-8918-f6cf8b0ef310/ghostgraph";
export const MAGNIFY_CASH_GOERLI_GRAPH: string =
  "https://api.studio.thegraph.com/query/44181/nftyfinance/0.0.9";
export const MAGNIFY_CASH_MUMBAI_GRAPH: string =
  "https://api.studio.thegraph.com/query/44194/nftyfinance-mumbai/0.0.7";
export const MAGNIFY_CASH_BASE_SEPOLIA_GRAPH: string =
  "https://api.ghostlogs.xyz/gg/pub/d94bdadc-4cf4-44a1-9888-c8be5ab887fc/ghostgraph";
export const MAGNIFY_CASH_BASE_MAINNET_GRAPH: string =
  "https://api.ghostlogs.xyz/gg/pub/c7560c1c-c263-4cb5-bab6-2620a0562713/ghostgraph";
export const MAGNIFY_CASH_SEPOLIA_GRAPH: string =
  "https://api.thegraph.com/subgraphs/name/crypto-rizzo/nftyfinance-sepolia";
export const MAGNIFY_CASH_HARDHAT_GRAPH: string =
  "http://localhost:8000/subgraphs/name/magnify-local";
export const getProtocolAddress = (chainId: any) => magnifyCashV1Address[chainId];
export const getProtocolChain = (chainId: any) => chainId;
export const getProtocolGraphUrl = (chainId: any) => {
  switch (chainId) {
    case 1:
      return MAGNIFY_CASH_MAINNET_GRAPH;
    case 5: // GOERLI
      return MAGNIFY_CASH_GOERLI_GRAPH;
    case 31337:
      return MAGNIFY_CASH_HARDHAT_GRAPH;
    case 80001: // MUMBAI
      return MAGNIFY_CASH_MUMBAI_GRAPH;
    case 11155111:
      return MAGNIFY_CASH_SEPOLIA_GRAPH;
    case 84532:
      return MAGNIFY_CASH_BASE_SEPOLIA_GRAPH;
    case 8453:
      return MAGNIFY_CASH_BASE_MAINNET_GRAPH;
    default:
      return "";
  }
};

const nftListUrlsMap = {
  1: [
    "https://raw.githubusercontent.com/magnify-cash/nft-lists/master/test/schema/bigexample.nftlist.json",
  ],
  8453: [],
  84532: import.meta.env.DEV
    ? ["http://localhost:5173/tokenlists/nftsBaseSepolia.json"]
    : ["https://early.magnify.cash/tokenlists/nftsBaseSepolia.json"],
  31337: ["http://localhost:5173/tokenlists/nfts.json"],
};

const tokenListUrlsMap = {
  1: ["https://tokens.coingecko.com/ethereum/all.json"],
  8453: ["https://tokens.coingecko.com/base/all.json"],
  84532: import.meta.env.DEV
    ? ["http://localhost:5173/tokenlists/tokensBaseSepolia.json"]
    : ["https://early.magnify.cash/tokenlists/tokensBaseSepolia.json"],
  31337: ["http://localhost:5173/tokenlists/tokens.json"],
};

export function getTokenListUrls(
  chainId: number,
  isNft: boolean | undefined,
  isToken: boolean | undefined,
): string[] | undefined {
  if (isNft) {
    return nftListUrlsMap[chainId];
  }
  if (isToken) {
    return tokenListUrlsMap[chainId];
  }
}

export const getBlockExplorerURL = (chainId: number) => {
  // Add the base url for the block explorer for different networks
  let baseUrl = "";

  switch (chainId) {
    case 11155111:
      baseUrl = "https://sepolia.etherscan.io";
      break;
    case 8453:
      baseUrl = "https://basescan.org";
      break;
    case 84532:
      baseUrl = "https://sepolia.basescan.org";
      break;
    case 1:
      baseUrl = "https://etherscan.io";
      break;
    default:
      baseUrl = "https://etherscan.io";
      break;
  }
  return baseUrl;
};
