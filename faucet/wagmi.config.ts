import { defineConfig, Config } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";

const config = async (): Promise<Config> => {
  return {
    out: "src/wagmi-generated.ts",
    plugins: [hardhat({ project: "../contracts" }), react()],
  };
};

export default defineConfig(config);
