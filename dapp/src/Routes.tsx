import * as Pages from "@/pages";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pages.Base />}>
          {/* General */}
          <Route index element={<Pages.Home />} />
          <Route path="dashboard" element={<Pages.Dashboard />} />
          {/* End General */}

          {/* Borrow */}
          <Route path="borrow">
            <Route
              path="explore-collections"
              element={<Pages.ExploreCollections />}
            />
            <Route
              path="explore-collections/:address"
              element={<Pages.ExploreShops />}
            />
            <Route path="request-loan/:id" element={<Pages.RequestLoan />} />
            <Route
              path="request-loan/success"
              element={<Pages.RequestLoanSuccess />}
            />
            <Route path="dashboard" element={<Pages.BorrowingDashboard />} />
            <Route path="make-payment/:id" element={<Pages.MakePayment />} />
          </Route>
          {/* End Borrow */}

          {/* Lend */}
          <Route path="lend">
            <Route path="create-shop" element={<Pages.CreateShop />} />
            <Route
              path="create-shop/confirm"
              element={<Pages.CreateShopConfirm />}
            />
            <Route
              path="create-shop/success"
              element={<Pages.CreateShopSuccess />}
            />
            <Route path="manage-shops" element={<Pages.ManageShops />} />
            <Route path="dashboard" element={<Pages.LendingDashboard />} />
          </Route>
          {/* End Lend */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
