import ErrorDetails from "@/components/ErrorDetails";
import TransactionDetails from "@/components/TransactionDetails";
import { useToastContext } from "@/helpers/CreateToast";
import {
  magnifyCashV1Address,
  useReadErc721GetApproved,
  useReadErc1155IsApprovedForAll,
  useWriteErc721Approve,
  useWriteErc1155SetApprovalForAll,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";

export const useLoanApproval = (
  nft: any,
  nftId: string | undefined,
  nftCollectionIsErc1155: boolean,
) => {
  /*
  wagmi hooks
  */
  const chainId = useChainId();

  /*
  graphql hooks
  */
  const { address } = useAccount();

  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  /*
  form state variables
  */
  const [checked, setChecked] = useState<boolean>(false);

  //Initialize Approve Erc721 Hook
  const {
    data: approveErc721TransactionData,
    writeContractAsync: approveErc721,
    error: approveErc721Error,
  } = useWriteErc721Approve();

  //Initialize Approve Erc1155 Hook
  const {
    data: approveErc1155TransactionData,
    writeContractAsync: approveErc1155,
    error: approveErc1155Error,
  } = useWriteErc1155SetApprovalForAll();

  //Fetch Approval Data for the ERC721 NFT
  const { data: erc721ApprovalData, refetch: refetchErc721ApprovalData } =
    useReadErc721GetApproved({
      address: nft?.address as `0x${string}`,
      args: [BigInt(nftId || "0")],
      query: {
        enabled: !!nft?.address && !!address && !!chainId && !nftCollectionIsErc1155,
      },
    });
  // Fetch Approval Data for the ERC1155 NFT
  const { data: erc1155ApprovalData, refetch: refetchErc1155ApprovalData } =
    useReadErc1155IsApprovedForAll({
      address: nft?.address as `0x${string}`,
      args: [address as `0x${string}`, magnifyCashV1Address[chainId] as `0x${string}`],
      query: {
        enabled: !!nft?.address && !!address && !!chainId && nftCollectionIsErc1155,
      },
    });

  const {
    isLoading: approveIsConfirming,
    isSuccess: approveIsConfirmed,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: nftCollectionIsErc1155
      ? approveErc1155TransactionData
      : approveErc721TransactionData,
  });

  useEffect(() => {
    if (approveErc721Error) {
      console.log("approveErc721Error", approveErc721Error);
      console.error(approveErc721Error);

      if (loadingToastId) {
        closeToast(loadingToastId);
        addToast(
          "Transaction Failed",
          <ErrorDetails error={approveErc721Error.message} />,
          "error",
        );
      }
      setLoadingToastId(null);
      setApprovalIsLoading(false);
    }

    if (approveErc1155Error) {
      console.log("approveErc1155Error", approveErc1155Error);
      console.error(approveErc1155Error);

      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Failed",
          <ErrorDetails error={approveErc1155Error.message} />,
          "error",
        );
      }
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
      refetchErc721ApprovalData();
      refetchErc1155ApprovalData();
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails
            transactionHash={
              nftCollectionIsErc1155
                ? approveErc1155TransactionData!
                : approveErc721TransactionData!
            }
          />,
          "success",
        );
      }
      setApprovalIsLoading(false);
    }
  }, [
    approveErc721Error,
    approveErc1155Error,
    approveConfirmError,
    approveIsConfirming,
    approveIsConfirmed,
  ]);

  useEffect(() => {
    if (!erc721ApprovalData) {
      setChecked(false);
      return;
    }
    if (
      erc721ApprovalData.toLowerCase() === magnifyCashV1Address[chainId].toLowerCase()
    ) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [nftId, erc721ApprovalData]);

  useEffect(() => {
    if (erc1155ApprovalData) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [nftId, erc1155ApprovalData]);

  // Checkbox click function
  const handleApproval = async (approveFunction: Function) => {
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);

    await approveFunction({
      address: nft?.address as `0x${string}`,
      args: nftCollectionIsErc1155
        ? [magnifyCashV1Address[chainId] as `0x${string}`, true]
        : [magnifyCashV1Address[chainId], BigInt(nftId || "0")],
    });
  };

  async function approveERC721TokenTransfer() {
    if (nftCollectionIsErc1155) {
      console.error("NFT Collection is not ERC721");
      return;
    }
    handleApproval(approveErc721);
  }

  async function approveERC1155TokenTransfer() {
    if (!nftCollectionIsErc1155) {
      console.error("NFT Collection is not ERC1155");
      return;
    }
    handleApproval(approveErc1155);
  }

  return {
    approveERC721TokenTransfer,
    approveERC1155TokenTransfer,
    approvalIsLoading,
    checked,
    refetchErc1155ApprovalData,
    refetchErc721ApprovalData,
  };
};
