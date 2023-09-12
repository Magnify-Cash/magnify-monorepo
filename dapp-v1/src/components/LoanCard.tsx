import { useState } from "react";
import { PopupTransaction } from "@/components";

/*
TODO
- add typing for loaninfo
- calculate date/time
- ensure all [] placeholders are complete
*/


// Interface
interface ILoanCardProps {
  loanInfo: object | null; // loan info object
  payback?: boolean; // whether or not loan card should have payback UI
  liquidate?:boolean; // whether or not loan card should have liquidate UI
}

export const LoanCard = (props: ILoanCardProps) => {
  // modal submit
  const [payBackAmount, setPayBackAmount] = useState("0");
  function handleModalSubmit(loanID: number) {
    console.log("loanID", loanID);
    console.log("payBackAmount", payBackAmount);
  }

  console.log(props)
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
                <h5 className="text-start">{props.loanInfo?.duration} Days Left</h5>
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
                  <p className="text-start m-0">{props.loanInfo?.startTime}</p>
                  <small>loan issued</small>
                </div>
                <div className="end">
                  <p className="text-end m-0">[due date]</p>
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
                  <button type="button" className="btn btn-primary" onClick={() => handleModalSubmit(1)}>
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
