import { defineConfig, Config } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

const environment = process.env.NODE_ENV || "development";

const config = async (): Promise<Config> => {
  // If we're in development, we want to use the local hardhat deployments
  if (environment == "development") {
    const response = await import("../deployments.json");
    const data = response.default;
    return {
      out: "src/wagmi-generated.ts",
      plugins: [
        hardhat({
          project: "../contracts",
          deployments: {
            NFTYFinanceV1: {
              // @ts-expect-error
              31337: data.nftyFinance.address, // Hardhat
            },
          },
        }),
        react(),
      ],
    };
  }

  // Otherwise, we want to use the deployed addresses
  return {
    out: "src/wagmi-generated.ts",
    plugins: [
      hardhat({
        project: "../contracts",
        deployments: {
          NFTYFinanceV1: {
            11155111: "0x58b9F441b5c4681e1Ab74ecdE2A01698831BF2c4", // Sepolia
          },
        },
      }),
      react(),
    ],
  };
};

export default defineConfig(config);
