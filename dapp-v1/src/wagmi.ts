import { getDefaultConfig } from "connectkit";
import { http, createConfig } from "wagmi";
import { base, baseSepolia, hardhat, mainnet } from "wagmi/chains";

// Chains
// Note: First chain in list is default
// We are setting chains based on .envs as well as hostname
const chainlist: any = [];
const domain = window.location.hostname;
if (domain === "app.magnify.cash") {
  chainlist.push(mainnet, base);
} else {
  chainlist.push(baseSepolia);
}
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

    //Alchemy RPC URL transports
    transports: {
      [base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${
          import.meta.env.VITE_ALCHEMY_API_KEY
        }/`,
        {
          batch: {
            batchSize: 50,
          },
        },
      ),
      [baseSepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${
          import.meta.env.VITE_ALCHEMY_API_KEY
        }/`,
        {
          batch: {
            batchSize: 50,
          },
        },
      ),
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}/`,
        {
          batch: {
            batchSize: 50,
          },
        },
      ),
    },

    // App Info
    appName: "Magnify Cash",
    appDescription: "Decentralized Credit Markets",
    appUrl: "https://magnify.cash",
    appIcon: "https://early.magnify.cash/theme/magnify-cash-logo.jpeg",
  }),
);
