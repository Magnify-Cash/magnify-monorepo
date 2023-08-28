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
            5: "0xF4F1C3db0205d055f5A081482e0A84Ff71c42102", // Goerli
            80001: "0x348db0CDC8031901d126878bF0DF663FbB5afc1e", // Mumbai
          },
        },
      }),
      react(),
    ],
  };
};

export default defineConfig(config);
