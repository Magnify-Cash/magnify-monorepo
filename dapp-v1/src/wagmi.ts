import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { mainnet, polygon, hardhat } from "wagmi/chains";

const walletConnectProjectId = "6f26f99d86d880b561988f69808456d3";

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: "My wagmi + ConnectKit App",
    walletConnectProjectId,
    chains: [mainnet, polygon, hardhat],
    out: "../wagmi-generated.ts",
    plugins: [
      hardhat({
        commands: {
          clean: "yarn hardhat clean",
          build: "yarn hardhat compile",
          rebuild: "yarn hardhat compile",
        },
        project: "../contracts",
        deployments: {
          NFTYLending: {
            5: "0xF4F1C3db0205d055f5A081482e0A84Ff71c42102", // Goerli
            // @ts-ignore
            31337: deployments.nftyFinance.address, // Hardhat
            80001: "0x348db0CDC8031901d126878bF0DF663FbB5afc1e", // Mumbai
          },
        },
      }),
      react(),
    ],
  })
);
