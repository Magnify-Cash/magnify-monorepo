import { defineConfig, Config } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";

const environment = process.env.NODE_ENV || "development";

const config = async (): Promise<Config> => {
  if (environment == "development") {
    const response = await import("../deployments.json");
    const data = response.default;
    return {
      out: "wagmi-generated.ts",
      plugins: [
        hardhat({
          project: "../contracts",
          deployments: {
            NFTYFinance: {
              // @ts-expect-error
              31337: data.nftyFinance.address, // Hardhat
            },
          },
        }),
      ],
    };
  }

  return {
    out: "wagmi-generated.ts",
    plugins: [
      hardhat({
        project: "../contracts",
        deployments: {
          NFTYFinance: {
            5: "0xF4F1C3db0205d055f5A081482e0A84Ff71c42102", // Goerli
            80001: "0x348db0CDC8031901d126878bF0DF663FbB5afc1e", // Mumbai
          },
        },
      }),
    ],
  };
};

export default defineConfig(config);
