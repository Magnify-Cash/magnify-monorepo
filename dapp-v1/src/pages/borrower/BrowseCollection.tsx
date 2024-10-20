import { Blockies } from "@/components";
import ErrorDetails from "@/components/ErrorDetails";
import GetLoanModal from "@/components/GetLoanModal";
import PaginatedList from "@/components/LoadMore";
import LoadingIndicator from "@/components/LoadingIndicator";
import TransactionDetails from "@/components/TransactionDetails";
import { useToastContext } from "@/helpers/CreateToast";
import fetchNFTDetails, { type INft } from "@/helpers/FetchNfts";
import { type IToken, fetchTokensForCollection } from "@/helpers/FetchTokens";
import { calculateLoanInterest } from "@/helpers/LoanInterest";
import { formatAddress } from "@/helpers/formatAddress";
import { useCustomWatchContractEvent } from "@/helpers/useCustomHooks";
import { type WalletNft, fromWei, getWalletNfts, toWei } from "@/helpers/utils";
import { useLoanApproval } from "@/hooks/useLoanApproval";
import {
  useSimulateMagnifyCashV1InitializeNewLoan,
  useWriteMagnifyCashV1InitializeNewLoan,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";
import {
  BrowseCollectionDocument,
  type BrowseCollectionQuery,
} from "../../../.graphclient";

const renderLendingDesks = ({
  items,
  loading,
  error,
  loadMore,
  hasNextPage,
  props,
}) => {
  /*
  react-router hooks
  */
  const navigate = useNavigate();
  /*
  /*
  wagmi hooks
  */
  const chainId = useChainId();

  /*
  graphql hooks
  */
  const { address } = useAccount();

  /*
  page title hook
  */
  const title = document.getElementById("base-title");
  const [formattedData, setFormattedData] = useState<any>();
  useEffect(() => {
    // This function will be executed whenever the query data changes and formattedData is set
    const getTitle = async () => {
      if (!loading && props.collection_address) {
        const fetchedNftArr: INft[] = await fetchNFTDetails(
          [props.collection_address],
          chainId,
        );
        if (title) {
          title.innerHTML = `${fetchedNftArr[0].name} Liquidity Desks`;
        }
      }
    };
    getTitle();
  }, [formattedData]);

  /*
  Alchemy hooks
  */
  const [walletNfts, setWalletNfts] = useState<WalletNft[]>([]);

  // Get the available NFTs from the wallet
  useEffect(() => {
    const fetchWalletNfts = async () => {
      const walletNfts = await getWalletNfts({
        chainId: chainId,
        wallet: address?.toLowerCase()!,
        nftCollection: props.collection_address!,
      });
      setWalletNfts(walletNfts);
    };
    fetchWalletNfts();
  }, [address, props.collection_address]);

  /*
  form hooks / functions
  */

  // We are using the useEffect hook to format the data from the query
  // This is done to make the data easier to work with
  // Initial data is an array of active lending desks with loan configs property
  // We are formatting the data to be an array of loanConfigs with lendingDesk property
  useEffect(() => {
    const formatData = (data: BrowseCollectionQuery["lendingDesks"]["items"]) => ({
      loanConfigs: data
        .filter((lendingDesk) => (lendingDesk?.loanConfigs?.items?.length || 0) > 0)
        .filter(
          (lendingDesk) =>
            Number(lendingDesk?.balance) >=
            Number(lendingDesk?.loanConfigs?.items?.[0]?.minAmount),
        )
        .map((lendingDesk) => ({
          lendingDesk: {
            id: lendingDesk.id,
            balance: lendingDesk.balance,
            owner: lendingDesk.owner,
            status: lendingDesk.status,
            erc20: lendingDesk.erc20,
          },
          ...lendingDesk?.loanConfigs?.items[0],
        })),
    });
    if (items && !loading && !error) {
      const formatted = formatData(items);
      setFormattedData(formatted);
    }
  }, [items]);

  useEffect(() => {
    // This function will be executed whenever the query data changes and formattedData is set
    if (!loading) {
      getTokenDetails();
      getNFTdetails();
    }
  }, [formattedData]);

  // loan params selection
  const [nft, setNFT] = useState<INft>();
  const [nftId, setNftId] = useState<string | undefined>();
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [selectedLendingDesk, setSelectedLendingDesk] = useState<any>();
  const [selectedLoanConfig, setSelectedLoanConfig] = useState<any>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();

  const getTokenDetails = async () => {
    const fetchedTokens = await fetchTokensForCollection(formattedData, chainId);
    setTokens(fetchedTokens);
  };

  const getNFTdetails = async () => {
    const fetchedNfts = await fetchNFTDetails([props.collection_address!], chainId);
    setNFT(fetchedNfts[0]); //There is only one nft in the array
  };

  //This resets the data in the form
  const resetForm = () => {
    setDuration(undefined);
    setAmount(undefined);
    setNftId(undefined);
    setSelectedLendingDesk(null);
    setSelectedLoanConfig(null);
  };

  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [newLoanIsLoading, setNewLoanIsLoading] = useState<boolean>(false);

  /*
  Hook to watch for contract events
  */
  useCustomWatchContractEvent({
    eventName: "NewLoanInitialized",
    onLogs: (logs) => {
      console.log("New Loan Initialized Event", logs);
      // Close modal
      const modal = document.getElementsByClassName("modal show")[0];
      window.bootstrap.Modal.getInstance(modal)?.hide();
      // Redirect to borrower-dashboard page after 1 second
      setTimeout(() => {
        navigate("/borrower-dashboard");
      }, 100);
    },
  });

  // Loan Approval Hook
  const {
    approveERC721TokenTransfer,
    approveERC1155TokenTransfer,
    approvalIsLoading,
    checked,
    refetchErc721ApprovalData,
    refetchErc1155ApprovalData,
  } = useLoanApproval(nft, nftId, selectedLoanConfig?.nftCollectionIsErc1155);

  // Initialize New Loan Hook
  const {
    data: newLoanConfig,
    isLoading: newLoanConfigIsLoading,
    error: newLoanConfigError,
  } = useSimulateMagnifyCashV1InitializeNewLoan({
    args: [
      BigInt(selectedLendingDesk?.id ? selectedLendingDesk.id : 0),
      nft?.address as `0x${string}`,
      BigInt(nftId || "0"),
      Math.round((duration || 0) * 24),
      toWei(amount ? amount.toString() : "0", selectedLendingDesk?.erc20.decimals),
      Math.round(
        calculateLoanInterest(
          selectedLoanConfig,
          amount,
          duration,
          selectedLendingDesk?.erc20?.decimals || 18,
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
        !!selectedLoanConfig,
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
      refetchErc721ApprovalData();
      refetchErc1155ApprovalData();
    }
  }, [newLoanWriteError, newLoanConfirmError, newLoanIsConfirming, newLoanIsConfirmed]);

  // Modal submit
  async function requestLoan(index: number) {
    const form = document.getElementById(`quickLoanForm${index}`) as HTMLFormElement;
    const isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
      return;
    }
    const lendingDeskBalance = fromWei(
      selectedLendingDesk?.balance,
      selectedLendingDesk?.erc20?.decimals,
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

  return (
    <tbody>
      {formattedData?.loanConfigs.map((loanConfig, index) => {
        return (
          <tr className="align-middle" key={loanConfig.lendingDesk.id}>
            <td className="py-3 ps-3">
              <Blockies seed={loanConfig.lendingDesk.owner.id} size={8} />
            </td>
            <td className="py-3">{formatAddress(loanConfig.lendingDesk.owner.id)}</td>
            <td className="py-3 align-middle">
              {tokens?.[index]?.logoURI ? (
                <img
                  src={tokens?.[index]?.logoURI}
                  height="30"
                  className="d-block rounded-circle"
                  alt={tokens?.[index]?.symbol}
                />
              ) : (
                <span>{tokens?.[index]?.name}</span>
              )}
            </td>
            <td className="py-3">
              {fromWei(loanConfig.minAmount, loanConfig.lendingDesk?.erc20?.decimals)} -{" "}
              {fromWei(loanConfig.maxAmount, loanConfig.lendingDesk?.erc20?.decimals)}
            </td>
            <td className="py-3">
              {loanConfig.minDuration / 24}-{loanConfig.maxDuration / 24} days
            </td>
            <td className="py-3">
              {loanConfig.minInterest / 100}-{loanConfig.maxInterest / 100}%
            </td>
            <td className="py-3 pe-3">
              <GetLoanModal
                {...{
                  btnClass: "btn btn-outline-primary rounded-pill px-4",
                  disabled: false,
                  btnOnClick: () => {
                    setSelectedLendingDesk(loanConfig?.lendingDesk);
                    setSelectedLoanConfig(loanConfig);
                  },
                  onSubmit: () => requestLoan(index),
                  onModalClose: resetForm,
                  approvalIsLoading,
                  newLoanIsLoading,
                  newLoanConfigIsLoading,
                  checked,
                  onCheck: selectedLoanConfig?.nftCollectionIsErc1155
                    ? approveERC1155TokenTransfer
                    : approveERC721TokenTransfer,
                  nft,
                  duration,
                  setDuration,
                  amount,
                  setAmount,
                  loanConfig: loanConfig as any, // disabled type checking
                  lendingDesk: selectedLendingDesk,
                  nftId,
                  setNftId,
                  walletNfts,
                  index,
                }}
              />
            </td>
          </tr>
        );
      })}
      {loading && (
        <tr>
          <td colSpan={100} className="text-center">
            <LoadingIndicator />
          </td>
        </tr>
      )}
      {error && (
        <tr>
          <td colSpan={100} className="text-center">
            <p>Error: {error.message}</p>
          </td>
        </tr>
      )}
      {hasNextPage && (
        <tr>
          <td colSpan={100} className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="btn btn-primary d-block mx-auto my-3 px-4 py-2 text-uppercase font-weight-bold"
            >
              Load More
            </button>
          </td>
        </tr>
      )}
    </tbody>
  );
};

export const BrowseCollection = (props) => {
  const { collection_address } = useParams();

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="text-body-secondary position-relative mt-n3">
        <NavLink to="/explore" className="text-reset text-decoration-none">
          <i className="fa-light fa-angle-left me-1" />
          Explore Collections
        </NavLink>
      </div>

      {/* Demo table */}
      <div className="card bg-primary-subtle border-primary-subtle rounded-4 my-4 mb-xl-5 overflow-hidden">
        <div className="table-responsive">
          <table className="table m-0 text-nowrap">
            <thead>
              <tr>
                <th
                  className="py-3 bg-primary-subtle text-primary-emphasis ps-3"
                  colSpan={2}
                >
                  Lender
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Currency
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">Offer</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  Duration
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  Interest Rate
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3"> </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3"> </th>
              </tr>
            </thead>
            <PaginatedList
              query={BrowseCollectionDocument}
              dataKey="lendingDesks"
              variables={{
                nftCollectionId: collection_address,
              }}
              props={{
                collection_address: collection_address,
              }}
            >
              {renderLendingDesks}
            </PaginatedList>
          </table>
        </div>
      </div>
      {/* End Table */}

      {/* End Container*/}
    </div>
  );
};
