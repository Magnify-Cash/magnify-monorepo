import * as Pages from "@/pages";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export function App() {
  return (
   <BrowserRouter>
     <Routes>
       <Route path="/" element={<Pages.Base />}>
        {/* Home */}
        <Route index element={<Pages.Home title="Keep your JPEG, unlock liquidity" />} />

        {/* Borrow */}
        <Route path="borrower-dashboard" element={<Pages.Demo title="Borrower Dashboard" />} />
        <Route path="quick-loan" element={<Pages.Demo title="Quick Loan" />} />
        <Route path="explore" element={<Pages.Demo title="Explore Colletions" />} />

        {/* Lend */}
        <Route path="lender-dashboard" element={<Pages.Demo title="Lender Dashboard" />} />
        <Route path="create-desk" element={<Pages.CreateLendingDesk title="Create Lending Desk" />} />
        <Route path="manage-desk" element={<Pages.Demo title="Manage Desk" />} />
        <Route path="manage-desks" element={<Pages.Demo title="Manage Desks" />} />

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
  )
}
