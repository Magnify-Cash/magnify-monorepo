import { getDefaultClient } from "connectkit";
import { hardhat, polygonMumbai } from "wagmi/chains";
import { createClient, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "@wagmi/core/providers/public";

const { chains, provider } = configureChains(
  [polygonMumbai, hardhat],
  [
    alchemyProvider({ apiKey: "GF9pxL1Y-2UnYKvXFBhAiRyePbd98OQ7" }),
    publicProvider(),
  ]
);

export const client = createClient(
  getDefaultClient({
    autoConnect: true,
    appName: "NFTY Finance Testnet Faucet",
    chains,
    provider,
  })
);
