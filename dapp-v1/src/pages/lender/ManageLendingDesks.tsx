import { fromWei } from "@/helpers/utils";
import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { useAccount } from "wagmi";
import { ManageLendingDesksDocument } from "../../../.graphclient";

export const ManageLendingDesks = (props: any) => {
  // GraphQL
  const { address } = useAccount();
  const [result] = useQuery({
    query: ManageLendingDesksDocument,
    variables: {
      walletAddress: address?.toLowerCase() || "",
    },
  });

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="d-flex align-items-center">
        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
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
            >
              Active Desks
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-inactive-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-inactive"
              type="button"
              role="tab"
              aria-controls="pills-inactive"
              aria-selected="false"
            >
              Inactive Desks
            </button>
          </li>
        </ul>
        <NavLink
          to="/create-desk"
          className="btn btn-primary py-2 px-3 rounded-pill ms-auto"
          role="button"
          aria-label="Create"
        >
          <i className="fa-solid fa-plus d-sm-none"></i>
          <span className="d-none d-sm-inline">Create Lending Desk</span>
        </NavLink>
      </div>

      <div className="tab-content" id="pills-tabContent">
        {/* Active Row */}
        <div
          className="tab-pane fade show active"
          id="pills-active"
          role="tabpanel"
          aria-labelledby="pills-active-tab"
        >
          <LendingDeskRow desks={result.data?.lendingDesks || []} status="Active" />
        </div>
        {/* End Active Row */}

        {/* Inactive Row */}
        <div
          className="tab-pane fade"
          id="pills-inactive"
          role="tabpanel"
          aria-labelledby="pills-inactive-tab"
        >
          <LendingDeskRow desks={result.data?.lendingDesks || []} status="Frozen" />
        </div>
        {/* End Inactive Row */}
      </div>
    </div>
  );
};

const LendingDeskRow = ({ desks, status }) => {
  // Filter by status and handle empty state
  desks = desks.filter((desk) => desk.status === status);
  if (desks.length === 0) {
    return (
      <div className="specific-w-400 mw-100 mx-auto mt-5 pt-3">
        <img
          src="theme/images/Vector.png"
          alt="Not Found Robot"
          className="img-fluid d-block mx-auto specific-w-150 mw-100"
        />
        <div className="h3 text-center mt-5">Nothing found</div>
        <p className="text-body-secondary text-center mt-3">
          {`Don’t know where to start? `}
          <NavLink to="/create-desk">Create a Lending Desk</NavLink>
        </p>
      </div>
    );
  }

  // OK
  return desks.map((desk) => {
    console.log(desk);
    return (
      <div className="card border-0 shadow rounded-4 my-4" key={desk.id}>
        <div className="card-body p-4">
          <h5 className="fw-medium text-primary-emphasis">Lending Desk {desk.id}</h5>
          <div className="container-fluid g-0 mt-4">
            <div className="row g-4">
              <div className="col-xl-3">
                <h6 className="fw-medium text-body-secondary">Currency Type</h6>
                <div className="d-flex align-items-center text-body-secondary">
                  <div className="text-truncate">{desk.erc20.symbol}</div>
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">Collections</h6>
                <p className="m-0">{desk.loanConfigs.length}</p>
                <br />
                <h6 className="fw-medium text-body-secondary">Available Liquidity</h6>
                <div className="text-body-secondary">
                  {fromWei(desk.balance, desk?.erc20?.decimals)} {desk?.erc20?.symbol}
                </div>
                <hr className="d-xl-none" />
              </div>
              <div className="col-xl-3">
                <h6 className="fw-medium text-body-secondary">Total Loans</h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>{desk.loansCount}</strong>
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">Defaulted Loans</h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>{desk.loansDefaultedCount}</strong>
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">Completed Loans</h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>{desk.loansResolvedCount}</strong>
                </div>
                <hr className="d-xl-none" />
              </div>
              <div className="col-xl-3">
                <h6 className="fw-medium text-body-secondary">Net Liquidity Issued</h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>
                    {fromWei(desk.netLiquidityIssued, desk?.erc20?.decimals)}{" "}
                  </strong>
                  {desk.erc20.symbol}
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">Net Profit/Revenue</h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>{fromWei(desk.netProfit, desk?.erc20?.decimals)} </strong>{" "}
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
                  Edit <i className="fa-regular fa-pencil"></i>
                </NavLink>
              </div>
            </div>
          </div>
          <div className="col-lg-4 d-flex align-items-center"></div>
        </div>
      </div>
    );
  });
};
