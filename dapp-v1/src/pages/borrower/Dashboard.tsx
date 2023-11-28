import { useQuery } from "urql";
import { useAccount } from "wagmi";
import { BorrowerDashboardDocument } from "../../../.graphclient";
import { LoanRow } from "@/components";

export const Dashboard = (props: any) => {
  // GraphQL
  const { address } = useAccount();
  const [result] = useQuery({
    query: BorrowerDashboardDocument,
    variables: {
      walletAddress: address,
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
              Active Loans
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-completed-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-completed"
              type="button"
              role="tab"
              aria-controls="pills-completed"
              aria-selected="false"
            >
              Completed Loans
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-defaulted-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-defaulted"
              type="button"
              role="tab"
              aria-controls="pills-defaulted"
              aria-selected="false"
            >
              Defaulted Loans
            </button>
          </li>
        </ul>
      </div>

      <div className="tab-content" id="pills-tabContent">
        {/* active Row */}
        <div
          className="tab-pane fade show active"
          id="pills-active"
          role="tabpanel"
          aria-labelledby="pills-active-tab"
        >
          <div className="row g-4 justify-content-start mt-0">
            <LoanRow
              payback
              loans={result?.data?.loans || []}
              status="Active"
            />
          </div>
        </div>
        {/* End Active Row */}

        {/* completed Row */}
        <div
          className="tab-pane fade"
          id="pills-completed"
          role="tabpanel"
          aria-labelledby="pills-completed-tab"
        >
          <div className="row g-4 justify-content-start mt-0">
            <LoanRow loans={result?.data?.loans || []} status="Completed" />
          </div>
        </div>
        {/* End completed Row */}

        {/* defaulted Row */}
        <div
          className="tab-pane fade"
          id="pills-defaulted"
          role="tabpanel"
          aria-labelledby="pills-defaulted-tab"
        >
          <div className="row g-4 justify-content-start mt-0">
            <LoanRow loans={result?.data?.loans || []} status="Defaulted" />
          </div>
        </div>
        {/* End defaulted Row */}
      </div>
    </div>
  );
};
