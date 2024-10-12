import { PopupTokenList } from "@/components";
import ErrorDetails from "@/components/ErrorDetails";
import GetLoanModal from "@/components/GetLoanModal";
import PaginatedList from "@/components/LoadMore";
import LoadingIndicator from "@/components/LoadingIndicator";
import type { ITokenListItem } from "@/components/PopupTokenList";
import type { INFTListItem } from "@/components/PopupTokenList";
import TransactionDetails from "@/components/TransactionDetails";
import { useToastContext } from "@/helpers/CreateToast";
import fetchNFTDetails, { type INft } from "@/helpers/FetchNfts";
import { calculateLoanInterest } from "@/helpers/LoanInterest";
import { formatAddress } from "@/helpers/formatAddress";
import { useCustomWatchContractEvent } from "@/helpers/useCustomHooks";
import { type WalletNft, fromWei, getWalletNfts, toWei } from "@/helpers/utils";
import {
  magnifyCashV1Address,
  useReadErc721GetApproved,
  useSimulateMagnifyCashV1InitializeNewLoan,
  useWriteErc721Approve,
  useWriteMagnifyCashV1InitializeNewLoan,
} from "@/wagmi-generated";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";
import {
  GetErc20sForNftCollectionDocument,
  GetNftsWithLendingDeksDocument,
  QuickLoanDocument,
  type QuickLoanQuery,
} from "../../../.graphclient";

interface QuickLoanContextType {
  selectedLendingDesk: any;
  _setSelectedLendingDesk: (value: any) => void;
  nftCollection: any;
  nft: any;
  setNft: (value: any) => void;
  token: any;
}

//This context is used to pass the data from QuickLoan to renderLendingDesks directly
const QuickLoanContext = createContext<QuickLoanContextType>(
  {} as QuickLoanContextType,
);

const renderLendingDesks = ({
  items,
  loading,
  error,
  loadMore,
  hasNextPage,
  props,
}) => {
  // wagmi hooks
  const chainId: number = useChainId();

  // get context data
  const {
    selectedLendingDesk,
    _setSelectedLendingDesk,
    nftCollection,
    nft,
    setNft,
    token,
  } = useContext(QuickLoanContext);

  // state
  const [flatResult, setFlatResult] = useState<any>([]);
  const setSelectedLendingDesk = (e: string) => _setSelectedLendingDesk(JSON.parse(e));
  const getNFTdetails = async () => {
    const fetchedNfts = await fetchNFTDetails([nftCollection?.nft.address], chainId);
    setNft(fetchedNfts[0]); //There is only one nft in the array
  };

  //This useEffect hook is used to get the nft details from the nftCollection
  useEffect(() => {
    if (nftCollection && items) {
      getNFTdetails();
    }
  }, [nftCollection, items]);

  //This function formats the data received from the graphql query
  //It filters out lending desks with no loanConfig items and balance less than minAmount
  useEffect(() => {
    const formatData = (
      data: QuickLoanQuery["lendingDesks"]["items"],
      targetNftCollectionId: string,
    ) =>
      data
        .filter(({ loanConfigs }) => (loanConfigs?.items?.length ?? 0) > 0)
        .filter((lendingDesk) =>
          lendingDesk.loanConfigs?.items?.some(
            (loanConfig) =>
              loanConfig.nftCollection.id.toUpperCase() ===
              targetNftCollectionId.toUpperCase(),
          ),
        )
        .filter((lendingDesk) => {
          const matchingLoanConfig = lendingDesk.loanConfigs?.items?.find(
            (loanConfig) =>
              loanConfig.nftCollection.id.toUpperCase() ===
              targetNftCollectionId.toUpperCase(),
          );
          return (
            matchingLoanConfig &&
            Number(lendingDesk.balance) >= Number(matchingLoanConfig.minAmount)
          );
        })
        .map(({ id, balance, status, erc20, loanConfigs }) => {
          const matchingLoanConfig = loanConfigs?.items?.find(
            (loanConfig) =>
              loanConfig.nftCollection.id.toUpperCase() ===
              targetNftCollectionId.toUpperCase(),
          );
          return {
            lendingDesk: {
              id,
              balance,
              status,
              erc20: { ...erc20 },
            },
            loanConfig: matchingLoanConfig ? { ...matchingLoanConfig } : undefined,
          };
        });

    if (items && !loading && !error) {
      const formatted = formatData(items, nftCollection?.nft.address ?? "");
      setFlatResult(formatted);
    }
  }, [items, loading, error]);

  return (
    <div>
      {flatResult.length > 0 ? (
        <div className="specific-h-500 overflow-y-scroll">
          {flatResult.map((item) => {
            return (
              <div className="magnify-check" key={item.lendingDesk.id}>
                <input
                  type="radio"
                  className="btn-check"
                  autoComplete="off"
                  name="desks"
                  id={item.lendingDesk.id}
                  onClick={(e) => setSelectedLendingDesk(JSON.stringify(item))}
                  value={JSON.stringify(item)}
                />
                <label
                  className="btn py-2 d-block w-100 border border-secondary border-opacity-25"
                  htmlFor={item.lendingDesk.id}
                >
                  <div className="d-flex align-items-center justify-content-center mx-auto">
                    {nft?.logoURI && (
                      <img
                        src={nft?.logoURI}
                        width="30"
                        alt={nft?.address}
                        className="flex-shrink-0"
                      />
                    )}
                    <span className="ms-3">
                      {formatAddress(item.loanConfig?.nftCollection?.id)}
                    </span>
                  </div>
                  <div className="container-fluid g-0">
                    <div className="row g-2 mt-2">
                      <div className="col">
                        <div className="p-2 rounded-3 bg-success-subtle text-center">
                          <div className="text-success-emphasis h3 mb-3">
                            <i className="fa-light fa-hand-holding-dollar" />
                          </div>
                          <div className="fw-bold">
                            {fromWei(item.loanConfig.maxAmount, token?.token.decimals)}
                          </div>
                          <small className="fw-normal">max offer</small>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-2 rounded-3 bg-info-subtle text-center">
                          <div className="text-info-emphasis h3 mb-3">
                            <i className="fa-light fa-calendar-clock" />
                          </div>
                          <div className="fw-bold">
                            {item.loanConfig.maxDuration / 24} days
                          </div>
                          <small className="fw-normal">duration</small>
                        </div>
                      </div>
                      <div className="col">
                        <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-center">
                          <div className="text-primary-emphasis h3 mb-3">
                            <i className="fa-light fa-badge-percent" />
                          </div>
                          <div className="fw-bold">
                            {item.loanConfig.maxInterest / 100} %
                          </div>
                          <small className="fw-normal">interest</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-body pt-0">
          <div
            className="specific-w-300 mw-100 mx-auto text-body-secondary my-5"
            style={{ fontSize: 16 }}
          >
            <div>Please choose the NFT and currency to see offers:</div>
            <div className="mt-2">
              {nft ? (
                <i className="fa-solid fa-check-circle text-primary-emphasis"></i>
              ) : (
                <i className="fa-solid fa-circle opacity-25"></i>
              )}
              <span className="ms-2">NFT selected</span>
            </div>
            <div className="mt-1">
              {token ? (
                <i className="fa-solid fa-check-circle text-primary-emphasis"></i>
              ) : (
                <i className="fa-solid fa-circle opacity-25"></i>
              )}
              <span className="ms-2">Currency selected</span>
            </div>
          </div>
        </div>
      )}
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
};

export const QuickLoan = (props: any) => {
  /*
  react-router hooks
  */
  const navigate = useNavigate();
  /*
  wagmi hooks
  */
  const { address } = useAccount();
  const chainId = useChainId();

  /*
  tokenlist / nftlist state management
  */

  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();

  /*
  GraphQL query for getting NFTs with lending desks
  */
  const [nftsResult] = useQuery({
    query: GetNftsWithLendingDeksDocument,
  });
  //This is used to get the nft ids of the nfts with lending desks
  const availableNfts = (nftsResult.data?.nftCollections?.items ?? []).map(
    (nftCollection) => nftCollection.id,
  );

  /*
  GraphQL query for getting ERC20s for selected NFT
  */
  const [erc20sResult] = useQuery({
    query: GetErc20sForNftCollectionDocument,
    variables: {
      nftCollectionId: nftCollection?.nft?.address?.toLowerCase() || "",
    },
  });
  const erc20s = (erc20sResult.data?.nftCollection?.erc20s?.items ?? []).map(
    (erc20) => erc20.erc20.id,
  );

  /*
  Alchemy hooks
  */
  const [walletNfts, setWalletNfts] = useState<WalletNft[]>([]);
  useEffect(() => {
    const fetchWalletNfts = async () => {
      const walletNfts = await getWalletNfts({
        chainId: chainId,
        wallet: address?.toLowerCase()!,
        nftCollection: nftCollection?.nft.address!,
      });
      setWalletNfts(walletNfts);
    };
    fetchWalletNfts();
  }, [address, nftCollection?.nft.address]);

  /*
  form hooks / functions
  */
  const [selectedLendingDesk, _setSelectedLendingDesk] = useState<any>();
  const [nftId, setNftId] = useState<string | undefined>();
  const [nft, setNft] = useState<INft>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const [checked, setChecked] = useState(false);
  const resetForm = () => {
    setNftId(undefined);
    setDuration(undefined);
    setAmount(undefined);
    setChecked(false);
    _setSelectedLendingDesk(undefined);
    //This resets the styling of lending desk selection form
    const button = document.querySelector(
      ".magnify-check .btn-check:checked",
    ) as HTMLInputElement;
    if (button) {
      button.checked = false;
    }
  };

  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [newLoanIsLoading, setNewLoanIsLoading] = useState<boolean>(false);

  /*
  Hook to watch for contract events
  */
  useCustomWatchContractEvent({
    eventName: "NewLoanInitialized",
    onLogs(logs) {
      // Close modal
      const modal = document.getElementsByClassName("modal show")[0];
      window.bootstrap.Modal.getInstance(modal)?.hide();
      // Redirect to borrower-dashboard page after 1 second
      setTimeout(() => {
        navigate("/borrower-dashboard");
      }, 100);
    },
  });

  //Initialize Approve Erc721 Hook
  const {
    data: approveErc721TransactionData,
    writeContractAsync: approveErc721,
    error: approveErc721Error,
  } = useWriteErc721Approve();
  const { data: approvalData, refetch: refetchApprovalData } = useReadErc721GetApproved(
    {
      address: nftCollection?.nft.address as `0x${string}`,
      args: [BigInt(nftId || "0")],
    },
  );
  const {
    isLoading: approveIsConfirming,
    isSuccess: approveIsConfirmed,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approveErc721TransactionData as `0x${string}`,
  });
  useEffect(() => {
    if (approveErc721Error) {
      console.log("approveErc721Error", approveErc721Error);
      console.error(approveErc721Error);
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
      }
      addToast(
        "Transaction Failed",
        <ErrorDetails error={approveErc721Error.message} />,
        "error",
      );
      setApprovalIsLoading(false);
    }
    if (approveConfirmError) {
      console.log("approveConfirmError", approveConfirmError);
      console.error(approveConfirmError);
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Failed",
          <ErrorDetails error={approveConfirmError.message} />,
          "error",
        );
      }
      setApprovalIsLoading(false);
    }
    if (approveIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (approveIsConfirmed) {
      refetchApprovalData();
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={approveErc721TransactionData!} />,
          "success",
        );
      }
      setApprovalIsLoading(false);
    }
  }, [
    approveErc721Error,
    approveConfirmError,
    approveIsConfirming,
    approveIsConfirmed,
  ]);
  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (approvalData.toLowerCase() === magnifyCashV1Address[chainId]?.toLowerCase()) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [nftId, approvalData]);

  const {
    data: newLoanConfig,
    isLoading: newLoanConfigIsLoading,
    error: newLoanConfigError,
  } = useSimulateMagnifyCashV1InitializeNewLoan({
    args: [
      BigInt(selectedLendingDesk?.lendingDesk?.id ?? 0),
      nftCollection?.nft.address as `0x${string}`,
      BigInt(nftId || "0"),
      Math.round((duration || 0) * 24),
      toWei(amount ? amount.toString() : "0", token?.token.decimals),
      Math.round(
        calculateLoanInterest(
          selectedLendingDesk?.loanConfig,
          amount,
          duration,
          token?.token.decimals || 18,
        ) * 100,
      ),
    ],
    query: {
      enabled:
        checked &&
        !!nftId &&
        !!duration &&
        !!amount &&
        !!selectedLendingDesk &&
        !!token,
    },
  });
  const {
    data: newLoanWriteTransactionData,
    writeContractAsync: newLoanWrite,
    error: newLoanWriteError,
  } = useWriteMagnifyCashV1InitializeNewLoan();

  const {
    isLoading: newLoanIsConfirming,
    isSuccess: newLoanIsConfirmed,
    error: newLoanConfirmError,
  } = useWaitForTransactionReceipt({
    hash: newLoanWriteTransactionData as `0x${string}`,
  });

  useEffect(() => {
    if (newLoanWriteError) {
      console.error(newLoanWriteError);
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Failed",
          <ErrorDetails error={newLoanWriteError.message} />,
          "error",
        );
      }
      setNewLoanIsLoading(false);
    }
    if (newLoanConfirmError) {
      console.error(newLoanConfirmError);
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Failed",
          <ErrorDetails error={newLoanConfirmError.message} />,
          "error",
        );
      }
      setNewLoanIsLoading(false);
    }
    if (newLoanIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (newLoanIsConfirmed) {
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={newLoanWriteTransactionData!} />,
          "success",
        );
      }
      refetchApprovalData();
    }
  }, [newLoanWriteError, newLoanConfirmError, newLoanIsConfirming, newLoanIsConfirmed]);

  // Checkbox click function
  async function approveERC721TokenTransfer() {
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);

    await approveErc721({
      address: nftCollection?.nft.address as `0x${string}`,
      args: [magnifyCashV1Address[chainId], BigInt(nftId || "0")],
    });
  }

  // Modal submit
  async function requestLoan() {
    const form = document.getElementById("quickLoanForm") as HTMLFormElement;
    const isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
      return;
    }

    const lendingDeskBalance = fromWei(
      selectedLendingDesk?.lendingDesk?.balance,
      selectedLendingDesk?.lendingDesk?.erc20?.decimals,
    );

    // Check if the user has enough balance in the lending desk
    if (amount && amount > Number(lendingDeskBalance)) {
      addToast(
        "Error",
        <ErrorDetails error="InsufficientLendingDeskBalance" />,
        "error",
      );
      return;
    }

    console.log({
      token,
      nftCollection,
      selectedLendingDesk,
      nftId,
      duration,
      amount,
      message: "form is valid, wagmi functions with above data.....",
    });
    //Check if newLoanConfig is undefined or newLoanConfigError is not null
    if (!newLoanConfig || newLoanConfigError) {
      console.log("newLoanConfigError", newLoanConfigError?.message);
      addToast(
        "Error",
        <ErrorDetails
          error={
            newLoanConfigError ? newLoanConfigError.message : "Error initializing loan"
          }
        />,
        "error",
      );
      return;
    }
    setNewLoanIsLoading(true);
    await newLoanWrite(newLoanConfig!.request);
  }

  // Memoization of the PaginatedList component
  const memoizedPaginatedList = useMemo(
    () => (
      <PaginatedList
        query={QuickLoanDocument}
        dataKey="lendingDesks"
        variables={{
          nftCollectionId: nftCollection?.nft?.address?.toLowerCase() || "",
          erc20Id: token?.token?.address?.toLowerCase() || "",
        }}
      >
        {renderLendingDesks}
      </PaginatedList>
    ),
    [nftCollection?.nft?.address, token?.token?.address],
  );

  return (
    <QuickLoanContext.Provider
      value={{
        selectedLendingDesk,
        _setSelectedLendingDesk,
        nftCollection,
        nft,
        setNft,
        token,
      }}
    >
      <div className="container-md px-3 px-sm-4 px-lg-5" style={{ overflow: "clip" }}>
        <div className="card bg-primary-subtle border-primary-subtle rounded-4 specific-w-600 mw-100 mx-auto">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="choose-nft">
                You collateralize (choose NFT):
              </label>
              <div
                className="form-select form-select-lg w-100"
                id="currency"
                data-bs-toggle="modal"
                data-bs-target="#nftModal"
              >
                {nftCollection ? (
                  <div className="d-flex align-items-center">
                    <img
                      src={nftCollection.nft.logoURI}
                      alt={`${nftCollection.nft.name} Logo`}
                      height="20"
                      width="20"
                    />
                    <p className="m-0 ms-1">{nftCollection.nft.name}</p>
                  </div>
                ) : (
                  "Choose NFT Collection..."
                )}
              </div>
              <PopupTokenList
                nft
                modalId="nftModal"
                onClick={setNftCollection}
                restrictTo={availableNfts}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="choose-currency">
                You borrow (choose currency):
              </label>
              <div
                className="form-select form-select-lg w-100"
                id="currency"
                data-bs-toggle="modal"
                data-bs-target="#tokenModal"
              >
                {token ? (
                  <div className="d-flex align-items-center">
                    <img
                      src={token.token.logoURI}
                      alt={`${token.token.name} Logo`}
                      height="20"
                      width="20"
                    />
                    <p className="m-0 ms-1">{token.token.name}</p>
                  </div>
                ) : (
                  "Choose Currency..."
                )}
              </div>
              <PopupTokenList
                token
                modalId="tokenModal"
                onClick={setToken}
                restrictTo={erc20s}
              />
            </div>
            <div>
              <label className="form-label">Select offer:</label>
              {memoizedPaginatedList}
            </div>
          </div>
        </div>
        <div className="my-4 specific-w-600 mw-100 mx-auto">
          <GetLoanModal
            {...{
              btnClass: "btn btn-primary btn-lg py-3 px-5 rounded-pill w-100 d-block",
              disabled: !token || !nftCollection || !selectedLendingDesk,
              checked,
              onCheck: approveERC721TokenTransfer,
              onSubmit: requestLoan,
              onModalClose: resetForm,
              nft,
              duration,
              setDuration,
              amount,
              setAmount,
              loanConfig: selectedLendingDesk?.loanConfig,
              lendingDesk: selectedLendingDesk?.lendingDesk,
              nftId,
              setNftId,
              walletNfts,
              approvalIsLoading,
              newLoanIsLoading,
              newLoanConfigIsLoading,
            }}
          />
        </div>
      </div>
    </QuickLoanContext.Provider>
  );
};
