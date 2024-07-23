import { LoanRow } from "@/components";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useQuery } from "urql";
import { useAccount, useChainId } from "wagmi";
import { BorrowerDashboardDocument } from "../../../.graphclient";
import PaginatedList from "@/components/LoadMore";

const renderBorrowerDashboard = ({
  items,
  loading,
  error,
  loadMore,
  hasNextPage,
  props,
}) => {
  return (
    <>
      {items.length > 0 && (
         <LoanRow {...{ loans: items, ...props }} />
      )}
      {loading && <LoadingIndicator />}
      {error && <p>Error: {error.message}</p>}
      {hasNextPage && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="btn btn-primary"
        >
          Load More
        </button>
      )}
    </>
  );
};
export const Dashboard = (props: any) => {
  /*
  Wagmi Hooks
  */
  const chainId = useChainId();
  // GraphQL
  const { address } = useAccount();


  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="d-flex align-items-center">
        <ul
          className="nav nav-pills nav-fill mb-3"
          id="pills-tab"
          role="tablist"
        >
          <li className="nav-item mx-2" role="presentation">
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
          <li className="nav-item mx-2" role="presentation">
            <button
              className="nav-link btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-pending-default-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-pending-default"
              type="button"
              role="tab"
              aria-controls="pills-pending-default"
              aria-selected="true"
            >
              Pending Default
            </button>
          </li>
          <li className="nav-item mx-2" role="presentation">
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
          <li className="nav-item mx-2" role="presentation">
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
              Resolved Loans
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
            <PaginatedList
              query={BorrowerDashboardDocument}
              variables={{
                walletAddress: address?.toLowerCase() || "",
              }}
              dataKey="loans"
              manualRefetch={true}
              props={{ status: "Active", payback: true }}
            >
              {renderBorrowerDashboard}
            </PaginatedList>
          </div>
        </div>
        {/* End Active Row */}

        {/* Pending Default Row */}
        <div
          className="tab-pane fade"
          id="pills-pending-default"
          role="tabpanel"
          aria-labelledby="pills-active-tab"
        >
          <div className="row g-4 justify-content-start mt-0">
            <PaginatedList
              query={BorrowerDashboardDocument}
              variables={{
                walletAddress: address?.toLowerCase() || "",
              }}
              dataKey="loans"
              manualRefetch={true}
              props={{ status: "PendingDefault" }}
            >
              {renderBorrowerDashboard}
            </PaginatedList>
          </div>
        </div>
        {/* End Pending Default Row */}

        {/* completed Row */}
        <div
          className="tab-pane fade"
          id="pills-completed"
          role="tabpanel"
          aria-labelledby="pills-completed-tab"
        >
          <div className="row g-4 justify-content-start mt-0">
            <PaginatedList
              query={BorrowerDashboardDocument}
              variables={{
                walletAddress: address?.toLowerCase() || "",
              }}
              dataKey="loans"
              manualRefetch={true}
              props={{ status: "Resolved" }}
            >
              {renderBorrowerDashboard}
            </PaginatedList>
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
            <PaginatedList
              query={BorrowerDashboardDocument}
              variables={{
                walletAddress: address?.toLowerCase() || "",
              }}
              dataKey="loans"
              manualRefetch={true}
              props={{ status: "Defaulted" }}
            >
              {renderBorrowerDashboard}
            </PaginatedList>
          </div>
        </div>
        {/* End defaulted Row */}
      </div>
    </div>
  );
};