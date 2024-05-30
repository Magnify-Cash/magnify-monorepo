import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { base, baseSepolia, hardhat } from "wagmi/chains";

// Chains
const chainlist: any = [
  baseSepolia, // Note: First chain in list is default
  base,
];
if (import.meta.env.DEV) {
  chainlist.push(hardhat);
}

// Wagmi + ConnectKit Configuration
export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: chainlist,

    // Required API Keys
    walletConnectProjectId: "6f26f99d86d880b561988f69808456d3",

    // App Info
    appName: "Magnify.Cash",
    appDescription: "Decentralized Credit Markets",
    appUrl: "https://magnify.cash",
    appIcon: "https://early.magnify.cash/theme/magnify-cash-logo.jpeg",
  }),
);
