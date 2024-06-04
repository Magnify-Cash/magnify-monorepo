import { LoanRow } from "@/components";
import LoadingIndicator from "@/components/LoadingIndicator";
import fetchNFTDetails, { type INft } from "@/helpers/FetchNfts";
import { fromWei } from "@/helpers/utils";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { useAccount, useChainId } from "wagmi";
import { LenderDashboardDocument, type LendingDesk } from "../../../.graphclient";

export const Dashboard = (props: any) => {
  // GraphQL
  const { address } = useAccount();
  const [result] = useQuery({
    query: LenderDashboardDocument,
    variables: {
      walletAddress: address?.toLowerCase() || "",
    },
  });

  const { data, fetching, error } = result;

  //This state variable, 'nftTwoDimArr', holds a two dimensional array representing NFTs.
  //The outer array corresponds to different lending desks,
  //while the inner arrays contain NFT IDs associated with each respective desk.
  const [nftTwoDimArr, setNftTwoDimArr] = useState<INft[][]>([]);

  useEffect(() => {
    // This function will be executed whenever the query data changes
    if (!fetching) getNFTs();
  }, [data]);

  //This is used to lookup a list of nfts off chain
  const chainId = useChainId();
  const getNFTs = async () => {
    //A two dimensional array of nft ids
    const nftIdArr = data?.lendingDesks.map((desk) =>
      desk.loanConfigs.map((loan) => loan.nftCollection.id),
    );

    if (nftIdArr?.length) {
      const fetchedNftArrPromise = Promise.all(
        nftIdArr.map((arr) => fetchNFTDetails(arr, chainId)),
      );

      fetchedNftArrPromise
        .then((result) => {
          // Assuming 'result' is an array of fetched NFT details
          setNftTwoDimArr(result);
        })
        .catch((error) => {
          // Handle error if any of the promises fail
          console.error("Error fetching NFT details:", error);
        });
    }
  };

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
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
            >
              Active Loans
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link btn focus-ring px-4 py-2 me-2 fw-normal"
              id="pills-pending-default-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-pending-default"
              type="button"
              role="tab"
              aria-controls="pills-pending-default"
              aria-selected="false"
            >
              Pending Default
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
              Resolved Loans
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
      {fetching && <LoadingIndicator />}
      {data && (
        <div className="tab-content" id="pills-tabContent">
          {/* Active Row */}
          <div
            className="tab-pane fade show active"
            id="pills-active"
            role="tabpanel"
            aria-labelledby="pills-active-tab"
          >
            <div className="row g-4 mt-n2 mb-4">
              <div className="col-xl-12">
                <LoanCardParent
                  desks={result?.data?.lendingDesks || []}
                  nfts={nftTwoDimArr}
                  status="Active"
                />
              </div>
            </div>
          </div>
          {/* End Active Row */}

          {/* Pending Default Row */}
          <div
            className="tab-pane fade"
            id="pills-pending-default"
            role="tabpanel"
            aria-labelledby="pills-pending-default-tab"
          >
            <div className="row g-4 mt-n2 mb-4">
              <div className="col-xl-12">
                <LoanCardParent
                  desks={result?.data?.lendingDesks || []}
                  nfts={nftTwoDimArr}
                  status="PendingDefault"
                  liquidate
                />
              </div>
            </div>
          </div>
          {/* End Pending Default Row */}

          {/* Defaulted Row */}
          <div
            className="tab-pane fade"
            id="pills-defaulted"
            role="tabpanel"
            aria-labelledby="pills-defaulted-tab"
          >
            <div className="row g-4 mt-n2 mb-4">
              <div className="col-xl-12">
                <LoanCardParent
                  desks={result?.data?.lendingDesks || []}
                  nfts={nftTwoDimArr}
                  status="Defaulted"
                />
              </div>
            </div>
          </div>
          {/* End Defaulted Row */}

          {/* Resolved Row */}
          <div
            className="tab-pane fade"
            id="pills-completed"
            role="tabpanel"
            aria-labelledby="pills-completed-tab"
          >
            <div className="row g-4 mt-n2 mb-4">
              <div className="col-xl-12">
                <LoanCardParent
                  desks={result?.data?.lendingDesks || []}
                  nfts={nftTwoDimArr}
                  status="Resolved"
                />
              </div>
            </div>
          </div>
          {/* End Resolved Row */}
        </div>
      )}
    </div>
  );
};

const LoanCardParent = (props) => {
  // setup desks data
  if (props.desks.length === 0) {
    return (
      <div className="specific-w-400 mw-100 mx-auto mt-5">
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
  }

  // OK
  return props.desks.map((desk: LendingDesk, i) => {
    return (
      <div key={desk.id}>
        <div className="d-flex align-items-center specific-h-25">
          <h5 className="fw-medium text-body-secondary m-0">Lending Desk {desk.id}</h5>
          <div
            className="position-relative ms-3"
            style={{ width: "48px", height: "24px" }}
          >
            {desk.loanConfigs?.map((config, j) => (
              <img
                key={config.id}
                src={props.nfts?.[i]?.[j]?.logoURI}
                height="24"
                className={`d-block rounded-circle position-absolute top-0 start-0 z-${
                  desk.loanConfigs?.length - j
                }`}
                alt={props.nfts?.[i]?.[j]?.symbol}
                style={{ marginLeft: `${12 * j}px` }}
              />
            ))}
          </div>
        </div>
        <div className="card border-0 shadow rounded-4 mt-3">
          <div className="card-body p-4">
            <div className="row g-3 justify-content-center">
              <div className="col-sm-6">
                <div className="d-flex align-items-center">
                  <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                    <i className="fa-solid fa-user h4 m-0" />
                  </div>
                  <div className="ps-3">
                    <h3 className="m-0">
                      {desk.loans.filter((loan) => loan.status === props.status).length}
                    </h3>
                    <p className="m-0 text-body-secondary">Loans</p>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="d-flex align-items-center">
                  <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-info-subtle text-info-emphasis rounded-circle flex-shrink-0">
                    <i className="fa-solid fa-coins h4 m-0" />
                  </div>
                  <div className="ps-3">
                    <h3 className="m-0">{desk.erc20.symbol}</h3>
                    <p className="m-0 text-body-secondary">Currency</p>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="d-flex align-items-center">
                  <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-warning-subtle text-warning-emphasis rounded-circle flex-shrink-0">
                    <i className="fa-solid fa-circle-minus h4 m-0" />
                  </div>
                  <div className="ps-3">
                    <h3 className="m-0">
                      {"0 "}
                      <small className="fw-normal">{desk.erc20.symbol}</small>
                    </h3>
                    <p className="m-0 text-body-secondary">Borrowed</p>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="d-flex align-items-center">
                  <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-success-subtle text-success-emphasis rounded-circle flex-shrink-0">
                    <i className="fa-solid fa-sack-dollar h4 m-0" />
                  </div>
                  <div className="ps-3">
                    <h3 className="m-0">
                      {fromWei(desk.balance, desk.erc20.decimals)}{" "}
                      <small className="fw-normal">{desk.erc20.symbol}</small>
                    </h3>
                    <p className="m-0 text-body-secondary">Total Balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4 justify-content-start mt-0">
          <LoanRow
            loans={desk.loans}
            status={props.status}
            liquidate={props?.liquidate}
          />
        </div>
      </div>
    );
  });
};

/*
const LoanOverview = (props) => {
  // checking if there are any lending desks
  if (props.desks.length === 0) {
    return <div></div>;
  }
  return (
    <div className="col-xl-4">
      <div
        className="card border-0 shadow rounded-4"
        style={{ marginTop: "41px" }}
      >
        <div className="card-body p-4">
          <h6 className="fw-medium text-body-secondary">Loan Overview</h6>
          <div className="container-fluid g-0">
            <div className="row g-2 mt-2">
              <div className="col">
                <div className="p-2 rounded-3 bg-primary-subtle text-center">
                  <div className="text-primary-emphasis h3 mb-3">
                    <i className="fa-light fa-user-circle"></i>
                  </div>
                  <div className="h4 text-primary-emphasis">60</div>
                  <div className="lh-sm">
                    <small className="fw-normal">
                      net loans
                      <br />
                      issued
                    </small>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="p-2 rounded-3 bg-success-subtle text-center">
                  <div className="text-success-emphasis h3 mb-3">
                    <i className="fa-light fa-check-circle"></i>
                  </div>
                  <div className="h4 text-success-emphasis">40</div>
                  <div className="lh-sm">
                    <small className="fw-normal">
                      net loans
                      <br />
                      paid back
                    </small>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="p-2 rounded-3 bg-info-subtle text-center">
                  <div className="text-info-emphasis h3 mb-3">
                    <i className="fa-light fa-times-circle"></i>
                  </div>
                  <div className="h4 text-info-emphasis">10</div>
                  <div className="lh-sm">
                    <small className="fw-normal">
                      net loans
                      <br />
                      defaulted
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow rounded-4 mt-4">
        <div className="card-body p-4">
          <h6 className="fw-medium text-body-secondary">
            Recent Loan Activity
          </h6>
          <div className="mt-2 py-2 d-flex align-items-center border-bottom">
            <span className="d-inline-block text-truncate text-body-secondary me-2">
              0x049....6584sf
            </span>
            <span className="h4 ms-auto my-0 text-success-emphasis">
              $35{" "}
              <small
                className="text-body-secondary fw-normal"
                style={{ fontSize: "14px" }}
              >
                USDC
              </small>
            </span>
          </div>
          <div className="mt-2 py-2 d-flex align-items-center border-bottom">
            <span className="d-inline-block text-truncate text-body-secondary me-2">
              0x049....6584sf
            </span>
            <span className="h4 ms-auto my-0 text-success-emphasis">
              $600{" "}
              <small
                className="text-body-secondary fw-normal"
                style={{ fontSize: "14px" }}
              >
                USDC
              </small>
            </span>
          </div>
          <div className="mt-2 py-2 d-flex align-items-center border-bottom">
            <span className="d-inline-block text-truncate text-body-secondary me-2">
              0x049....6584sf
            </span>
            <span className="h4 ms-auto my-0 text-success-emphasis">
              $10{" "}
              <small
                className="text-body-secondary fw-normal"
                style={{ fontSize: "14px" }}
              >
                USDC
              </small>
            </span>
          </div>
          <div className="mt-2 py-2 d-flex align-items-center border-bottom">
            <span className="d-inline-block text-truncate text-body-secondary me-2">
              0x049....6584sf
            </span>
            <span className="h4 ms-auto my-0 text-success-emphasis">
              $250{" "}
              <small
                className="text-body-secondary fw-normal"
                style={{ fontSize: "14px" }}
              >
                USDC
              </small>
            </span>
          </div>
          <div className="mt-2 py-2 d-flex align-items-center">
            <span className="d-inline-block text-truncate text-body-secondary me-2">
              0x049....6584sf
            </span>
            <span className="h4 ms-auto my-0 text-success-emphasis">
              $600{" "}
              <small
                className="text-body-secondary fw-normal"
                style={{ fontSize: "14px" }}
              >
                USDC
              </small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
*/
