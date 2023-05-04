import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";
import { react } from "@wagmi/cli/plugins";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  out: "src/wagmi/generated.ts",
  plugins: [
    hardhat({
      commands: {
        clean: "yarn hardhat clean",
        build: "yarn hardhat compile",
        rebuild: "yarn hardhat compile",
      },
      project: "../nftyfinance-contracts-v2",
      deployments: {
        NFTYLending: {
          5: "0xF4F1C3db0205d055f5A081482e0A84Ff71c42102", // Goerli
          // @ts-ignore
          31337: process.env.LOCAL_NFTYLENDING_ADDRESS, // Hardhat
          80001: "0x348db0CDC8031901d126878bF0DF663FbB5afc1e", // Mumbai
        },
      },
    }),
    react(),
  ],
});
