import { getDefaultClient } from "connectkit";
import { configureChains, createClient } from "wagmi";
import { goerli, hardhat, polygonMumbai } from "wagmi/chains";
import { publicProvider } from "@wagmi/core/providers/public";

// chains setup
// default chains (prod)
let chainlist: any[] = [polygonMumbai];
// dev chains
if (import.meta.env.DEV) {
  chainlist.push(hardhat, goerli);
}

const { chains, webSocketProvider, provider } = configureChains(chainlist, [
  // infuraProvider({ apiKey: "b75b9bac15534b62bb3613486c493b36" }),
  publicProvider(),
]);

export const client = createClient(
  getDefaultClient({
    autoConnect: true,
    appName: "NFTY Finance",
    chains: chains,
    provider: provider,
    webSocketProvider: webSocketProvider,
  })
);
