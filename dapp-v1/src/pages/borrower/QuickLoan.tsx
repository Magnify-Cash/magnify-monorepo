import { PopupTokenList } from "@/components";
import GetLoanModal from "@/components/GetLoanModal";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";
import { useToastContext } from "@/helpers/CreateToast";
import fetchNFTDetails, { INft } from "@/helpers/FetchNfts";
import { formatAddress } from "@/helpers/formatAddress";
import { fromWei, toWei } from "@/helpers/utils";
import {
  nftyFinanceV1Address,
  useErc721Approve,
  useErc721GetApproved,
  useNftyFinanceV1InitializeNewLoan,
  usePrepareNftyFinanceV1InitializeNewLoan,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { useQuery } from "urql";
import { useChainId, useWaitForTransaction } from "wagmi";
import { QuickLoanDocument } from "../../../.graphclient";

export const QuickLoan = (props: any) => {
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [newLoanIsLoading, setNewLoanIsLoading] = useState<boolean>(false);

  // constants
  const chainId = useChainId();

  // tokenlist / nftlist state management
  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();

  // Loan params selection
  const [selectedLendingDesk, _setSelectedLendingDesk] = useState<any>();
  const [nftId, setNftId] = useState<number>();
  //
  const [nft, setNft] = useState<INft>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const [checked, setChecked] = useState(false);

  const setSelectedLendingDesk = (e: string) => _setSelectedLendingDesk(JSON.parse(e));

  const getNFTdetails = async () => {
    const fetchedNfts = await fetchNFTDetails([
      selectedLendingDesk?.loanConfig?.nftCollection?.id,
    ]);
    setNft(fetchedNfts[0]); //There is only one nft in the array
  };

  // GraphQL query
  const flatResult: any[] = [];
  const [result] = useQuery({
    query: QuickLoanDocument,
    variables: {
      nftCollectionId: nftCollection?.nft?.address?.toLowerCase(),
      erc20Id: token?.token?.address?.toLowerCase(),
    },
  });
  const { data, fetching, error } = result;

  useEffect(() => {
    // This function will be executed whenever the selectedLendingDesk data changes
    if (!fetching) {
      getNFTdetails();
    }
  }, [selectedLendingDesk]);

  for (const lendingDesk of result.data?.lendingDesks ?? []) {
    for (const loanConfig of lendingDesk.loanConfigs) {
      flatResult.push({ lendingDesk, loanConfig });
    }
  }

  //Initialize Approve Erc721 Hook
  const { data: approveErc721TransactionData, writeAsync: approveErc721 } =
    useErc721Approve({
      address: nftCollection?.nft.address as `0x${string}`,
      args: [nftyFinanceV1Address[chainId], BigInt(nftId || 0)],
    });

  //Fetch Approval Data for the NFT
  const { data: approvalData, refetch: refetchApprovalData } = useErc721GetApproved({
    address: nftCollection?.nft.address as `0x${string}`,
    args: [BigInt(nftId || 0)],
  });

  //On successful transaction of approveErc721 hook, refetch the approval data
  //Also refetch newLoanConfig to update the newLoanWrite function

  useWaitForTransaction({
    hash: approveErc721TransactionData?.hash as `0x${string}`,
    onSuccess(data) {
      refetchApprovalData();
      refetchNewLoanConfig();
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        "Your transaction has been confirmed.",
        "success",
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast(
        "Transaction Failed",
        "Your transaction has failed. Please try again.",
        "error",
      );
    },
  });

  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (approvalData.toLowerCase() === nftyFinanceV1Address[chainId].toLowerCase()) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [nftId, approvalData]);

  const { config: newLoanConfig, refetch: refetchNewLoanConfig } =
    usePrepareNftyFinanceV1InitializeNewLoan({
      args: [
        BigInt(selectedLendingDesk?.lendingDesk?.id ?? 0),
        nftCollection?.nft.address as `0x${string}`,
        BigInt(nftId || 0),
        BigInt((duration || 0) * 24),
        //TODO supply decimals value
        toWei(amount ? amount.toString() : "0", token?.token.decimals),
      ],
    });
  const { data: newLoanWriteTransactionData, writeAsync: newLoanWrite } =
    useNftyFinanceV1InitializeNewLoan(newLoanConfig);

  //On successful transaction of newLoanWrite hook, refetch the approval data
  //This is done to update the checkbox after a successful loan request
  useWaitForTransaction({
    hash: newLoanWriteTransactionData?.hash as `0x${string}`,
    onSuccess(data) {
      refetchApprovalData();
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        "Your transaction has been confirmed.",
        "success",
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast(
        "Transaction Failed",
        "Your transaction has failed. Please try again.",
        "error",
      );
    },
  });

  // Checkbox click function
  async function approveERC721TokenTransfer() {
    if (checked) {
      console.log("already approved");
      return;
    }
    setApprovalIsLoading(true);
    try {
      await approveErc721();
    } catch (error) {}
    setApprovalIsLoading(false);
  }

  // Modal submit
  async function requestLoan() {
    const form = document.getElementById("quickLoanForm") as HTMLFormElement;
    const isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
      return;
    }
    console.log("token", token);
    console.log("nftCollection", nftCollection);
    console.log("selectedLendingDesk", selectedLendingDesk);
    console.log("nftId", nftId);
    console.log("duration", duration);
    console.log("amount", amount);
    console.log("form is valid, wagmi functions with above data.....");
    console.log(newLoanConfig);
    setNewLoanIsLoading(true);
    try {
      await newLoanWrite?.();
    } catch (error) {}
    setNewLoanIsLoading(false);
  }

  //This hook is used to display loading toast when the approve transaction is pending

  useEffect(() => {
    if (approveErc721TransactionData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [approveErc721TransactionData?.hash]);

  //This hook is used to display loading toast when the new loan transaction is pending

  useEffect(() => {
    if (newLoanWriteTransactionData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [newLoanWriteTransactionData?.hash]);

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="row g-4 justify-content-center mt-0">
        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">Choose NFT</div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            <div className="card-body">
              <div
                className="form-select w-100 btn btn-secondary"
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
                urls={[
                  "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json",
                ]}
                modalId="nftModal"
                onClick={setNftCollection}
              />
            </div>
          </div>
        </div>
        {/* Column end */}

        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">Choose Currency</div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            {nftCollection ? (
              <div className="card-body">
                <div
                  className="form-select w-100 btn btn-secondary"
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
                  urls={["https://tokens.coingecko.com/uniswap/all.json"]}
                  modalId="tokenModal"
                  onClick={setToken}
                />
              </div>
            ) : (
              <div className="card-body specific-h-400 overflow-y-auto pt-0">
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
        {/* Column end */}

        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">Select Offer</div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            <div className="card-body specific-h-400 overflow-y-auto">
              {flatResult.length > 0 ? (
                flatResult.map((item) => {
                  return (
                    <div className="nfty-check" key={item.lendingDesk.id}>
                      <input
                        type="radio"
                        className="btn-check"
                        autoComplete="off"
                        name="desks"
                        id={item.lendingDesk.id}
                        onClick={(e) =>
                          setSelectedLendingDesk((e.target as HTMLInputElement).value)
                        }
                        value={JSON.stringify(item)}
                      />
                      <label
                        className="btn py-2 d-block w-100 border border-secondary border-opacity-25"
                        htmlFor={item.lendingDesk.id}
                      >
                        <div className="d-flex align-items-center justify-content-center mx-auto">
                          <img
                            src={nft?.logoURI}
                            width="30"
                            alt={nft?.address}
                            className="flex-shrink-0"
                          />
                          <span className="ms-3">
                            {formatAddress(item.loanConfig?.nftCollection?.id)}
                          </span>
                        </div>
                        <div className="container-fluid g-0">
                          <div className="row g-2 mt-2">
                            <div className="col">
                              <div className="p-2 rounded-3 bg-success-subtle text-center">
                                <div className="text-success-emphasis h3 mb-3">
                                  <i className="fa-light fa-hand-holding-dollar"></i>
                                </div>
                                <div className="fw-bold">
                                  {fromWei(
                                    item.loanConfig.maxAmount,
                                    token?.token.decimals,
                                  )}
                                </div>
                                <small className="fw-normal">max offer</small>
                              </div>
                            </div>
                            <div className="col">
                              <div className="p-2 rounded-3 bg-info-subtle text-center">
                                <div className="text-info-emphasis h3 mb-3">
                                  <i className="fa-light fa-calendar-clock"></i>
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
                                  <i className="fa-light fa-badge-percent"></i>
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
                })
              ) : (
                <div className="card-body specific-h-400 overflow-y-auto pt-0">
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
        {/* Column end */}
        <div className="my-4 text-end">
          <GetLoanModal
            {...{
              btnClass: "btn btn-primary btn-lg py-3 px-5 rounded-pill",
              disabled: !token || !nftCollection || !selectedLendingDesk,
              checked,
              onCheck: approveERC721TokenTransfer,
              onSubmit: requestLoan,
              nft,
              duration,
              setDuration,
              amount,
              setAmount,
              loanConfig: selectedLendingDesk?.loanConfig,
              lendingDesk: selectedLendingDesk?.lendingDesk,
              nftId,
              setNftId,
              nftCollectionAddress: nftCollection?.nft.address,
              approvalIsLoading,
              newLoanIsLoading,
            }}
          />
        </div>
      </div>
      {/* End Container*/}
    </div>
  );
};
