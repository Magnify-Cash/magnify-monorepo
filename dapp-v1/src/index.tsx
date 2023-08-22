import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import * as Pages from "@/pages";
import { config } from "./wagmi";

ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>
  <WagmiConfig config={config}>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Pages.Base />}>
    {/* Home */}
    <Route index element={<Pages.Home title="Keep your JPEG, unlock liquidity" />} />

    {/* Borrow */}
    <Route path="borrower-dashboard" element={<Pages.BorrowerManageLoans title="Borrower Dashboard" />} />
    <Route path="quick-loan" element={<Pages.QuickLoan title="Quick Loan" />} />
    <Route path="explore" element={<Pages.BrowseCollections title="Explore Collections" />} />
    <Route path="explore/:collection_address" element={<Pages.BrowseCollection  />} />

    {/* Lend */}
    <Route path="lender-dashboard" element={<Pages.LenderManageLoans title="Lender Dashboard" />} />
    <Route path="create-desk" element={<Pages.CreateLendingDesk title="Create Lending Desk" />} />
    <Route path="manage-desks" element={<Pages.ManageLendingDesks title="Manage Lending Desks" />} />
    <Route path="manage-desks/:id" element={<Pages.ManageLendingDesk />} />

    {/* Support */}
    <Route path="help" element={<Pages.Demo title="Help" />} />
    <Route path="docs" element={<Pages.Demo title="Docs" />} />
    <Route path="community" element={<Pages.Demo title="Community" />} />

    {/* Token */}
    <Route path="token" element={<Pages.Demo title="NFTY Token" />} />
    <Route path="stake" element={<Pages.Demo title="NFTY Staking" />} />

    {/* Catch All */}
    <Route path="*" element={<Navigate to="/" />} />
    </Route>
    </Routes>
    </BrowserRouter>
  </WagmiConfig>
</React.StrictMode>
);