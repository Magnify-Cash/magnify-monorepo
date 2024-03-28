import GetLoanModal from "@/components/GetLoanModal";
import { calculateLoanInterest } from "@/helpers/LoanInterest";
import { useToastContext } from "@/helpers/CreateToast";
import fetchNFTDetails, { INft } from "@/helpers/FetchNfts";
import { IToken, fetchTokensForCollection } from "@/helpers/FetchTokens";
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
import { NavLink, useParams } from "react-router-dom";
import { useQuery } from "urql";
import { useChainId, useWaitForTransaction } from "wagmi";
import { BrowseCollectionDocument } from "../../../.graphclient";
import TransactionDetails from "@/components/TransactionDetails";
import ErrorDetails from "@/components/ErrorDetails";

export const BrowseCollection = (props) => {
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [newLoanIsLoading, setNewLoanIsLoading] = useState<boolean>(false);
  const [formattedData, setFormattedData] = useState<any>();

  // GraphQL
  const { collection_address } = useParams();
  const chainId = useChainId();
  const [result] = useQuery({
    query: BrowseCollectionDocument,
    variables: {
      nftCollectionId: collection_address,
    },
  });
  const { data, fetching, error } = result;

  // We are using the useEffect hook to format the data from the query
  // This is done to make the data easier to work with
  // Initial data is an array of active lending desks with loan configs property
  // We are formatting the data to be an array of loanConfigs with lendingDesk property
  useEffect(() => {
    const formatData = (data) => ({
      loanConfigs: data.lendingDesks
        .filter((lendingDesk) => lendingDesk.loanConfigs.length > 0)
        .map((lendingDesk) => ({
          lendingDesk: {
            id: lendingDesk.id,
            balance: lendingDesk.balance,
            owner: lendingDesk.owner,
            status: lendingDesk.status,
            erc20: lendingDesk.erc20,
          },
          ...lendingDesk.loanConfigs[0],
        })),
    });
    if (data && !fetching && !error) {
      const formatted = formatData(data);
      setFormattedData(formatted);
    }
  }, [data]);

  const title = document.getElementById("base-title");
  useEffect(() => {
    // This function will be executed whenever the query data changes and formattedData is set
    const getTitle = async () => {
      if (!fetching && collection_address) {
        const fetchedNftArr: INft[] = await fetchNFTDetails(
          [collection_address],
          chainId
        );
        if (title) {
          title.innerHTML = `${fetchedNftArr[0].name} Liquidity Desks`;
        }
      }
    };
    getTitle();
  }, [formattedData]);

  useEffect(() => {
    // This function will be executed whenever the query data changes and formattedData is set
    if (!fetching) {
      getTokenDetails();
      getNFTdetails();
    }
  }, [formattedData]);

  // loan params selection
  const [nft, setNFT] = useState<INft>();
  const [nftId, setNftId] = useState<number>();
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [selectedLendingDesk, setSelectedLendingDesk] = useState<any>();
  const [selectedLoanConfig, setSelectedLoanConfig] = useState<any>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const [checked, setChecked] = useState(false);

  const getTokenDetails = async () => {
    const fetchedTokens = await fetchTokensForCollection(
      formattedData,
      chainId
    );
    setTokens(fetchedTokens);
  };

  const getNFTdetails = async () => {
    const fetchedNfts = await fetchNFTDetails([collection_address!], chainId);
    setNFT(fetchedNfts[0]); //There is only one nft in the array
  };

  //Initialize Approve Erc721 Hook
  const { data: approveErc721TransactionData, writeAsync: approveErc721 } =
    useErc721Approve({
      address: nft?.address as `0x${string}`,
      args: [nftyFinanceV1Address[chainId], BigInt(nftId || 0)],
    });

  //Fetch Approval Data for the NFT
  const { data: approvalData, refetch: refetchApprovalData } =
    useErc721GetApproved({
      address: nft?.address as `0x${string}`,
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
        <TransactionDetails transactionHash={data.transactionHash} />,
        "success"
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast(
        "Transaction Failed",
        <ErrorDetails error={error.message} />,
        "error"
      );
    },
  });

  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (
      approvalData.toLowerCase() === nftyFinanceV1Address[chainId].toLowerCase()
    ) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [nftId, approvalData]);

  // Initialize New Loan Hook
  const { config: newLoanConfig, refetch: refetchNewLoanConfig } =
    usePrepareNftyFinanceV1InitializeNewLoan({
      args: [
        BigInt(selectedLendingDesk?.id ? selectedLendingDesk.id : 0),
        nft?.address as `0x${string}`,
        BigInt(nftId || 0),
        (duration || 0) * 24,
        toWei(
          amount ? amount.toString() : "0",
          selectedLendingDesk?.erc20.decimals
        ),
        selectedLoanConfig &&
          selectedLendingDesk &&
          calculateLoanInterest(
            selectedLoanConfig,
            amount,
            duration,
            selectedLendingDesk?.erc20?.decimals || 18
          ) * 100,
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
        <TransactionDetails transactionHash={data.transactionHash} />,
        "success"
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast(
        "Transaction Failed",
        <ErrorDetails error={error.message} />,
        "error"
      );
    },
  });

  // Checkbox click function
  async function approveERC721TokenTransfer() {
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);
    try {
      await approveErc721();
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
    }
    setApprovalIsLoading(false);
  }
  // Modal submit
  async function requestLoan(index: number) {
    const form = document.getElementById(
      `quickLoanForm${index}`
    ) as HTMLFormElement;
    const isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
      return;
    }
    setNewLoanIsLoading(true);
    try {
      if (typeof newLoanWrite !== "function") {
        throw new Error("newLoanWrite is not a function");
      }
      await newLoanWrite();
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
    }
    setNewLoanIsLoading(false);
  }

  //This hook is used to display loading toast when the approve transaction is pending

  useEffect(() => {
    if (approveErc721TransactionData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading"
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
        "loading"
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [newLoanWriteTransactionData?.hash]);

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="text-body-secondary position-relative mt-n3">
        <NavLink to="/explore" className="text-reset text-decoration-none">
          <i className="fa-light fa-angle-left me-1"></i>
          Explore Collections
        </NavLink>
      </div>

      {/* Demo table */}
      <div className="card border-0 shadow rounded-4 my-4 mb-xl-5 overflow-hidden">
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
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Offer
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  Duration
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  Interest Rate
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  {" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {formattedData?.loanConfigs.map((loanConfig, index) => {
                return (
                  <tr className="align-middle" key={loanConfig.lendingDesk.id}>
                    <td className="py-3 ps-3">
                      <img
                        src="/images/placeholder/images/image-12.png"
                        width="30"
                        className="d-block rounded-circle"
                        alt="Placeholder"
                      />
                    </td>
                    <td className="py-3">
                      {formatAddress(loanConfig.lendingDesk.owner.id)}
                    </td>
                    <td className="py-3 align-middle">
                      {tokens?.[index]?.logoURI ? (
                        <img
                          src={tokens?.[index]?.logoURI}
                          height="30"
                          className="d-block rounded-circle"
                          alt={tokens?.[index]?.symbol}
                        />
                      ) : (
                        <div>{tokens?.[index]?.name}</div>
                      )}
                    </td>
                    <td className="py-3">
                      {fromWei(
                        loanConfig.minAmount,
                        loanConfig.lendingDesk?.erc20?.decimals
                      )}{" "}
                      -{" "}
                      {fromWei(
                        loanConfig.maxAmount,
                        loanConfig.lendingDesk?.erc20?.decimals
                      )}
                    </td>
                    <td className="py-3">
                      {loanConfig.minDuration / 24}-
                      {loanConfig.maxDuration / 24} days
                    </td>
                    <td className="py-3">
                      {loanConfig.minInterest / 100}-
                      {loanConfig.maxInterest / 100}%
                    </td>
                    <td className="py-3 pe-3">
                      <GetLoanModal
                        {...{
                          btnClass: "btn btn-primary rounded-pill px-4",
                          disabled: false,
                          btnOnClick: () => {
                            setSelectedLendingDesk(loanConfig?.lendingDesk);
                            setSelectedLoanConfig(loanConfig);
                          },
                          onSubmit: () => requestLoan(index),
                          approvalIsLoading,
                          newLoanIsLoading,
                          checked,
                          onCheck: approveERC721TokenTransfer,
                          nft,
                          duration,
                          setDuration,
                          amount,
                          setAmount,
                          loanConfig: loanConfig as any, // disabled type checking
                          lendingDesk: selectedLendingDesk,
                          nftId,
                          setNftId,
                          nftCollectionAddress: collection_address,
                          index,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* End Table */}

      {/* End Container*/}
    </div>
  );
};

BrowseCollection.defaultProps = {
  titleElement: <div>hello</div>,
  // ...
};
