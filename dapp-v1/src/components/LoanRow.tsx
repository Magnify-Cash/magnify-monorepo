import { useState } from "react";
import { useChainId } from "wagmi";
import { PopupTransaction } from "@/components";
import {
  usePrepareNftyFinanceV1MakeLoanPayment,
  useNftyFinanceV1MakeLoanPayment,
  nftyFinanceV1Address,
  useErc20Approve,
} from "@/wagmi-generated";
import { calculateTimeInfo, formatTimeInfo } from "@/utils"
import { Loan } from "../../.graphclient";

// Interface
interface ILoanRowProps {
  loans: Array<Loan> | any; // loans array
  status?: string // Status of the loan row
  payback?: boolean; // whether or not loan card should have payback UI
  liquidate?:boolean; // whether or not loan card should have liquidate UI
}
export const LoanRow = ({loans, payback, status, liquidate}: ILoanRowProps) => {
  // Setup loan data && handle empty state
  loans = loans.filter((loan:Loan) => loan.status === status);
  if (loans.length === 0) {
    return (
      <img height="200" src="/theme/images/thinking_guy.svg" alt="No items found" />
    )
  }

  // OK
  return loans.map((loan) => {
    // Date rendering
    const {
      startDate,
      endDate,
      remainingTime,
      elapsedTime,
      isTimeLeft,
    } = calculateTimeInfo(loan?.startTime, loan?.duration);

    // Make Loan Payment Hook
    const [payBackAmount, setPayBackAmount] = useState("0");
    const chainId = useChainId();
    const { writeAsync: approveErc20 } = useErc20Approve({
      address: loan?.lendingDesk?.erc20.id as `0x${string}`,
      args: [nftyFinanceV1Address[chainId], BigInt(payBackAmount)],
    });
    const { config: makeLoanPaymentConfig } =
      usePrepareNftyFinanceV1MakeLoanPayment({
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
      await makeLoanPaymentWrite?.()
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
              src="/images/placeholder/doodles.png"
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
                  isTimeLeft
                  ? <h5 className="text-start">{remainingTime}</h5>
                  : <p className="text-danger text-start">
                    Loan is overdue! <br/> Make payment or face liquidation.
                    </p>
                }
                <div className="progress my-2">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    aria-valuenow={75}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: "75%" }}
                  />
                </div>
                <div className="start">
                  <p className="text-start m-0">{formatTimeInfo(startDate)}</p>
                  <small>issued date</small>
                </div>
                <div className="end">
                  <p className="text-end m-0">{formatTimeInfo(endDate)}</p>
                  <small>due date</small>
                </div>
              </div>
            </div>
            {payback ?
            <PopupTransaction
              btnClass="btn btn-primary btn-lg mt-4"
              btnText="Pay Back"
              modalId="txModal"
              modalBtnText="Pay Now"
              modalTitle="Pay Back Loan"
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
                      <h6>{elapsedTime}</h6>
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
                    Button Text
                  </button>
                </div>
              }
            />
          : null}
          </div>
        </div>
      </div>
    </div>
    )
  });
};
