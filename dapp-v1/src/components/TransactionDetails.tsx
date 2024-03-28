import type React from "react";
import { useChainId } from "wagmi";

interface TransactionDetailsProps {
  transactionHash: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transactionHash }) => {
  const chainId = useChainId();

  // Add the base url for the block explorer for different networks
  let baseUrl = "";

  switch (chainId) {
    case 11155111:
      baseUrl = "https://sepolia.etherscan.io/tx/";
      break;
    case 8453:
      baseUrl = "https://basescan.org/tx/";
      break;
    case 84532:
      baseUrl = "https://sepolia.basescan.org/tx/";
      break;
    default:
      baseUrl = "https://etherscan.io/tx/";
      break;
  }

  const url = `${baseUrl}${transactionHash}`;

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
