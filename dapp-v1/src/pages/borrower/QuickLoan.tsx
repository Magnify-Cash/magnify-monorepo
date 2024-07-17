import { PopupTokenList } from "@/components";
import ErrorDetails from "@/components/ErrorDetails";
import GetLoanModal from "@/components/GetLoanModal";
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";
import { FixedSizeList as List } from "react-window";
import { QuickLoanListRow as Row } from "@/components/QuickLoanListRow";
import {
  GetErc20sForNftCollectionDocument,
  QuickLoanDocument,
  type QuickLoanQuery,
} from "../../../.graphclient";

export const QuickLoan = (props: any) => {
  /*
  react-router hooks
  */
  const navigate = useNavigate();
  /*
  wagmi hooks
  */
  // constants
  const { address } = useAccount();

  const chainId = useChainId();

  /*
  graphql hooks
  */
  // tokenlist / nftlist state management
  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();

  // GraphQL query for getting ERC20s for selected NFT
  const [erc20sResult] = useQuery({
    query: GetErc20sForNftCollectionDocument,
    variables: {
      nftCollectionId: nftCollection?.nft?.address?.toLowerCase() || "",
    },
  });
  const erc20s = (erc20sResult.data?.nftCollection?.erc20s?.items ?? []).map(
    (erc20) => erc20.erc20.id,
  );

  // GraphQL query

  const [flatResult, setFlatResult] = useState<any>([]);

  const [result] = useQuery({
    query: QuickLoanDocument,
    variables: {
      nftCollectionId: nftCollection?.nft?.address?.toLowerCase() || "",
      erc20Id: token?.token?.address?.toLowerCase() || "",
    },
  });

  const { data, fetching, error } = result;

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
        nftCollection: nftCollection?.nft.address!,
      });
      setWalletNfts(walletNfts);
    };
    fetchWalletNfts();
  }, [address, nftCollection?.nft.address]);
  /*
  form hooks / functions
  */
  // Loan params selection
  const [selectedLendingDesk, _setSelectedLendingDesk] = useState<any>();
  const [nftId, setNftId] = useState<number>();
  const [nft, setNft] = useState<INft>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const [checked, setChecked] = useState(false);

  const setSelectedLendingDesk = (e: string) => _setSelectedLendingDesk(JSON.parse(e));

  const getNFTdetails = async () => {
    const fetchedNfts = await fetchNFTDetails(
      [selectedLendingDesk?.loanConfig?.nftCollection?.id],
      chainId,
    );
    setNft(fetchedNfts[0]); //There is only one nft in the array
  };

  useEffect(() => {
    // This function will be executed whenever the selectedLendingDesk data changes
    if (!fetching) {
      getNFTdetails();
    }
  }, [selectedLendingDesk]);

  //This function formats the data received from the graphql query
  //It filters out lending desks with no loanConfig items and balance less than minAmount
  useEffect(() => {
    const formatData = (data: QuickLoanQuery) =>
      data.lendingDesks.items
        .filter(({ loanConfigs }) => (loanConfigs?.items?.length ?? 0) > 0)
        .filter(
          (lendingDesk) =>
            Number(lendingDesk?.balance) >=
            Number(lendingDesk?.loanConfigs?.items?.[0]?.minAmount),
        )
        .map(({ id, balance, status, erc20, loanConfigs }) => ({
          lendingDesk: {
            id,
            balance,
            status,
            erc20: { ...erc20 },
          },
          loanConfig: { ...loanConfigs?.items[0] },
        }));

    if (data && !fetching && !error) {
      const formatted = formatData(data);
      setFlatResult(formatted);
    }
  }, [data, fetching, error]);

  //This resets the data in the form
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

  //Fetch Approval Data for the NFT
  const { data: approvalData, refetch: refetchApprovalData } = useReadErc721GetApproved(
    {
      address: nftCollection?.nft.address as `0x${string}`,
      args: [BigInt(nftId || 0)],
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
          <TransactionDetails transactionHash={approvalData!} />,
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
    if (approvalData.toLowerCase() === magnifyCashV1Address[chainId].toLowerCase()) {
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
      BigInt(nftId || 0),
      Math.round((duration || 0) * 24),
      toWei(amount ? amount.toString() : "0", token?.token.decimals),
      selectedLendingDesk &&
        Math.round(
          calculateLoanInterest(
            selectedLendingDesk?.loanConfig,
            amount,
            duration,
            selectedLendingDesk?.erc20?.decimals || 18,
          ) * 100,
        ),
    ],
    query: {
      enabled: checked,
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
      refetchApprovalData();
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={newLoanWriteTransactionData!} />,
          "success",
        );
      }
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
      args: [magnifyCashV1Address[chainId], BigInt(nftId || 0)],
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

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5" style={{ overflow: "clip" }}>
      <div className="card bg-primary-subtle border-primary-subtle rounded-4 specific-w-600 mw-100 mx-auto">
        <div className="card-body">
          <div className="mb-3">
            <label
              className="form-label text-primary-emphasis fw-bold"
              htmlFor="choose-nft"
            >
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
              restrictTo={result?.data?.nftCollections?.items.map((x) => x?.id)}
            />
          </div>
          <div className="mb-3">
            <label
              className="form-label text-primary-emphasis fw-bold"
              htmlFor="choose-currency"
            >
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
            <label className="form-label text-primary-emphasis fw-bold">
              Select offer:
            </label>
            {flatResult.length > 0 ? (
              <List
                height={400}
                itemCount={flatResult.length}
                itemSize={200}
                width={"100%"}

              >
                {({ index, style }) => (
                  <Row
                    style={style}
                    index={index}
                    items={flatResult}
                    nft={nft}
                    token={token}
                    setSelectedLendingDesk={setSelectedLendingDesk}
                  />
                )}
              </List>
            ) : (
              <div className="card-body pt-0">
                <img
                  src="/theme/images/ThinkingMeme.svg"
                  alt="Thinking"
                  className="img-fluid mx-auto d-block my-3 specific-w-150 mw-100"
                />
                <p className="text-center text-body-secondary fst-italic">
                  Start customizing to see offers
                </p>
              </div>
            )}
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
  );
};
