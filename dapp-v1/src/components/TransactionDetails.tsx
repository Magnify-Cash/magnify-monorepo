import { getBlockExplorerURL } from "@/helpers/utils";
import type React from "react";
import { useChainId } from "wagmi";

interface TransactionDetailsProps {
  transactionHash: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transactionHash }) => {
  const chainId = useChainId();
  const explorer = getBlockExplorerURL(chainId);

  const url = `${explorer}/tx/${transactionHash}`;

  return (
    <>
      <p>Your transaction has been confirmed</p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        Check out txn details here
      </a>
    </>
  );
};

export default TransactionDetails;
