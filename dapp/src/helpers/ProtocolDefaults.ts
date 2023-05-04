// @ts-nocheck
import {
  NFTY_FINANCE_DEFAULT_CHAIN,
  NFTY_FINANCE_DEFAULT_GRAPH,
  NFTY_FINANCE_GOERLI_GRAPH,
  NFTY_FINANCE_MUMBAI_GRAPH,
} from "@/constants";
import { nftyLendingAddress } from "@/wagmi/generated";

export const getProtocolAddress = (chainId: any) =>
  nftyLendingAddress[chainId ?? NFTY_FINANCE_DEFAULT_CHAIN];

export const getProtocolChain = (chainId: any) =>
  chainId || NFTY_FINANCE_DEFAULT_CHAIN;

export const getProtocolGraphUrl = (chainId: any) => {
  switch (chainId) {
    case 5: // GOERLI
      return NFTY_FINANCE_GOERLI_GRAPH;
    case 80001: // MUMBAI
      return NFTY_FINANCE_MUMBAI_GRAPH;
    default:
      return NFTY_FINANCE_DEFAULT_GRAPH;
  }
};
