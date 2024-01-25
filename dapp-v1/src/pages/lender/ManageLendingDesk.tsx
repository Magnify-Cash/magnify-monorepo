import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { useParams } from "react-router-dom";
import { PopupTransaction } from "@/components";
import {
  useNftyFinanceV1SetLendingDeskState,
  useNftyFinanceV1DepositLendingDeskLiquidity,
  useNftyFinanceV1WithdrawLendingDeskLiquidity,
  usePrepareNftyFinanceV1SetLendingDeskState,
  usePrepareNftyFinanceV1DepositLendingDeskLiquidity,
  usePrepareNftyFinanceV1WithdrawLendingDeskLiquidity,
  nftyFinanceV1Address,
  useErc20Approve,
  useErc20Allowance,
} from "@/wagmi-generated";
import { useAccount, useChainId, useWaitForTransaction } from "wagmi";
import { ManageLendingDeskDocument } from "../../../.graphclient";
import { fromWei, toWei } from "@/helpers/utils";
import fetchNFTDetails, { INft } from "@/helpers/FetchNfts";
import ManageFunds from "./ManageFunds";

export const ManageLendingDesk = (props: any) => {
  /*
  GraphQL Query
  */
  const { id } = useParams();
  const [result] = useQuery({
    query: ManageLendingDeskDocument,
    variables: {
      // @ts-ignore
      deskId: id,
    },
  });

  /*
  Dynamic Title
  This hook gets / sets the page title based on lending desk ID
  */
  var title = document.getElementById("base-title");
  useEffect(() => {
    if (title && result.data?.lendingDesk) {
      title.innerHTML = `Manage Lending Desk ${result.data?.lendingDesk?.id}`;
    }
  }, [result]);

  /*
  Fetch NFT Details
  This is used to lookup a list of NFTs off chain
  */
  const [nftArr, setNftArr] = useState<INft[]>([]);
  const getNFTs = async () => {
    const nftIds: string[] | undefined =
      result.data?.lendingDesk?.loanConfigs.map(
        (loan) => loan.nftCollection.id
      );
    if (nftIds?.length) {
      const resultArr = await fetchNFTDetails(nftIds);
      setNftArr(resultArr);
    }
  };
  useEffect(() => {
    if (!result.fetching) {
      getNFTs();
    }
  }, [result.data]);

  /*
  Freeze/Unfreeze lending desk
  Calls `setLendingDeskState` with relevant boolean status
  */
  const boolStatus =
    result.data?.lendingDesk?.status === "Frozen" ? false : true;
  const boolString = boolStatus
    ? "Freeze Lending Desk"
    : "Un-Freeze Lending Desk";
  const { config: freezeConfig } = usePrepareNftyFinanceV1SetLendingDeskState({
    args: [BigInt(result.data?.lendingDesk?.id || 0), boolStatus],
  });
  const { writeAsync: freezeWrite } =
    useNftyFinanceV1SetLendingDeskState(freezeConfig);
  const freezeUnfreeze = async () => {
    await freezeWrite?.();
  };

  /*
  JSX Return
  */
  return result.data?.lendingDesk ? (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      <div className="text-body-secondary position-relative">
        <NavLink to="/manage-desks" className="text-reset text-decoration-none">
          <i className="fa-light fa-angle-left me-1"></i>
          Manage Lending Desks
        </NavLink>
      </div>
      <div className="row g-4 mt-n2 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-medium text-primary-emphasis">
                Lending Desk {result.data?.lendingDesk?.id}
              </h5>
              <div className="container-fluid g-0 mt-4">
                <div className="row g-4">
                  <div className="col-lg-4">
                    <h6 className="fw-medium text-body-secondary">
                      Currency Type
                    </h6>
                    <div className="mt-1 fs-4 d-flex align-items-center">
                      <div className="text-truncate">
                        {result.data?.lendingDesk?.erc20.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <h6 className="fw-medium text-body-secondary">
                      Available Liquidity
                    </h6>
                    <div className="mt-1 fs-4 text-body-secondary">
                      <strong className="text-primary-emphasis">
                        {fromWei(
                          result.data?.lendingDesk?.balance,
                          result.data?.lendingDesk?.erc20?.decimals
                        )}
                        &nbsp;
                      </strong>
                      {result.data?.lendingDesk?.erc20.symbol}
                    </div>
                  </div>
                  <div className="col-lg-4 text-lg-end ">
                    <ManageFunds
                      lendingDesk={result?.data?.lendingDesk}
                      action="deposit"
                    />
                    <ManageFunds
                      lendingDesk={result?.data?.lendingDesk}
                      action="withdraw"
                    />
                    <input
                      type="checkbox"
                      className="btn-check"
                      id="btn-check"
                      autoComplete="off"
                      checked={!boolStatus}
                    />
                    <label
                      className="btn btn-primary py-2 w-100 rounded-pill"
                      htmlFor="btn-check"
                      onClick={() => freezeUnfreeze()}
                    >
                      {boolString}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End row */}
        <div className="col-xxl-6">
          <div className="card border-0 shadow rounded-4 h-100 overflow-hidden d-block">
            <div className="card-body p-4 specific-h-75">
              <h5 className="fw-medium text-primary-emphasis">
                {/* Total number of collections */}
                Collections | {result.data?.lendingDesk?.loanConfigs.length}
              </h5>
            </div>
            <div className="card-body p-4 pt-0 specific-h-xxl-450 overflow-y-auto">
              {result.data?.lendingDesk?.loanConfigs.map((config, index) => {
                return (
                  <div key={index} className="pb-2 mb-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="text-body-secondary text-truncate">
                        Collection {index + 1}
                      </div>
                      <div className="flex-shrink-0 ms-auto">
                        <span className="text-body-secondary me-2">
                          <a
                            href="#"
                            className="text-reset text-decoration-none"
                            aria-label="Edit"
                          >
                            <i className="fa-regular fa-edit"></i>
                          </a>
                        </span>
                        <span className="text-danger-emphasis">
                          <a
                            href="#"
                            className="text-reset text-decoration-none"
                            aria-label="Delete"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </a>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <img
                        src={nftArr[index]?.logoURI}
                        height="24"
                        className="d-block rounded-circle flex-shrink-0 me-2"
                      />
                      <div className="text-truncate fw-medium">
                        {nftArr[index]?.name}
                      </div>
                    </div>
                    <div className="mt-2 d-flex align-items-center">
                      <span className="flex-shrink-0 specific-w-25">
                        <i className="fa-light fa-hand-holding-dollar text-success-emphasis"></i>
                      </span>
                      <div className="text-truncate">
                        <strong>Offer:</strong>{" "}
                        {fromWei(
                          config.minAmount,
                          result.data?.lendingDesk?.erc20?.decimals
                        )}
                        -
                        {fromWei(
                          config.maxAmount,
                          result.data?.lendingDesk?.erc20?.decimals
                        )}{" "}
                        {result.data?.lendingDesk?.erc20.symbol}
                      </div>
                    </div>
                    <div className="mt-1 d-flex align-items-center">
                      <span className="flex-shrink-0 specific-w-25">
                        <i className="fa-light fa-calendar-clock text-info-emphasis"></i>
                      </span>
                      <div className="text-truncate">
                        <strong>Duration:</strong> {config.minDuration / 24}-
                        {config.maxDuration / 24} Days
                      </div>
                    </div>
                    <div className="mt-1 d-flex align-items-center">
                      <span className="flex-shrink-0 specific-w-25">
                        <i className="fa-light fa-badge-percent text-primary-emphasis"></i>
                      </span>
                      <div className="text-truncate">
                        <strong>Interest Rate:</strong>{" "}
                        {config.minInterest / 100}-{config.maxInterest / 100}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-xxl-6">
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-medium text-primary-emphasis">
                Collection Paramaters
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
