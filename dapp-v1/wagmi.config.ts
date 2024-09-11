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
            8453: "0x0A7B6c88Dff89e04662023780e5c9B206c3bD136", // base mainnet
            1: "0xA5FE620E35A2f7459e8cb72bd567aBA8f294867a" // eth mainnet
          },
        },
      }),
      react(),
    ],
  };
};

export default defineConfig(config);
