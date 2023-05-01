import { WagmiConfig } from "wagmi";
import Router from "@/Routes";
import { client } from "@/wagmi";

export function App() {
  return (
    <>
      <WagmiConfig client={client}>
        <Router />
      </WagmiConfig>
    </>
  );
}
