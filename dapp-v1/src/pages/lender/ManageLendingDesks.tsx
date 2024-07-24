import { useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import PaginatedList from "@/components/LoadMore";
import { fromWei } from "@/helpers/utils";
import { NavLink } from "react-router-dom";
import { useAccount } from "wagmi";
import { ManageLendingDesksDocument } from "../../../.graphclient";

const renderLendingDesks = ({ items, loading, error, loadMore, hasNextPage, props }) => {

  if (items.length === 0) return (
    <div className="specific-w-400 mw-100 mx-auto mt-5 pt-3">
      <img
        src="theme/images/Vector.png"
        alt="Not Found Robot"
        className="img-fluid d-block mx-auto specific-w-150 mw-100"
      />
      <div className="h3 text-center mt-5">Nothing found</div>
      <p className="text-body-secondary text-center mt-3">
        {"Don’t know where to start? "}
        <NavLink to="/create-desk">Create a Lending Desk</NavLink>
      </p>
    </div>
  );

  return (
    <div>
      {items.map((desk) => (
        <div
          className="card bg-primary-subtle border-primary-subtle rounded-4 my-4"
          key={desk.id}
        >
          <div className="card-body p-4">
            <h5 className="fw-medium text-primary-emphasis">
              Lending Desk {desk.id}
            </h5>
            <div className="container-fluid g-0 mt-4">
              <div className="row g-4">
                <div className="col-xl-3">
                  <h6 className="fw-medium text-body-secondary">
                    Currency Type
                  </h6>
                  <div className="d-flex align-items-center text-body-secondary">
                    <div className="text-truncate">{desk.erc20.symbol}</div>
                  </div>
                  <br />
                  <h6 className="fw-medium text-body-secondary">Collections</h6>
                  <p className="m-0">{desk.loanConfigs.length}</p>
                  <br />
                </div>
                <div className="col-xl-3">
                  <h6 className="fw-medium text-body-secondary">Total Loans</h6>
                  <div
                    className="text-body-secondary"
                    style={{ height: "24px" }}
                  >
                    <strong>{desk.loansCount}</strong>
                  </div>
                  <br />
                  <h6 className="fw-medium text-body-secondary">
                    Defaulted Loans
                  </h6>
                  <div
                    className="text-body-secondary"
                    style={{ height: "24px" }}
                  >
                    <strong>{desk.loansDefaultedCount}</strong>
                  </div>
                  <br />
                  <h6 className="fw-medium text-body-secondary">
                    Resolved Loans
                  </h6>
                  <div
                    className="text-body-secondary"
                    style={{ height: "24px" }}
                  >
                    <strong>{desk.loansResolvedCount}</strong>
                  </div>
                  <hr className="d-xl-none" />
                </div>
                <div className="col-xl-3">
                  <h6 className="fw-medium text-body-secondary">
                    Available Liquidity
                  </h6>
                  <div className="text-body-secondary">
                    <strong>
                      {fromWei(desk.balance, desk?.erc20?.decimals)}
                    </strong>
                    {` ${desk?.erc20?.symbol}`}
                  </div>
                  <br />
                  <h6 className="fw-medium text-body-secondary">
                    Net Liquidity Issued
                  </h6>
                  <div
                    className="text-body-secondary"
                    style={{ height: "24px" }}
                  >
                    <strong>
                      {fromWei(desk.netLiquidityIssued, desk?.erc20?.decimals)}{" "}
                    </strong>
                    {desk.erc20.symbol}
                  </div>
                  <br />
                  <h6 className="fw-medium text-body-secondary">
                    Net Profit/Revenue
                  </h6>
                  <div
                    className="text-body-secondary"
                    style={{ height: "24px" }}
                  >
                    <strong>
                      {fromWei(desk.netProfit, desk?.erc20?.decimals)}{" "}
                    </strong>{" "}
                    {desk.erc20.symbol}
                  </div>
                  <br />
                  <hr className="d-xl-none" />
                </div>
                <div className="col-xl-3 d-flex flex-column ps-xl-4 ps-xxl-5">
                  <NavLink
                    to={`/manage-desks/${desk.id}`}
                    className="btn btn-lg py-2 px-3 focus-ring bg-primary-subtle rounded-pill text-primary-emphasis d-flex align-items-center justify-content-between text-start d-block w-100"
                  >
                    Edit <i className="fa-regular fa-pencil" />
                  </NavLink>
                </div>
              </div>
            </div>
            <div className="col-lg-4 d-flex align-items-center" />
          </div>
        </div>
      ))}
      {loading && <LoadingIndicator />}
      {error && <p>Error: {error.message}</p>}
      {hasNextPage && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="btn btn-primary d-block mx-auto my-3 px-4 py-2 text-uppercase font-weight-bold"
        >
          Load More
        </button>
      )}
    </div>
  );
}

export const ManageLendingDesks = (props: any) => {
  // GraphQL
  const { address } = useAccount();
  const [status, setStatus] = useState("Active");

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <NavLink
        to="/create-desk"
        className="btn btn-primary btn-sm mb-3 py-2 px-3 rounded-pill me-auto d-sm-none"
        role="button"
        aria-label="Create"
      >
        <i className="fa-solid fa-plus" />
        <span className="d-none d-sm-inline">Create Lending Desk</span>
      </NavLink>
      <div className="d-flex align-items-center">
        <ul className="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-active-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-active"
              type="button"
              role="tab"
              aria-controls="pills-active"
              aria-selected="true"
              onClick={() => setStatus("Active")}
            >
              Active Desks
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-frozen-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-frozen"
              type="button"
              role="tab"
              aria-controls="pills-frozen"
              aria-selected="false"
              onClick={() => setStatus("Frozen")}
            >
              Frozen Desks
            </button>
          </li>
        </ul>
        <NavLink
          to="/create-desk"
          className="btn btn-primary mb-3 py-2 px-3 rounded-pill ms-auto d-none d-sm-inline"
          role="button"
          aria-label="Create"
        >
          <i className="fa-solid fa-plus d-sm-none" />
          <span className="d-none d-sm-inline">Create Lending Desk</span>
        </NavLink>
      </div>
      {(
        <div className="tab-content" id="pills-tabContent">
          {/* Active Row */}
          <div
            className="tab-pane fade show active"
            id="pills-active"
            role="tabpanel"
            aria-labelledby="pills-active-tab"
          >
          <PaginatedList
            query={ManageLendingDesksDocument}
            variables={{
              walletAddress: address?.toLowerCase() || "",
              status: status
            }}
            dataKey="lendingDesks"
          >
            {renderLendingDesks}
          </PaginatedList>
          </div>
          {/* End Active Row */}

          {/* Frozen row */}
          <div
            className="tab-pane fade"
            id="pills-frozen"
            role="tabpanel"
            aria-labelledby="pills-frozen-tab"
          >
          <PaginatedList
            query={ManageLendingDesksDocument}
            variables={{
              walletAddress: address?.toLowerCase() || "",
              status: status
            }}
            dataKey="lendingDesks"
          >
            {renderLendingDesks}
          </PaginatedList>
          </div>
          {/* End frozen row */}


        </div>
      )}
    </div>
  );
};
