import { PopupTransaction } from "@/components";
import { calculateTimeInfo, formatTimeInfo, fromWei, toWei } from "@/helpers/utils";
import {
  nftyFinanceV1Address,
  useErc20Allowance,
  useErc20Approve,
  useNftyFinanceV1LiquidateDefaultedLoan,
  useNftyFinanceV1MakeLoanPayment,
  usePrepareNftyFinanceV1LiquidateDefaultedLoan,
  usePrepareNftyFinanceV1MakeLoanPayment,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAccount, useChainId, useWaitForTransaction } from "wagmi";
import { Loan } from "../../.graphclient";

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

  // OK
  return loans.map((loan: Loan) => {
    // Date/Time info
    const [timeInfo, setTimeInfo] = useState(
      calculateTimeInfo(loan?.startTime, loan?.duration),
    );
    useEffect(() => {
      const intervalId = setInterval(() => {
        setTimeInfo(calculateTimeInfo(loan?.startTime, loan?.duration));
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }, [loan?.startTime, loan?.duration]);

    const [payBackAmount, setPayBackAmount] = useState("0");
    const [checked, setChecked] = useState(false);
    const chainId = useChainId();
    const { address } = useAccount();

    //approveErc20 hook
    const { data: approveErc20TransactionData, writeAsync: approveErc20 } =
      useErc20Approve({
        address: loan?.lendingDesk?.erc20.id as `0x${string}`,
        args: [
          nftyFinanceV1Address[chainId],
          toWei(payBackAmount, loan?.lendingDesk?.erc20?.decimals),
        ],
      });

    const { data: approvalData, refetch: refetchApprovalData } = useErc20Allowance({
      address: loan?.lendingDesk?.erc20.id as `0x${string}`,
      args: [address as `0x${string}`, nftyFinanceV1Address[chainId]],
    });

    //On successful transaction of approveErc20 hook, refetch the approval data
    //Also refetch makeLoanPaymentConfig to update makeLoanPaymentWrite hook
    useWaitForTransaction({
      hash: approveErc20TransactionData?.hash as `0x${string}`,
      onSuccess(data) {
        refetchApprovalData();
        makeLoanPaymentRefetch();
      },
    });

    //update checked state on approvalData change and payBackAmount change
    useEffect(() => {
      if (!approvalData) {
        setChecked(false);
        return;
      }
      if (
        Number(fromWei(approvalData, loan?.lendingDesk?.erc20?.decimals)) >=
        Number(payBackAmount)
      ) {
        setChecked(true);
      } else {
        setChecked(false);
      }
    }, [payBackAmount, approvalData]);

    // Make Loan Payment Hook
    //This is auto refetched by default when query args change
    const { config: makeLoanPaymentConfig, refetch: makeLoanPaymentRefetch } =
      usePrepareNftyFinanceV1MakeLoanPayment({
        args: [
          BigInt(loan?.id || 0), // loan ID
          toWei(payBackAmount, loan?.lendingDesk?.erc20?.decimals), // amount
        ],
      });

    const { writeAsync: makeLoanPaymentWrite } =
      useNftyFinanceV1MakeLoanPayment(makeLoanPaymentConfig);

    // Liquidate Overdue loan Hook
    const { config: liquidateConfig, refetch: liquidateRefetch } =
      usePrepareNftyFinanceV1LiquidateDefaultedLoan({
        enabled: false,
        args: [
          BigInt(loan?.id || 0), // loan ID
        ],
      });

    const { writeAsync: liquidateWrite } =
      useNftyFinanceV1LiquidateDefaultedLoan(liquidateConfig);
    async function liquidateOverdueLoan(loanID: string) {
      console.log("loanID", loanID);
      await liquidateRefetch();
      await liquidateWrite?.();
    }

    // Checkbox click function
    async function approveERC20TokenTransfer() {
      if (Number(payBackAmount) <= 0) {
        console.log("insufficient allowance");
        return;
      }
      if (checked) {
        console.log("already approved");
        return;
      }
      await approveErc20();
    }

    //modal submit function
    async function makeLoanPayment(loanID: string) {
      console.log("loanID", loanID);
      console.log("payBackAmount", payBackAmount);
      await makeLoanPaymentWrite?.();
    }

    return (
      <div className="col-md-6 col-xl-4 mb-4" key={loan?.id}>
        <div className="card border-0 shadow rounded-4 h-100">
          <div className="card-body p-4">
            <div className="specific-w-100 specific-h-100 d-flex align-items-center justify-content-center rounded-circle overflow-hidden mx-auto position-relative">
              <img
                className="object-fit-cover"
                src="theme/images/image-1.png"
                alt="test"
                height="100%"
              />
              {status === "Defaulted" ? (
                <div
                  className="position-absolute top-50 start-50 translate-middle z-1 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "hsla(var(--bs-black-hsl), 0.25)" }}
                >
                  <img
                    src="theme/images/wasted.png"
                    className="img-fluid mt-4"
                    alt="Wasted"
                  />
                </div>
              ) : null}
            </div>
            <div className="h5 text-center mt-3">
              {loan?.nftCollection.id} #{loan?.nftId}
            </div>
            <div className="container-fluid g-0 mt-4">
              <div className="row g-3">
                <div className="col-sm">
                  <div
                    className={`p-2 rounded-3 ${
                      status === "Defaulted" ? "bg-secondary-subtle" : "bg-info-subtle"
                    } text-center`}
                  >
                    <div className="text-info-emphasis h3 mb-3">
                      <i className="fa-light fa-hand-holding-dollar"></i>
                    </div>
                    <div className="h6 mb-0">
                      {fromWei(loan?.amount, loan?.lendingDesk?.erc20.decimals)}{" "}
                      {loan?.lendingDesk?.erc20.symbol}
                    </div>
                    <div>borrowed</div>
                  </div>
                </div>
                <div className="col-sm">
                  <div
                    className={`p-2 rounded-3 ${
                      status === "Defaulted"
                        ? "bg-secondary-subtle"
                        : "bg-success-subtle"
                    } text-center`}
                  >
                    <div className="text-success-emphasis h3 mb-3">
                      <i className="fa-light fa-calendar-lines"></i>
                    </div>
                    <div className="h6 mb-0">
                      {parseInt(
                        fromWei(loan?.amount, loan?.lendingDesk?.erc20.decimals),
                      ) -
                        parseInt(
                          fromWei(
                            loan?.amountPaidBack,
                            loan?.lendingDesk?.erc20.decimals,
                          ),
                        )}{" "}
                      {loan?.lendingDesk?.erc20.symbol}
                    </div>
                    <div>payoff</div>
                  </div>
                </div>
                <div className="mt-2">
                  {status === "Active" ? (
                    <div className="mt-2">
                      <strong className="fs-4">{timeInfo.remainingTime}</strong>
                      <span className="text-body-secondary">{` left`}</span>
                    </div>
                  ) : status === "Defaulted" ? (
                    <div className="mt-2">
                      <strong className="fs-4">{`0 days`}</strong>
                      <span className="text-body-secondary">{` left`}</span>
                    </div>
                  ) : status === "Completed" ? (
                    <div className="mt-2">
                      <strong className="fs-5">{`Complete`}</strong>
                    </div>
                  ) : null}
                  <div className="progress mt-3 shadow-none">
                    {status === "Active" ? (
                      <div
                        className="progress-bar text-bg-success"
                        role="progressbar"
                        aria-valuenow={timeInfo.calculateProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: `${timeInfo.calculateProgress}%` }}
                      />
                    ) : status === "Defaulted" ? (
                      <div
                        className="progress-bar text-bg-danger"
                        role="progressbar"
                        aria-label="Progress"
                        aria-valuenow={100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: "100%" }}
                      ></div>
                    ) : status === "Completed" ? (
                      <div
                        className="progress-bar text-bg-success"
                        role="progressbar"
                        aria-label="Progress"
                        aria-valuenow={100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: "100%" }}
                      ></div>
                    ) : null}
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <div className="text-body-secondary pe-2 lh-sm">
                      {formatTimeInfo(timeInfo.startDate)}
                      <br />
                      <small>loan issued</small>
                    </div>
                    <div className="text-body-secondary pe-2 lh-sm">
                      {formatTimeInfo(timeInfo.endDate)}
                      <br />
                      <small>due date</small>
                    </div>
                  </div>
                </div>
              </div>
              {payback ? (
                <PopupTransaction
                  btnClass="btn btn-primary btn-lg rounded-pill w-100 d-block mt-3"
                  btnText="Pay Back"
                  modalId={`paybackModal${loan?.id}`}
                  modalTitle="Pay Back Loan"
                  modalContent={
                    <div className="modal-body">
                      <p className="text-body-secondary">Loan Details</p>
                      <div className="d-flex align-items-center">
                        {/* Replace fixed image with proper image */}
                        <img
                          src="theme/images/image-1.png"
                          className="img-fluid flex-shrink-0 me-3"
                          width="32"
                          alt={`${loan?.nftCollection.id} ${loan?.nftId}`}
                        />
                        <h6 className="m-0">
                          {loan?.nftCollection.id} #{loan?.nftId}
                        </h6>
                      </div>
                      <div className="container-fluid g-0 mt-3">
                        <div className="row g-3">
                          <div className="col-12 col-sm-6">
                            <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="h3">
                                  {fromWei(
                                    loan?.amount,
                                    loan?.lendingDesk?.erc20.decimals,
                                  )}
                                </div>
                                <span className="text-body-secondary ms-2">
                                  {loan?.lendingDesk?.erc20.symbol}
                                </span>
                              </div>
                              <div className="text-body-secondary">
                                original borrow amount
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-sm-6">
                            <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="h3">{loan?.interest / 100}</div>
                                <span className="text-body-secondary ms-2">%</span>
                              </div>
                              <div className="text-body-secondary">interest rate</div>
                            </div>
                          </div>
                          <div className="col-12 col-sm-6">
                            <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="h5">{timeInfo.elapsedTime}</div>
                                <span className="text-body-secondary ms-2">{}</span>
                              </div>
                              <div className="text-body-secondary">loan duration</div>
                            </div>
                          </div>
                          <div className="col-12 col-sm-6">
                            <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="h3">[x]</div>
                                <span className="text-body-secondary ms-2">
                                  {loan?.lendingDesk?.erc20.symbol}
                                </span>
                              </div>
                              <div className="text-body-secondary">
                                amount due on expiry date
                              </div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="h-100 rounded bg-success-subtle text-center p-2">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="h3">[x]</div>
                                <span className="text-body-secondary ms-2">
                                  {loan?.lendingDesk?.erc20.symbol}
                                </span>
                              </div>
                              <div className="text-body-secondary">
                                current payoff amount
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-top">
                        <label htmlFor="enter-amount" className="form-label">
                          Enter Amount
                        </label>
                        <div className="d-flex align-items-center">
                          <input
                            type="number"
                            className="form-control form-control-lg flex-grow-1"
                            id="enter-amount"
                            placeholder="Enter Amount"
                            value={payBackAmount}
                            onChange={(e) => setPayBackAmount(e.target.value)}
                          />
                          {/* Fix image for currency */}
                          <div className="d-flex align-items-center flex-shrink-0 ms-3">
                            <img
                              src="theme/images/usdc.svg"
                              className="img-fluid flex-shrink-0 me-2"
                              width="32"
                              alt={loan?.lendingDesk?.erc20.symbol}
                            />
                            <span>{loan?.lendingDesk?.erc20.symbol}</span>
                          </div>
                        </div>
                        <div className="form-check mt-3 d-flex align-items-center ">
                          <input
                            checked={checked}
                            onClick={() => approveERC20TokenTransfer()}
                            className="form-check-input me-3 align-center"
                            type="checkbox"
                            value=""
                            id="flexCheckChecked"
                            style={{ transform: "scale(1.5)" }}
                          />
                          <label
                            className="form-check-label "
                            htmlFor="flexCheckChecked"
                          >
                            {`Grant permission for ${
                              loan?.lendingDesk?.erc20.symbol || "USDT"
                            } transfer by checking this box.`}
                          </label>
                        </div>
                        <button
                          type="button"
                          disabled={!checked}
                          className="btn btn-primary btn-lg rounded-pill d-block w-100 mt-3 py-3 lh-1"
                          onClick={() => makeLoanPayment(loan?.id)}
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  }
                />
              ) : null}
              {liquidate ? (
                <PopupTransaction
                  btnClass="btn btn-primary btn-lg mt-4"
                  btnText="Liquidate Overdue Loan"
                  modalId={`liquidateModal${loan?.id}`}
                  modalTitle="Liquidate Overdue Loan"
                  modalContent={
                    <div>
                      <small>Loan Details</small>
                      <p>
                        {loan?.nftCollection.id} #{loan?.nftId}
                      </p>
                      <div className="row g-4">
                        <div className="col-6 bg-secondary">
                          <h6>
                            {loan?.amount} {loan?.lendingDesk?.erc20.symbol}
                          </h6>
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
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => liquidateOverdueLoan(loan?.id)}
                      >
                        Liquidate Overdue Loan
                      </button>
                    </div>
                  }
                />
              ) : null}
            </div>
          </div>
          {status === "Defaulted" ? (
            <i className="fa-solid fa-times-circle text-danger-emphasis fs-4 position-absolute top-0 start-0 m-2"></i>
          ) : status === "Completed" ? (
            <i className="fa-solid fa-check-circle text-success-emphasis fs-4 position-absolute top-0 start-0 m-2"></i>
          ) : null}
        </div>
      </div>
    );
  });
};
