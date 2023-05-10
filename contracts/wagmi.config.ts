import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";
import { react } from "@wagmi/cli/plugins";
import * as deployments from "../deployments.json";

export default defineConfig({
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
          31337: deployments.nftyLending.address, // Hardhat
          80001: "0x348db0CDC8031901d126878bF0DF663FbB5afc1e", // Mumbai
        },
      },
    }),
    react(),
  ],
});
