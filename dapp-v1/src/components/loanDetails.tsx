import { Blockies, PopupTransaction } from "@/components";
import { useToastContext } from "@/helpers/CreateToast";
import refetchData from "@/helpers/refetchData";
import { calculateTimeInfo, formatTimeInfo, fromWei, toWei } from "@/helpers/utils";
import {
  nftyFinanceV1Address,
  useErc20Allowance,
  useErc20Approve,
  useNftyFinanceV1GetLoanAmountDue,
  useNftyFinanceV1LiquidateDefaultedLoan,
  useNftyFinanceV1MakeLoanPayment,
  usePrepareNftyFinanceV1LiquidateDefaultedLoan,
  usePrepareNftyFinanceV1MakeLoanPayment,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useWaitForTransaction } from "wagmi";
import type { Loan } from "../../.graphclient";
import ErrorDetails from "./ErrorDetails";
import { Spinner } from "./LoadingIndicator";
import TransactionDetails from "./TransactionDetails";

interface LoanDetailsProps {
  loan: Loan;
  payback?: boolean;
  liquidate?: boolean;
  status: string;
  reexecuteQuery?: () => void;
}

// LoanDetails component
const LoanDetails = ({
  loan,
  payback,
  liquidate,
  status,
  reexecuteQuery,
}: LoanDetailsProps) => {
  // Initial state can be payback or liquidate
  const initialAction = payback ? "payback" : "liquidate";

  //action can be set to resolve when the resolve loan button is clicked
  const [action, setAction] = useState<"payback" | "liquidate" | "resolve">(
    initialAction,
  );

  const { addToast, closeToast } = useToastContext();
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

  const [modalOpen, setModalOpen] = useState(false);
  const [loanActiveForOneHour, setLoanActiveForOneHour] = useState(true);
  const [payBackAmount, setPayBackAmount] = useState("0");
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [actionIsLoading, setActionIsLoading] = useState<boolean>(false);
  //checked state for the checkbox on make payment modal
  const [checked, setChecked] = useState(false);
  //checked state for the checkbox on resolve loan modal
  const [checkedResolveLoan, setCheckedResolveLoan] = useState(false);
  const chainId = useChainId();
  const { address } = useAccount();

  //get loan amount due for resolving the loan using GetLoanAmountDue hook
  const {
    data: loanAmountDue,
    refetch: loanAmountDueRefetch,
    error: loanAmountDueError,
  } = useNftyFinanceV1GetLoanAmountDue({
    args: [BigInt(loan?.id)],
    enabled: status === "Active",
    onSuccess(data) {
      setLoanActiveForOneHour(true);
    },
    onError(error) {
      console.error(error);
      if (error.message.includes("LoanMustBeActiveForMin1Hour")) {
        setLoanActiveForOneHour(false);
        return;
      }
      //Display error toast only if the error is not LoanMustBeActiveForMin1Hour
      addToast("Transaction Failed", <ErrorDetails error={error.message} />, "error");
    },
  });

  //approveErc20 hook
  const { data: approveErc20TransactionData, writeAsync: approveErc20 } =
    useErc20Approve({
      address: loan?.lendingDesk?.erc20.id as `0x${string}`,
      args: [
        nftyFinanceV1Address[chainId],
        toWei(payBackAmount, loan?.lendingDesk?.erc20?.decimals),
      ],
    });

  //approveErc20 hook for resolving loan
  const { data: approveErc20ResolveLoanData, writeAsync: approveErc20ResolveLoan } =
    useErc20Approve({
      address: loan?.lendingDesk?.erc20.id as `0x${string}`,
      args: [nftyFinanceV1Address[chainId], loanAmountDue ?? BigInt(0)],
    });

  //On successful transaction of approveErc20ResolveLoanData hook, refetch the approval data
  //Also refetch resolveLoanPaymentConfig to update resolveLoanPaymentWrite hook
  //and call the resolve loan function
  useWaitForTransaction({
    hash: approveErc20ResolveLoanData?.hash as `0x${string}`,
    onSuccess(data) {
      refetchApprovalData();
      makeLoanPaymentRefetch();
      resolveLoanPaymentRefetch();
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        <TransactionDetails transactionHash={data.transactionHash} />,
        "success",
      );
    },
    onError(error) {
      console.error(error);

      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast("Transaction Failed", <ErrorDetails error={error.message} />, "error");
    },
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
      resolveLoanPaymentRefetch();
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        <TransactionDetails transactionHash={data.transactionHash} />,
        "success",
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast("Transaction Failed", <ErrorDetails error={error.message} />, "error");
    },
    onSettled() {
      setApprovalIsLoading(false);
    },
  });

  //update checked state on approvalData change and payBackAmount change
  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      setCheckedResolveLoan(false);
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
    if (
      Number(fromWei(approvalData, loan?.lendingDesk?.erc20?.decimals)) >=
      Number(fromWei(loanAmountDue ?? BigInt(0), loan?.lendingDesk?.erc20?.decimals))
    ) {
      setCheckedResolveLoan(true);
    } else {
      setCheckedResolveLoan(false);
    }
  }, [payBackAmount, approvalData]);

  // Make Loan Payment Hook
  // This is auto refetched by default when query args change
  const {
    config: makeLoanPaymentConfig,
    refetch: makeLoanPaymentRefetch,
    error: makeLoanPaymentError,
  } = usePrepareNftyFinanceV1MakeLoanPayment({
    args: [
      BigInt(loan?.id || 0), // loan ID
      toWei(payBackAmount, loan?.lendingDesk?.erc20?.decimals), // amount
      false,
    ],
    enabled: Number(payBackAmount) > 0 && checked,
  });
  const { data: makeLoanPaymentData, writeAsync: makeLoanPaymentWrite } =
    useNftyFinanceV1MakeLoanPayment(makeLoanPaymentConfig);

  // Resolve Loan Hook
  //This is enabled when resolve is set to true
  const {
    config: resolveLoanPaymentConfig,
    refetch: resolveLoanPaymentRefetch,
    error: resolveLoanPaymentError,
  } = usePrepareNftyFinanceV1MakeLoanPayment({
    args: [
      BigInt(loan?.id || 0), // loan ID
      BigInt(0), // amount doesn't matter when resolving loan
      true, // set to true to resolve loan
    ],
    enabled: checkedResolveLoan,
  });
  const { data: resolveLoanPaymentData, writeAsync: resolveLoanPaymentWrite } =
    useNftyFinanceV1MakeLoanPayment(resolveLoanPaymentConfig);

  // Liquidate Overdue loan Hook
  const { config: liquidateConfig, refetch: liquidateRefetch } =
    usePrepareNftyFinanceV1LiquidateDefaultedLoan({
      enabled: !timeInfo.isTimeLeft,
      args: [
        BigInt(loan?.id || 0), // loan ID
      ],
    });

  const { data: liquidateData, writeAsync: liquidateWrite } =
    useNftyFinanceV1LiquidateDefaultedLoan(liquidateConfig);

  async function liquidateOverdueLoan(loanID: string) {
    setActionIsLoading(true);
    try {
      await liquidateRefetch();
      if (typeof liquidateWrite !== "function") {
        throw new Error("liquidateWrite is not a function");
      }
      await liquidateWrite();
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
      setActionIsLoading(false);
    }
  }

  // Checkbox click function
  async function approveERC20TokenTransfer() {
    if (Number(payBackAmount) <= 0) {
      addToast("Error", <ErrorDetails error={"insufficient allowance"} />, "error");
      return;
    }
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);
    try {
      await approveErc20();
    } catch (error: any) {
      setApprovalIsLoading(false);
    }
  }

  //modal submit function
  async function makeLoanPayment(loanID: string) {
    setActionIsLoading(true);
    try {
      await makeLoanPaymentRefetch();
      if (typeof makeLoanPaymentWrite !== "function") {
        throw new Error("liquidateWrite is not a function");
      }
      await makeLoanPaymentWrite();
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
      setActionIsLoading(false);
    }
  }

  //loan resolve function
  //This function also needs to be called after approveErc20 hook to approve the token transfer

  //checkbox click function on resolve loan popup modal
  async function approveTokenTransferResolveLoan() {
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);
    try {
      //calling approveErc20ResolveLoan hook to approve the token transfer
      if (loanAmountDue) {
        await approveErc20ResolveLoan();
      } else {
        loanAmountDueRefetch();
        throw new Error(loanAmountDueError?.message || "loanAmountDue is not defined");
      }
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
    }
    setApprovalIsLoading(false);
  }

  async function resolveLoan(loanID: string) {
    setActionIsLoading(true);
    try {
      if (typeof resolveLoanPaymentWrite === "function") {
        await resolveLoanPaymentWrite();
      } else {
        resolveLoanPaymentRefetch();
        throw new Error(
          resolveLoanPaymentError?.message ||
            "resolveLoanPaymentWrite is not defined or not a function",
        );
      }
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
      setActionIsLoading(false);
    }
  }

  //actionMap is used to call the respective function based on the type of action
  const actionMap = {
    payback: makeLoanPayment,
    liquidate: liquidateOverdueLoan,
    resolve: resolveLoan,
  };

  //actionDataMap is used to aceess the action data based on the action
  const actionDataMap = {
    payback: makeLoanPaymentData,
    liquidate: liquidateData,
    resolve: resolveLoanPaymentData,
  };

  //On successful transaction of makeLoanPayment/liquidate/resolve hook, display respective toast
  useWaitForTransaction({
    hash: actionDataMap[action]?.hash as `0x${string}`,
    onSuccess(data) {
      reexecuteQuery ? refetchData(reexecuteQuery) : null;
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        <TransactionDetails transactionHash={data.transactionHash} />,
        "success",
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast("Transaction Failed", <ErrorDetails error={error.message} />, "error");
    },
    onSettled() {
      setActionIsLoading(false);
    },
  });
  //This hook is used to display loading toast when the approve transaction is pending

  useEffect(() => {
    if (approveErc20TransactionData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [approveErc20TransactionData?.hash]);

  //This hook is used to display loading toast when the approve transaction for resolve loan is pending

  useEffect(() => {
    if (approveErc20ResolveLoanData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [approveErc20ResolveLoanData?.hash]);

  //This hook is used to display loading toast when the makeLoanPayment/liquidate/resolve transaction is pending

  useEffect(() => {
    if (actionDataMap[action]?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [actionDataMap[action]?.hash]);

  return (
    <div className="col-md-6 col-xl-4 mb-4" key={loan?.id}>
      <div className="card border-0 shadow rounded-4 h-100">
        <div className="card-body p-4">
          <div className="specific-w-100 specific-h-100 d-flex align-items-center justify-content-center rounded-circle overflow-hidden mx-auto position-relative">
            <Blockies seed={`${loan?.nftId}-${loan?.nftCollection.id}`} size={32} />
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
                    <i className="fa-light fa-hand-holding-dollar" />
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
                    status === "Defaulted" ? "bg-secondary-subtle" : "bg-success-subtle"
                  } text-center`}
                >
                  <div className="text-success-emphasis h3 mb-3">
                    <i className="fa-light fa-calendar-lines" />
                  </div>
                  <div className="h6 mb-0">
                    {Number.parseFloat(
                      fromWei(loan?.amount, loan?.lendingDesk?.erc20.decimals),
                    ) -
                      Number.parseFloat(
                        fromWei(
                          loan?.amountPaidBack,
                          loan?.lendingDesk?.erc20.decimals,
                        ),
                      )}{" "}
                    {loan?.lendingDesk?.erc20.symbol}
                  </div>
                  <div>unpaid</div>
                </div>
              </div>
              <div className="mt-2">
                {status === "Active" ? (
                  <div className="mt-2">
                    <strong className="fs-4">{timeInfo.remainingTime}</strong>
                    <span className="text-body-secondary">{" left"}</span>
                  </div>
                ) : status === "Defaulted" ? (
                  <div className="mt-2">
                    <strong className="fs-4">{"0 days"}</strong>
                    <span className="text-body-secondary">{" left"}</span>
                  </div>
                ) : status === "Resolved" ? (
                  <div className="mt-2">
                    <strong className="fs-5">{"Complete"}</strong>
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
                    />
                  ) : status === "Resolved" ? (
                    <div
                      className="progress-bar text-bg-success"
                      role="progressbar"
                      aria-label="Progress"
                      aria-valuenow={100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "100%" }}
                    />
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
            {/* Make Payment button */}
            {payback ? (
              <PopupTransaction
                btnClass="btn btn-primary btn-lg rounded-pill w-100 d-block mt-3"
                btnText="Make Payment"
                btnOnClick={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}
                disabled={!loanActiveForOneHour}
                modalId={`paybackModal${loan?.id}`}
                modalTitle="Make Loan Payment"
                modalContent={
                  <div className="modal-body">
                    <p className="text-body-secondary">Loan Details</p>
                    <div className="d-flex align-items-center">
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
                        <div className="col-12">
                          <div className="h-100 rounded bg-info-subtle text-center p-2">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="h5">{timeInfo.elapsedTime}</div>
                              <span className="text-body-secondary ms-2">{}</span>
                            </div>
                            <div className="text-body-secondary">loan duration</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="h-100 rounded bg-success-subtle text-center p-2">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="h3">
                                {loanAmountDue
                                  ? fromWei(
                                      loanAmountDue,
                                      loan?.lendingDesk?.erc20?.decimals,
                                    )
                                  : "0"}
                              </div>
                              <span className="text-body-secondary ms-2">
                                {loan?.lendingDesk?.erc20.symbol}
                              </span>
                            </div>
                            <div className="text-body-secondary">
                              total remaining balance
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
                        <div className="d-flex align-items-center flex-shrink-0 ms-3">
                          <span>{loan?.lendingDesk?.erc20.symbol}</span>
                        </div>
                      </div>
                      <div className="form-check mt-3 d-flex align-items-center ">
                        <input
                          disabled={approvalIsLoading}
                          checked={checked}
                          onClick={() => approveERC20TokenTransfer()}
                          className="form-check-input me-3 align-center"
                          type="checkbox"
                          value=""
                          id="flexCheckChecked"
                          style={{ transform: "scale(1.5)" }}
                          hidden={approvalIsLoading}
                        />
                        <Spinner show={approvalIsLoading} size="sm" />
                        <label
                          className={`form-check-label ${
                            approvalIsLoading ? "ms-2" : ""
                          }`}
                          htmlFor="flexCheckChecked"
                        >
                          {`Grant permission for ${
                            loan?.lendingDesk?.erc20.symbol || ""
                          } transfer by checking this box.`}
                        </label>
                      </div>
                      <button
                        type="button"
                        disabled={!checked || actionIsLoading}
                        className="btn btn-primary btn-lg rounded-pill d-block w-100 mt-3 py-3 lh-1"
                        onClick={() => actionMap.payback(loan?.id)}
                      >
                        {actionIsLoading ? (
                          <Spinner show={actionIsLoading} />
                        ) : (
                          " Pay Now"
                        )}
                      </button>
                    </div>
                  </div>
                }
              />
            ) : null}
            {/* display resolve loan modal only if payback is true */}
            {/* Resolve Loan Button */}
            {payback ? (
              <PopupTransaction
                btnClass="btn btn-primary btn-lg rounded-pill w-100 d-block mt-3"
                btnText="Resolve Loan"
                btnOnClick={() => {
                  setAction("resolve");
                  setModalOpen(true);
                }}
                onClose={() => {
                  setAction(initialAction);
                  setModalOpen(false);
                }}
                disabled={!loanActiveForOneHour}
                modalId={`resolveLoanModal${loan?.id}`}
                modalTitle="Resolve Loan"
                modalContent={
                  <div className="modal-body">
                    <p className="text-body-secondary">Loan Details</p>
                    <div className="d-flex align-items-center">
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
                        <div className="col-12">
                          <div className="h-100 rounded bg-info-subtle text-center p-2">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="h5">{timeInfo.elapsedTime}</div>
                              <span className="text-body-secondary ms-2">{}</span>
                            </div>
                            <div className="text-body-secondary">loan duration</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="h-100 rounded bg-success-subtle text-center p-2">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="h3">
                                {loanAmountDue
                                  ? fromWei(
                                      loanAmountDue,
                                      loan?.lendingDesk?.erc20?.decimals,
                                    )
                                  : "0"}
                              </div>
                              <span className="text-body-secondary ms-2">
                                {loan?.lendingDesk?.erc20.symbol}
                              </span>
                            </div>
                            <div className="text-body-secondary">
                              total remaining balance
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
                          disabled
                          type="number"
                          className="form-control form-control-lg flex-grow-1"
                          id="enter-amount"
                          placeholder="Enter Amount"
                          value={
                            loanAmountDue
                              ? fromWei(
                                  loanAmountDue,
                                  loan?.lendingDesk?.erc20?.decimals,
                                )
                              : "0"
                          }
                        />
                        <div className="d-flex align-items-center flex-shrink-0 ms-3">
                          <span>{loan?.lendingDesk?.erc20.symbol}</span>
                        </div>
                      </div>
                      <div className="form-check mt-3 d-flex align-items-center ">
                        <input
                          disabled={approvalIsLoading}
                          checked={checkedResolveLoan}
                          onClick={() => approveTokenTransferResolveLoan()}
                          className="form-check-input me-3 align-center"
                          type="checkbox"
                          value=""
                          id="flexCheckChecked"
                          style={{ transform: "scale(1.5)" }}
                          hidden={approvalIsLoading}
                        />
                        <Spinner show={approvalIsLoading} size="sm" />
                        <label
                          className={`form-check-label ${
                            approvalIsLoading ? "ms-2" : ""
                          }`}
                          htmlFor="flexCheckChecked"
                        >
                          {`Grant permission for ${
                            loan?.lendingDesk?.erc20.symbol || ""
                          } transfer by checking this box.`}
                        </label>
                      </div>
                      <button
                        type="button"
                        disabled={!checkedResolveLoan || actionIsLoading}
                        className="btn btn-primary btn-lg rounded-pill d-block w-100 mt-3 py-3 lh-1"
                        onClick={() => actionMap.resolve(loan?.id)}
                      >
                        {actionIsLoading ? (
                          <Spinner show={actionIsLoading} />
                        ) : (
                          "Resolve Now"
                        )}
                      </button>
                    </div>
                  </div>
                }
              />
            ) : null}
            {/* Liquidate Overdue Loan Button */}
            {liquidate ? (
              <PopupTransaction
                btnClass="btn btn-primary btn-lg rounded-pill w-100 d-block mt-3"
                btnText="Liquidate Overdue Loan"
                disabled={!loanActiveForOneHour}
                btnOnClick={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}
                modalId={`liquidateModal2${loan?.id}`}
                modalTitle="Liquidate Overdue Loan"
                modalContent={
                  <div className="modal-body">
                    <p className="text-body-secondary">Loan Details</p>
                    <div className="d-flex align-items-center">
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
                        <div className="col-12">
                          <div className="h-100 rounded bg-info-subtle text-center p-2">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="h5">{timeInfo.elapsedTime}</div>
                              <span className="text-body-secondary ms-2">{}</span>
                            </div>
                            <div className="text-body-secondary">loan duration</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="h-100 rounded bg-success-subtle text-center p-2">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="h3">
                                {fromWei(
                                  loanAmountDue ?? BigInt("0"),
                                  loan?.lendingDesk?.erc20?.decimals,
                                )}
                              </div>
                              <span className="text-body-secondary ms-2">
                                {loan?.lendingDesk?.erc20.symbol}
                              </span>
                            </div>
                            <div className="text-body-secondary">
                              total remaining balance
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-top">
                      <button
                        type="button"
                        disabled={actionIsLoading}
                        className="btn btn-primary btn-lg rounded-pill d-block w-100 mt-3 py-3 lh-1"
                        onClick={() => actionMap.liquidate(loan?.id)}
                      >
                        {actionIsLoading ? (
                          <Spinner show={actionIsLoading} />
                        ) : (
                          "Liquidate Overdue Loan"
                        )}
                      </button>
                    </div>
                  </div>
                }
              />
            ) : null}
          </div>
          {!loanActiveForOneHour ? (
            <p className="text-danger mt-1">
              {"Loan must be active for at least one hour for interaction."}
            </p>
          ) : null}
        </div>
        {status === "Defaulted" ? (
          <i className="fa-solid fa-times-circle text-danger-emphasis fs-4 position-absolute top-0 start-0 m-2" />
        ) : status === "Resolved" ? (
          <i className="fa-solid fa-check-circle text-success-emphasis fs-4 position-absolute top-0 start-0 m-2" />
        ) : null}
      </div>
    </div>
  );
};

export default LoanDetails;
