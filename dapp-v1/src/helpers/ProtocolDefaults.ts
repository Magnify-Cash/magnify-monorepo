// @ts-nocheck
import {
  NFTY_FINANCE_GOERLI_GRAPH,
  NFTY_FINANCE_MUMBAI_GRAPH,
  NFTY_FINANCE_SEPOLIA_GRAPH,
  NFTY_FINANCE_BASE_SEPOLIA_GRAPH,
  NFTY_FINANCE_HARDHAT_GRAPH

} from "@/helpers/constants";
import { nftyFinanceV1Address } from "../wagmi-generated";

export const getProtocolAddress = (chainId: any) =>
  nftyLendingAddress[chainId];

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
