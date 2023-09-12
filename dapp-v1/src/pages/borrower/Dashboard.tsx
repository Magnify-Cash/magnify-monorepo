import { useQuery } from "urql";
import { useAccount } from "wagmi";
import { BorrowerDashboardDocument } from "../../../.graphclient";
import { LoanCard } from "@/components";

export const Dashboard = (props: any) => {
  // GraphQL
  const { address } = useAccount();
  const [result] = useQuery({
    query: BorrowerDashboardDocument,
    variables: {
      walletAddress: address,
    },
  });

  console.log(result?.data?.loans)

  return (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      <div className="d-lg-flex align-items-center">
        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
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
              className="nav-link"
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
              className="nav-link"
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
          <div className="row g-4 g-xl-5">
            {result?.data?.loans
            .filter(loan => loan.status === 'Active')
            .map(loan => (
              <LoanCard payback loanInfo={loan} />
            ))}
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
          <div className="row g-4 g-xl-5">
            {result?.data?.loans
            .filter(loan => loan.status === 'Resolved')
            .map(loan => (
              <LoanCard loanInfo={loan} />
            ))}
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
          <div className="row g-4 g-xl-5">
            {result?.data?.loans
            .filter(loan => loan.status === 'Resolved')
            .map(loan => (
              <LoanCard loanInfo={loan} />
            ))}
          </div>
        </div>
        {/* End defaulted Row */}
      </div>
    </div>
  );
};
