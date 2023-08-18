import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";

import { App } from "./App";
import { config } from "./wagmi";

const client = new Client({
  url: "http://localhost:8000/subgraphs/name/nftyfinance-local",
  exchanges: [cacheExchange, fetchExchange],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <Provider value={client}>
        <App />
      </Provider>
    </WagmiConfig>
  </React.StrictMode>
);
