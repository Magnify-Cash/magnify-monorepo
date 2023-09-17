import { useEffect, useState } from "react";
import { useChainId } from "wagmi";
import { PopupTransaction } from "@/components";
import {
  usePrepareNftyFinanceV1MakeLoanPayment,
  useNftyFinanceV1MakeLoanPayment,
  usePrepareNftyFinanceV1LiquidateDefaultedLoan,
  useNftyFinanceV1LiquidateDefaultedLoan,
  nftyFinanceV1Address,
  useErc20Approve,
} from "@/wagmi-generated";
import { calculateTimeInfo, formatTimeInfo } from "@/utils"
import { Loan } from "../../.graphclient";

// Interface
interface ILoanRowProps {
  loans: Array<Loan> | any; // Loan array
  status?: string // Status of the loan row
  payback?: boolean; // Whether or not loan card should have payback UI
  liquidate?:boolean; // Whether or not loan card should have liquidate UI
}

export const LoanRow = ({loans, payback, status, liquidate}: ILoanRowProps) => {
  // Setup loan data && handle empty state
  // Note: Handle "Pending Default" manually
  loans = loans.filter((loan:Loan) => {
  if (status === "Pending Default"){
    if (loan.status === "Active"){
      return loan
    }
  }
  if (loan.status === status){
    return loan
  }
  });
  if (loans.length === 0) {
  return (
    <img height="200" src="/theme/images/thinking_guy.svg" alt="No items found" />
  )
  }

  // OK
  return loans.map((loan:Loan) => {
    // Date/Time info
    const [timeInfo, setTimeInfo] = useState(calculateTimeInfo(loan?.startTime, loan?.duration));
    useEffect(() => {
      const intervalId = setInterval(() => {
        setTimeInfo(calculateTimeInfo(loan?.startTime, loan?.duration));
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }, [loan?.startTime, loan?.duration]);

    // Make Loan Payment Hook
    const [payBackAmount, setPayBackAmount] = useState("0");
    const chainId = useChainId();
    const { writeAsync: approveErc20 } = useErc20Approve({
      address: loan?.lendingDesk?.erc20.id as `0x${string}`,
      args: [nftyFinanceV1Address[chainId], BigInt(payBackAmount)],
    });
    const { config: makeLoanPaymentConfig, refetch: makeLoanPaymentRefetch } =
      usePrepareNftyFinanceV1MakeLoanPayment({
      enabled:false,
      args: [
        BigInt(loan?.id || 0), // loan ID
        BigInt(payBackAmount), // amout
      ],
    });
    const { writeAsync: makeLoanPaymentWrite } = useNftyFinanceV1MakeLoanPayment(makeLoanPaymentConfig)
    async function makeLoanPayment(loanID: string) {
      console.log("loanID", loanID);
      console.log("payBackAmount", payBackAmount);
      await approveErc20?.()
      await makeLoanPaymentRefetch?.()
      await makeLoanPaymentWrite?.()
    }

    // Liquidate Overdue loan Hook
    const { config: liquidateConfig, refetch: liquidateRefetch } =
      usePrepareNftyFinanceV1LiquidateDefaultedLoan({
      enabled: false,
      args: [
        BigInt(loan?.id || 0), // loan ID
      ],
    });
    const { writeAsync: liquidateWrite } = useNftyFinanceV1LiquidateDefaultedLoan(liquidateConfig)
    async function liquidateOverdueLoan(loanID: string) {
      console.log("loanID", loanID);
      console.log('hi');
      await liquidateRefetch();
      await liquidateWrite?.();
    }

    return (
    <div className="col-sm-6 col-xl-4" key={loan?.id}>
      <style>
      {`
        .progress {margin-bottom:0;}
        .start {float:left;}
        .end {float:right; text-align:right;}
      `}
      </style>

      <div className="card border-0 shadow rounded-4 h-100">
      <div className="card-body">
        <div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle overflow-hidden">
        <img
          className="object-fit-cover"
          src="/images/placeholder/pengu.png"
          alt="test"
          height="100%"
        />
        </div>
        <div className="text-center mt-3">
        <h5>{loan?.nftCollection.id} #{loan?.nftId}</h5>
        <div className="row g-4">
          <div className="col-6 bg-info">
          <i className="fa-regular fa-hand-holding-dollar h1 me-1"></i>
          <h6>{loan?.amount} {loan?.lendingDesk?.erc20.symbol}</h6>
          <small>borrowed</small>
          </div>
          <div className="col-6 bg-success">
          <i className="fa-regular fa-calendar h1 me-1"></i>
          <h6>{loan?.amount - loan?.amountPaidBack} {loan?.lendingDesk?.erc20.symbol}</h6>
          <small>payoff amount</small>
          </div>
          <div className="col-12">
          {
            timeInfo.isTimeLeft
            ? <h5 className="text-start">{timeInfo.remainingTime}</h5>
            : (
              status !== "Defaulted"
              ? <p className="text-danger text-start">
              Loan is overdue! <br/> Make payment or face liquidation.
              </p>
              : null
            )

          }
          <div className="progress my-2">
            <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            aria-valuenow={timeInfo.calculateProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: `${timeInfo.calculateProgress}%` }}
            />
          </div>
          <div className="start">
            <p className="text-start m-0">{formatTimeInfo(timeInfo.startDate)}</p>
            <small>issued date</small>
          </div>
          <div className="end">
            <p className="text-end m-0">{formatTimeInfo(timeInfo.endDate)}</p>
            <small>due date</small>
          </div>
          </div>
        </div>
        {payback ?
        <PopupTransaction
          btnClass="btn btn-primary btn-lg mt-4"
          btnText="Make Loan Payment"
          modalId={`paybackModal${loan?.id}`}
          modalTitle="Make Loan Payment"
          modalContent={
          <div>
            <small>Loan Details</small>
            <p>{loan?.nftCollection.id} #{loan?.nftId}</p>
            <div className="row g-4">
            <div className="col-6 bg-secondary">
              <h6>{loan?.amount} {loan?.lendingDesk?.erc20.symbol}</h6>
              <small>original borrow</small>
            </div>
            <div className="col-6 bg-secondary">
              <h6>{loan?.interest} %</h6>
              <small>interest date</small>
            </div>
            <div className="col-6 bg-secondary">
              <h6>{timeInfo.elapsedTime}</h6>
              <small>loan duration</small>
            </div>
            <div className="col-6 bg-secondary">
              <h6>[x]{loan?.lendingDesk?.erc20.symbol}</h6>
              <small>amount due on expiry date</small>
            </div>
            <div className="col-12 bg-success">
              <h6>[x]{loan?.lendingDesk?.erc20.symbol}</h6>
              <small>current payoff amount</small>
            </div>
            </div>
            <hr />
            <p className="text-start">Enter Amount</p>
            <div className="input-group">
            <input
              value={payBackAmount}
              onChange={(e) => setPayBackAmount(e.target.value)}
              type="number"
              className="me-2"
            />
            <span>{loan?.lendingDesk?.erc20.symbol}</span>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => makeLoanPayment(loan?.id)}>
            Make Loan Payment
            </button>
          </div>
          }
        />
        : null}
        {liquidate ?
        <PopupTransaction
          btnClass="btn btn-primary btn-lg mt-4"
          btnText="Liquidate Overdue Loan"
          modalId={`liquidateModal${loan?.id}`}
          modalTitle="Liquidate Overdue Loan"
          modalContent={
          <div>
            <small>Loan Details</small>
            <p>{loan?.nftCollection.id} #{loan?.nftId}</p>
            <div className="row g-4">
            <div className="col-6 bg-secondary">
              <h6>{loan?.amount} {loan?.lendingDesk?.erc20.symbol}</h6>
              <small>original borrow</small>
            </div>
            <div className="col-6 bg-secondary">
              <h6>{loan?.interest} %</h6>
              <small>interest date</small>
            </div>
            <div className="col-6 bg-secondary">
              <h6>{timeInfo.elapsedTime}</h6>
              <small>loan duration</small>
            </div>
            <div className="col-6 bg-secondary">
              <h6>[x]{loan?.lendingDesk?.erc20.symbol}</h6>
              <small>amount due on expiry date</small>
            </div>
            <div className="col-12 bg-success">
              <h6>[x]{loan?.lendingDesk?.erc20.symbol}</h6>
              <small>current payoff amount</small>
            </div>
            </div>
            <hr />
            <button type="button" className="btn btn-primary" onClick={() => liquidateOverdueLoan(loan?.id)}>
            Liquidate Overdue Loan
            </button>
          </div>
          }
        />
        : null}
        </div>
      </div>
      </div>
    </div>
  )});
};
