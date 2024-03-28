import { nftyFinanceV1Address } from "../wagmi-generated";

export const NFTY_FINANCE_GOERLI_GRAPH: string =
  "https://api.studio.thegraph.com/query/44181/nftyfinance/0.0.9";
export const NFTY_FINANCE_MUMBAI_GRAPH: string =
  "https://api.studio.thegraph.com/query/44194/nftyfinance-mumbai/0.0.7";
export const NFTY_FINANCE_BASE_SEPOLIA_GRAPH: string =
  "https://api.thegraph.com/subgraphs/name/crypto-rizzo/nftyfinance-base-sepolia";
export const NFTY_FINANCE_SEPOLIA_GRAPH: string =
  "https://api.thegraph.com/subgraphs/name/crypto-rizzo/nftyfinance-sepolia";
export const NFTY_FINANCE_HARDHAT_GRAPH: string =
  "http://localhost:8000/subgraphs/name/nftyfinance-local";
export const getProtocolAddress = (chainId: any) => nftyFinanceV1Address[chainId];
export const getProtocolChain = (chainId: any) => chainId;
export const getProtocolGraphUrl = (chainId: any) => {
  switch (chainId) {
    case 5: // GOERLI
      return NFTY_FINANCE_GOERLI_GRAPH;
    case 31337:
      return NFTY_FINANCE_HARDHAT_GRAPH;
    case 80001: // MUMBAI
      return NFTY_FINANCE_MUMBAI_GRAPH;
    case 11155111:
      return NFTY_FINANCE_SEPOLIA_GRAPH;
    case 84532:
      return NFTY_FINANCE_BASE_SEPOLIA_GRAPH;
    default:
      return NFTY_FINANCE_HARDHAT_GRAPH;
  }
};
