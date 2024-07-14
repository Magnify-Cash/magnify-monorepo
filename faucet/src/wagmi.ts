import { hardhat, baseSepolia } from "wagmi/chains";
import { createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";

const walletConnectProjectId = "6f26f99d86d880b561988f69808456d3";
const chainlist: any = [
  baseSepolia, // Note: First chain in list is default
];
if (import.meta.env.DEV) {
  chainlist.push(hardhat);
}

export const config = createConfig(
  getDefaultConfig({
    appName: "Magnify Cash Testnet Faucet",
    walletConnectProjectId,
    chains: chainlist,
  })
);
