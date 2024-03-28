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
}

export const LoanRow = ({ loans, payback, status, liquidate }: ILoanRowProps) => {
  // Setup loan data && handle empty state
  // Note: Handle "Pending Default" manually
  loans = loans.filter((loan: Loan) => {
    if (loan.status === "Active" && status === "PendingDefault") {
      const { isTimeLeft } = calculateTimeInfo(loan.startTime, loan.duration);
      if (!isTimeLeft) {
        return loan;
      }
    }
    if (loan.status === status) {
      return loan;
    }
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
          {`Don’t know where to start? `}
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
    />
  ));
};
