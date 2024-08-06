import { defineConfig, Config } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

const config = async (): Promise<Config> => {
  const response = await import("../deployments.json");
  const data = response.default;
  const hardhatAddress = data.magnifyCash.address as `0x${string}`
  return {
    out: "src/wagmi-generated.ts",
    plugins: [
      hardhat({
        project: "../contracts",
        deployments: {
          MagnifyCashV1: {
            31337: hardhatAddress, // hardhat
            11155111: "0x58b9F441b5c4681e1Ab74ecdE2A01698831BF2c4", // sepolia
            84532: "0x9d77E621be4aF95A83c4334e7B51e4440dC2Ed0f", // base sepolia
            1: "0x00" // eth mainnet
          },
        },
      }),
      react(),
    ],
  };
};

export default defineConfig(config);
