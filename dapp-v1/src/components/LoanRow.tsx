import { calculateTimeInfo } from "@/helpers/utils";
import { NavLink } from "react-router-dom";
import type { Loan } from "../../.graphclient";
import LoanDetails from "./loanDetails";

// Interface
interface ILoanRowProps {
  loans: Array<Loan> | any; // Loan array
  status?: string; // Status of the loan row
  payback?: boolean; // Whether or not loan card should have payback UI
  liquidate?: boolean; // Whether or not loan card should have liquidate UI
  reexecuteQuery?: () => void;
}

export const LoanRow = ({
  loans,
  payback,
  status,
  liquidate,
  reexecuteQuery,
}: ILoanRowProps) => {
  // Setup loan data and handle empty state
  // Note: Handle "Pending Default" manually
  loans = loans.filter((loan: Loan) => {
    // Calculate time information for the loan
    const { isTimeLeft } = calculateTimeInfo(loan.startTime, loan.duration);

    // Check if status is "PendingDefault" and there's no time left
    if (status === "PendingDefault" && !isTimeLeft) {
      return loan;
    }

    // Check if loan status matches the provided status and there's time left
    if (loan.status === status && isTimeLeft) {
      return loan;
    }

    // If neither condition is met, the loan is filtered out
  });
  if (loans.length === 0) {
    return (
      <div className="specific-w-400 mw-100 mx-auto mt-5 pt-3">
        <img
          src="theme/images/Vector.png"
          alt="Not Found Robot"
          className="img-fluid d-block mx-auto specific-w-150 mw-100"
        />
        <div className="h3 text-center mt-5">Nothing found</div>
        <p className="text-body-secondary text-center mt-3">
          {"Don’t know where to start? "}
          <NavLink to="/quick-loan">Get Quick Loan</NavLink>
        </p>
      </div>
    );
  }
  return loans.map((loan: Loan) => (
    <LoanDetails
      key={loan.id}
      loan={loan}
      payback={payback}
      liquidate={liquidate}
      status={status!}
      {...(reexecuteQuery ? { reexecuteQuery } : {})}
    />
  ));
};
