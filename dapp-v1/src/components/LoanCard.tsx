/*
TODO
- add typing for loaninfo
- ensure all [] placeholders are complete
*/

import { useState } from "react";
import { useChainId } from "wagmi";
import { PopupTransaction } from "@/components";
import {
  usePrepareNftyFinanceV1MakeLoanPayment,
  useNftyFinanceV1MakeLoanPayment,
  nftyFinanceV1Address,
  useErc20Approve,
} from "@/wagmi-generated";

// date rendering
function calculateTimeInfo(startTime, durationInHours) {
  // Convert the Unix timestamp to milliseconds
  const startTimeInMillis = startTime * 1000;

  // Calculate the end time in milliseconds
  const endTimeInMillis = startTimeInMillis + durationInHours * 3600 * 1000;

  // Create JavaScript date objects
  const currentDate = new Date();
  const startDate = new Date(startTimeInMillis);
  const endDate = new Date(endTimeInMillis);

  // Calculate total duration in milliseconds
  const totalDurationInMillis = durationInHours * 3600 * 1000;

  // Calculate remaining duration in milliseconds
  const currentTimeInMillis = currentDate.getTime();
  let remainingDurationInMillis = endTimeInMillis - currentTimeInMillis;

  // Check if remaining duration is negative and set it to zero if needed
  if (remainingDurationInMillis < 0) {
    remainingDurationInMillis = 0;
  }

  // Calculate remaining days and hours
  const remainingDays = Math.floor(remainingDurationInMillis / (24 * 3600 * 1000));
  remainingDurationInMillis %= 24 * 3600 * 1000;
  const remainingHours = Math.floor(remainingDurationInMillis / (3600 * 1000));

  // Construct the remaining time string
  let remainingTime;
  if (remainingDays > 0) {
    remainingTime = `${remainingDays} days and ${remainingHours} hours`;
  } else {
    remainingTime = `${remainingHours} hours`;
  }

  // Return the values as an object, including the remaining time string
  return {
    currentDate,
    startDate,
    endDate,
    totalDuration: totalDurationInMillis,
    remainingTime, // Add the remaining time string
  };
}

function formatTimeInfo(dateTime) {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return dateTime.toLocaleString(undefined, options);
}


// Interface
interface ILoanCardProps {
  loanInfo: object | null; // loan info object
  payback?: boolean; // whether or not loan card should have payback UI
  liquidate?:boolean; // whether or not loan card should have liquidate UI
}
export const LoanCard = (props: ILoanCardProps) => {
  // Date rendering
  const {
    currentDate,
    startDate,
    endDate,
    totalDuration,
    remainingTime
  } = calculateTimeInfo(props.loanInfo?.startTime, props.loanInfo?.duration);
  console.log(remainingTime)

  // Make Loan Payment Hook
  const [payBackAmount, setPayBackAmount] = useState("0");
  const chainId = useChainId();
  const { writeAsync: approveErc20 } = useErc20Approve({
    address: props.loanInfo?.lendingDesk?.erc20.id as `0x${string}`,
    args: [nftyFinanceV1Address[chainId], BigInt(payBackAmount)],
  });
  const { config: makeLoanPaymentConfig } =
    usePrepareNftyFinanceV1MakeLoanPayment({
      args: [
        BigInt(props.loanInfo?.id || 0), // loan ID
        BigInt(payBackAmount), // amout
      ],
  });
  const { writeAsync: makeLoanPaymentWrite } = useNftyFinanceV1MakeLoanPayment(makeLoanPaymentConfig)
  function makeLoanPayment(loanID: number) {
    console.log("loanID", loanID);
    console.log("payBackAmount", payBackAmount);
    makeLoanPaymentWrite?.()
  }

  return (
    <div className="col-sm-6 col-xl-4">
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
            <h5>{props.loanInfo?.nftCollection.id} #{props.loanInfo?.nftId}</h5>
            <div className="row g-4">
              <div className="col-6 bg-info">
                <i className="fa-regular fa-hand-holding-dollar h1 me-1"></i>
                <h6>{props.loanInfo?.amount} {props.loanInfo?.lendingDesk?.erc20.symbol}</h6>
                <small>borrowed</small>
              </div>
              <div className="col-6 bg-success">
                <i className="fa-regular fa-calendar h1 me-1"></i>
                <h6>{props.loanInfo?.amount - props.loanInfo?.amountPaidBack} {props.loanInfo?.lendingDesk?.erc20.symbol}</h6>
                <small>payoff amount</small>
              </div>
              <div className="col-12">
                <h5 className="text-start">{remainingTime}</h5>
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
            {props.payback ?
            <PopupTransaction
              btnClass="btn btn-primary btn-lg mt-4"
              btnText="Pay Back"
              modalId="txModal"
              modalBtnText="Pay Now"
              modalTitle="Pay Back Loan"
              modalContent={
                <div>
                  <small>Loan Details</small>
                  <p>[Collection Name] #{props.loanInfo?.nftId}</p>
                  <div className="row g-4">
                    <div className="col-6 bg-secondary">
                      <h6>{props.loanInfo?.amount} {props.loanInfo?.lendingDesk?.erc20.symbol}</h6>
                      <small>original borrow</small>
                    </div>
                    <div className="col-6 bg-secondary">
                      <h6>{props.loanInfo.interest} %</h6>
                      <small>interest date</small>
                    </div>
                    <div className="col-6 bg-secondary">
                      <h6>[x] days / [x] days</h6>
                      <small>loan duration</small>
                    </div>
                    <div className="col-6 bg-secondary">
                      <h6>[x]{props.loanInfo?.lendingDesk?.erc20.symbol}</h6>
                      <small>amount due on expiry date</small>
                    </div>
                    <div className="col-12 bg-success">
                      <h6>[x]{props.loanInfo?.lendingDesk?.erc20.symbol}</h6>
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
                    <span>{props.loanInfo?.lendingDesk?.erc20.symbol}</span>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => makeLoanPayment(1)}>
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
  );
};
