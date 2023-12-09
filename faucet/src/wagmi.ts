import { hardhat, sepolia } from "wagmi/chains";
import { createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";

const walletConnectProjectId = "6f26f99d86d880b561988f69808456d3";

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: "NFTY.Finance Testnet Faucet",
    walletConnectProjectId,
    chains: [sepolia, hardhat],
  })
);
