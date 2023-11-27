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
      walletAddress: address,
    },
  });

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="d-flex align-items-center">
        <ul className="nav nav-pills" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <a
              className="btn btn-secondary bg-primary-subtle border-0 px-4 py-2 me-2 active"
              id="pills-home-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-home"
              type="button"
              role="tab"
              aria-controls="pills-home"
              aria-selected="true"
            >
              Active Desks
            </a>
          </li>
          <li className="nav-item" role="presentation">
            <a
              className=" btn focus-ring px-4 py-2 me-2"
              id="pills-profile-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-profile"
              type="button"
              role="tab"
              aria-controls="pills-profile"
              aria-selected="false"
            >
              <span className="fw-normal text-body-secondary">
                Inactive Desks
              </span>
            </a>
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
          className=" tab-pane fade show active"
          id="pills-home"
          role="tabpanel"
          aria-labelledby="pills-home-tab"
        >
          <LendingDeskRow
            desks={result.data?.lendingDesks || []}
            status="Active"
          />
        </div>
        {/* End Active Row */}

        {/* Inactive Row */}
        <div
          className="col-md-8 tab-pane fade"
          id="pills-profile"
          role="tabpanel"
          aria-labelledby="pills-profile-tab"
        >
          <LendingDeskRow
            desks={result.data?.lendingDesks || []}
            status="Frozen"
          />
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
      <img
        height="200"
        src="/theme/images/thinking_guy.svg"
        alt="No items found"
      />
    );
  }

  // OK
  return desks.map((desk) => {
    return (
      <div className="card border-0 shadow rounded-4 my-4" key={desk.id}>
        <div className="card-body p-4">
          <h5 className="fw-medium text-primary-emphasis">
            Lending Desk {desk.id}
          </h5>
          <div className="container-fluid g-0 mt-4">
            <div className="row g-4">
              <div className="col-xl-3">
                <h6 className="fw-medium text-body-secondary">Currency Type</h6>
                <div className="d-flex align-items-center text-body-secondary">
                  <img
                    src={"/theme/images/image-13.png"} //TODO display respective currency image
                    height="24"
                    className="d-block rounded-circle flex-shrink-0 me-2"
                    alt="Image"
                  />
                  <div className="text-truncate">{desk.erc20.symbol}</div>
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">Collections</h6>
                <div className="d-flex align-items-center text-body-secondary">
                  {/* <img
                    src="/theme/images/image-4.png" //TODO display respective collections images
                    height="24"
                    className="d-block rounded-circle flex-shrink-0 me-2"
                    alt="Image"
                  /> */}
                </div>
                <p className="m-0">{desk.loanConfigs.length}</p>

                <br />
                <h6 className="fw-medium text-body-secondary">
                  Available Liquidity
                </h6>
                {/* TODO display desk.balance in below format */}
                <div className="text-body-secondary">{desk.balance} ETH</div>
                <hr className="d-xl-none" />
              </div>
              <div className="col-xl-3">
                <h6 className="fw-medium text-body-secondary">Active Loans</h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>
                    {
                      desk.loans.filter((loan) => loan.status == "Active")
                        .length
                    }
                  </strong>
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">
                  Defaulted Loans
                </h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>
                    {
                      desk.loans.filter((loan) => loan.status == "Defaulted")
                        .length
                    }
                  </strong>
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">
                  Completed Loans
                </h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>
                    {
                      desk.loans.filter((loan) => loan.status == "Resolved")
                        .length
                    }
                  </strong>
                </div>
                <hr className="d-xl-none" />
              </div>
              {/* TODO replace hardcoded values */}
              <div className="col-xl-3">
                <h6 className="fw-medium text-body-secondary">
                  Net Liquidity Issued
                </h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>2500</strong> ETH
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">
                  Net Profit/Revenue
                </h6>
                <div className="text-body-secondary" style={{ height: "24px" }}>
                  <strong>500</strong> ETH
                </div>
                <br />
                <h6 className="fw-medium text-body-secondary">Desk Score</h6>
                <div className="text-body-secondary lh-sm d-flex align-items-start">
                  <i
                    className="fa-solid fa-info-circle me-2"
                    style={{ color: "orange" }}
                  ></i>
                  <small>One or more of your parameters is out of range</small>
                </div>
                <hr className="d-xl-none" />
              </div>
              <div className="col-xl-3 d-flex flex-column ps-xl-4 ps-xxl-5">
                <NavLink
                  to={`/manage-desks/${desk.id}`}
                  className="btn btn-lg py-2 px-3 focus-ring bg-primary-subtle rounded-pill text-primary-emphasis d-flex align-items-center justify-content-between text-start d-block w-100"
                >
                  Edit <i className="fa-regular fa-pencil"></i>
                </NavLink>
                <a
                  href="#"
                  className="btn btn-lg py-2 px-3 focus-ring bg-primary-subtle rounded-pill text-primary-emphasis d-flex align-items-center justify-content-between text-start d-block w-100 mt-3"
                >
                  Deposit <i className="fa-regular fa-arrow-down-to-line"></i>
                </a>
                <a
                  href="#"
                  className="btn btn-lg py-2 px-3 focus-ring bg-primary-subtle rounded-pill text-primary-emphasis d-flex align-items-center justify-content-between text-start d-block w-100 mt-3"
                >
                  Withdraw <i className="fa-regular fa-arrow-up-to-line"></i>
                </a>
                <a
                  href="#"
                  className="btn btn-lg py-2 px-3 focus-ring bg-primary-subtle rounded-pill text-primary-emphasis d-flex align-items-center justify-content-between text-start d-block w-100 mt-3"
                >
                  Freeze <i className="fa-regular fa-snowflake"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-4 d-flex align-items-center"></div>
        </div>
      </div>
    );
  });
};
