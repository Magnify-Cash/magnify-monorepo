import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const walletConnectProjectId = "6f26f99d86d880b561988f69808456d3";

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: "NFTY.Finance",
    walletConnectProjectId,
    chains: [sepolia, hardhat],
  }),
);
