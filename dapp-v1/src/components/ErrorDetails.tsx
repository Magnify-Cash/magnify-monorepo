import type React from "react";

interface ErrorDetailsProps {
  error: string;
}

const ErrorDetails: React.FC<ErrorDetailsProps> = ({ error }) => {
  return (
    <>
      <p>{getErrorText(error)}</p>
    </>
  );
};

export default ErrorDetails;

// Add more error handling
const getErrorText = (error: string) => {
  switch (true) {
    // Custom errors
    case error.includes("User rejected the request"):
      return "User rejected the request";
    case error.includes(`Address "undefined" is invalid`):
      return "Invalid address error. Please check if you're using the correct chain.";
    case error.includes("loanAmountDue is not defined"):
      return "Loan amount due is not defined";
    case error.includes("is not a function"):
      return "Function is not available.";
    case error.includes("0xcfb3b942"):
      return "Approval caller not owner nor approved";
    case error.includes("insufficient allowance"):
      return "Token allowance must be greater than 0";
    case error.includes("already approved"):
      return "Token allowance has already been approved";
    case error.includes("No changes detected"):
      return "No changes detected";

    // Contract Reverts
    case error.includes("AmountIsZero"):
      return "Amount is zero";
    case error.includes("CallerIsNotBorrower"):
      return "Caller is not the borrower";
    case error.includes("CallerIsNotLender"):
      return "Caller is not the lender";
    case error.includes("CallerIsNotLendingDeskOwner"):
      return "Caller is not the owner of the lending desk";
    case error.includes("ERC20IsZeroAddr"):
      return "ERC20 address is zero";
    case error.includes("InsufficientLendingDeskBalance"):
      return "Insufficient balance in the lending desk";
    case error.includes("InterestRateTooHigh"):
      return "Interest rate is too high";
    case error.includes("InvalidInterest"):
      return "Invalid interest";
    case error.includes("InvalidLendingDeskId"):
      return "Invalid lending desk ID";
    case error.includes("InvalidLoanId"):
      return "Invalid loan ID";
    case error.includes("InvalidNFTCollection"):
      return "Invalid NFT collection standard, please confirm your NFT collection is ERC721 or ERC1155";
    case error.includes("LendingDeskIsNotEmpty"):
      return "Lending desk is not empty";
    case error.includes("LendingDeskIsNotActive"):
      return "Lending desk is not active";
    case error.includes("LendingDeskIsNotFrozen"):
      return "Lending desk is not frozen";
    case error.includes("LoanAmountTooHigh"):
      return "Loan amount is too high";
    case error.includes("LoanAmountTooLow"):
      return "Loan amount is too low";
    case error.includes("LoanDurationTooHigh"):
      return "Loan duration is too high";
    case error.includes("LoanDurationTooLow"):
      return "Loan duration is too low";
    case error.includes("LoanHasDefaulted"):
      return "Loan has defaulted";
    case error.includes("LoanHasNotDefaulted"):
      return "Loan has not defaulted";
    case error.includes("LoanIsNotActive"):
      return "Loan is not active";
    case error.includes("LoanMustBeActiveForMin1Hour"):
      return "Loan must be active for at least 1 hour";
    case error.includes("LoanPaymentExceedsDebt"):
      return "Loan payment exceeds debt";
    case error.includes("MaxAmountIsLessThanMin"):
      return "Maximum amount is less than minimum amount";
    case error.includes("MaxDurationIsLessThanMin"):
      return "Maximum duration is less than minimum duration";
    case error.includes("MaxInterestIsLessThanMin"):
      return "Maximum interest is less than minimum interest";
    case error.includes("MinAmountIsZero"):
      return "Minimum amount is zero";
    case error.includes("MinDurationIsZero"):
      return "Minimum duration is zero";
    case error.includes("MinInterestIsZero"):
      return "Minimum interest is zero";
    case error.includes("ObligationNotesIsZeroAddr"):
      return "Obligation notes address is zero";
    case error.includes("PlatformWalletIsZeroAddr"):
      return "Platform wallet address is zero";
    case error.includes("UnsupportedNFTCollection"):
      return "Unsupported NFT collection";


    // Errors signatures not available in the contract ABI
    case error.includes("0xe450d38c"):
      return "Insufficient Token Balance in the Wallet";

    // default
    default:
      return "Unknown error. Please refresh the page and try again.";
  }
};
