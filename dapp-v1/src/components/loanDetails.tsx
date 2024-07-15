import { Blockies, PopupTransaction } from "@/components";
import { useToastContext } from "@/helpers/CreateToast";
import { calculateTimeInfo, formatTimeInfo, fromWei, toWei } from "@/helpers/utils";
import {
  magnifyCashV1Address,
  useReadErc20Allowance,
  useReadMagnifyCashV1GetLoanAmountDue,
  useSimulateMagnifyCashV1LiquidateDefaultedLoan,
  useSimulateMagnifyCashV1MakeLoanPayment,
  useWriteErc20Approve,
  useWriteMagnifyCashV1LiquidateDefaultedLoan,
  useWriteMagnifyCashV1MakeLoanPayment,
} from "@/wagmi-generated";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";
import type { Loan } from "../../.graphclient";
import ErrorDetails from "./ErrorDetails";
import { Spinner } from "./LoadingIndicator";
import TransactionDetails from "./TransactionDetails";

interface LoanDetailsProps {
  loan: Loan;
  payback?: boolean;
  liquidate?: boolean;
  isLender?: boolean;
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
  isLender,
}: LoanDetailsProps) => {
  /*
  wagmi hooks
  */
  const chainId = useChainId();
  const { address } = useAccount();

  /*
  form hooks / functions
  */
  const [payBackAmount, setPayBackAmount] = useState("0");
  //checked state for the checkbox on make payment modal
  const [checked, setChecked] = useState(false);
  //checked state for the checkbox on resolve loan modal
  const [checkedResolveLoan, setCheckedResolveLoan] = useState(false);

  //reset the form when the make payment modal is closed
  const resetForm = () => {
    setPayBackAmount("0");
  };

  // Initial state can be payback or liquidate based on the props
  const initialAction = payback ? "payback" : "liquidate";

  //action can be set to resolve when the resolve loan button is clicked
  const [action, setAction] = useState<"payback" | "liquidate" | "resolve">(
    initialAction,
  );

  // Date/Time info
  const [timeInfo, setTimeInfo] = useState(
    calculateTimeInfo(loan?.startTime, loan?.duration),
  );
  //Time information is updated every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeInfo(calculateTimeInfo(loan?.startTime, loan?.duration));
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [loan?.startTime, loan?.duration]);

  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [actionIsLoading, setActionIsLoading] = useState<boolean>(false);

  //get loan amount due for resolving the loan using GetLoanAmountDue hook
  const {
    data: loanAmountDue,
    refetch: loanAmountDueRefetch,
    error: loanAmountDueError,
    isLoading: loanAmountDueIsLoading,
    isFetched: loanAmountDueIsFetched,
  } = useReadMagnifyCashV1GetLoanAmountDue({
    args: [BigInt(loan?.id)],
    query: {
      enabled: status === "Active",
    },
  });

  /*
   Hook to check if the query data has changed
  */

  const initAmountDueRef = useRef(loanAmountDue);
  useEffect(() => {
    if (initAmountDueRef.current === null && loanAmountDue !== null) {
      initAmountDueRef.current = loanAmountDue;
    }
    //close the modal if the loan amount due has changed
    if (initAmountDueRef.current !== loanAmountDue) {
      setActionIsLoading(false);
    }
    initAmountDueRef.current = loanAmountDue;
  }, [loanAmountDue]);

  useEffect(() => {
    if (loanAmountDueError) {
      if (loanAmountDueError.message.includes("LoanMustBeActiveForMin1Hour")) {
        return;
      }
      //Display error toast only if the error is not LoanMustBeActiveForMin1Hour
      addToast("Error", <ErrorDetails error={loanAmountDueError.message} />, "error");
    }
  }, [loanAmountDueError]);

  //approveErc20 hook
  const {
    data: approveErc20TransactionData,
    writeContractAsync: approveErc20,
    error: approveErc20Error,
  } = useWriteErc20Approve();

  //approveErc20 hook for resolving loan
  const {
    data: approveErc20ResolveLoanData,
    writeContractAsync: approveErc20ResolveLoan,
    error: approveErc20ResolveLoanError,
  } = useWriteErc20Approve();

  const {
    isLoading: approveIsConfirming,
    isSuccess: approveIsConfirmed,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approveErc20TransactionData as `0x${string}`,
  });

  useEffect(() => {
    if (approveErc20Error) {
      console.error(approveErc20Error);
      addToast("Error", <ErrorDetails error={approveErc20Error.message} />, "error");
      setApprovalIsLoading(false);
    }
    if (approveConfirmError) {
      addToast("Error", <ErrorDetails error={approveConfirmError?.message} />, "error");
      setApprovalIsLoading(false);
    }
    if (approveIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (approveIsConfirmed) {
      refetchApprovalData();
      makeLoanPaymentRefetch();
      resolveLoanPaymentRefetch();
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={approveErc20TransactionData!} />,
          "success",
        );
      }
      setApprovalIsLoading(false);
    }
  }, [approveErc20Error, approveConfirmError, approveIsConfirmed, approveIsConfirming]);

  const {
    isLoading: approveResolveIsConfirming,
    isSuccess: approveResolveIsConfirmed,
    error: approveResolveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approveErc20ResolveLoanData as `0x${string}`,
  });

  useEffect(() => {
    if (approveErc20ResolveLoanError) {
      console.error(approveErc20ResolveLoanError);
      addToast(
        "Error",
        <ErrorDetails error={approveErc20ResolveLoanError.message} />,
        "error",
      );
      setApprovalIsLoading(false);
    }
    if (approveResolveConfirmError) {
      addToast(
        "Error",
        <ErrorDetails error={approveResolveConfirmError?.message} />,
        "error",
      );
      setApprovalIsLoading(false);
    }
    if (approveResolveIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (approveResolveIsConfirmed) {
      refetchApprovalData();
      makeLoanPaymentRefetch();
      resolveLoanPaymentRefetch();
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={approveErc20ResolveLoanData!} />,
          "success",
        );
      }
      setApprovalIsLoading(false);
    }
  }, [
    approveErc20ResolveLoanError,
    approveResolveConfirmError,
    approveResolveIsConfirmed,
    approveResolveIsConfirming,
  ]);

  const { data: approvalData, refetch: refetchApprovalData } = useReadErc20Allowance({
    address: loan?.lendingDesk?.erc20.id as `0x${string}`,
    args: [address as `0x${string}`, magnifyCashV1Address[chainId]],
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
    data: makeLoanPaymentConfig,
    isLoading: makeLoanPaymentConfigIsLoading,
    error: makeLoanPaymentConfigError,
    refetch: makeLoanPaymentRefetch,
  } = useSimulateMagnifyCashV1MakeLoanPayment({
    args: [
      BigInt(loan?.id || 0), // loan ID
      toWei(payBackAmount, loan?.lendingDesk?.erc20?.decimals), // amount
      false,
    ],
    query: {
      enabled: Number(payBackAmount) > 0 && checked,
    },
  });
  const {
    data: makeLoanPaymentData,
    writeContractAsync: makeLoanPaymentWrite,
    error: makeLoanPaymentError,
  } = useWriteMagnifyCashV1MakeLoanPayment();

  // Resolve Loan Hook
  //This is enabled when resolve is set to true
  const {
    data: resolveLoanPaymentConfig,
    isLoading: resolveLoanPaymentConfigIsLoading,
    error: resolveLoanPaymentConfigError,
    refetch: resolveLoanPaymentRefetch,
  } = useSimulateMagnifyCashV1MakeLoanPayment({
    args: [
      BigInt(loan?.id || 0), // loan ID
      BigInt(0), // amount doesn't matter when resolving loan
      true, // set to true to resolve loan
    ],
    query: {
      enabled: checkedResolveLoan,
    },
  });
  const {
    data: resolveLoanPaymentData,
    writeContractAsync: resolveLoanPaymentWrite,
    error: resolveLoanPaymentError,
  } = useWriteMagnifyCashV1MakeLoanPayment();

  // Liquidate Overdue loan Hook
  const {
    data: liquidateConfig,
    isLoading: liquidateConfigIsLoading,
    error: liquidateConfigError,
    refetch: liquidateRefetch,
  } = useSimulateMagnifyCashV1LiquidateDefaultedLoan({
    query: {
      enabled: !timeInfo.isTimeLeft,
    },
    args: [
      BigInt(loan?.id || 0), // loan ID
    ],
  });

  const {
    data: liquidateData,
    writeContractAsync: liquidateWrite,
    error: liquidateError,
  } = useWriteMagnifyCashV1LiquidateDefaultedLoan();

  async function liquidateOverdueLoan(loanID: string) {
    //Check if liquidateConfig is undefined or liquidateConfigError is not null
    if (!liquidateConfig || liquidateConfigError) {
      console.error("liquidateConfigError", liquidateConfigError?.message);
      addToast(
        "Error",
        <ErrorDetails
          error={
            liquidateConfigError
              ? liquidateConfigError.message
              : "Error initiating liquidation"
          }
        />,
        "error",
      );
      return;
    }
    setActionIsLoading(true);
    await liquidateWrite(liquidateConfig!.request);
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

    await approveErc20({
      address: loan?.lendingDesk?.erc20.id as `0x${string}`,
      args: [
        magnifyCashV1Address[chainId],
        toWei(payBackAmount, loan?.lendingDesk?.erc20?.decimals),
      ],
    });
  }

  //modal submit function
  async function makeLoanPayment(loanID: string) {
    //Check if makeLoanPaymentConfig is undefined or makeLoanPaymentConfigError is not null
    if (!makeLoanPaymentConfig || makeLoanPaymentConfigError) {
      console.error("makeLoanPaymentConfigError", makeLoanPaymentConfigError?.message);
      addToast(
        "Error",
        <ErrorDetails
          error={
            makeLoanPaymentConfigError
              ? makeLoanPaymentConfigError.message
              : "Error initiating loan repayment"
          }
        />,
        "error",
      );
      return;
    }
    setActionIsLoading(true);
    await makeLoanPaymentWrite(makeLoanPaymentConfig!.request);
  }

  //loan resolve function
  //This function also needs to be called after approveErc20 hook to approve the token transfer

  //checkbox click function on resolve loan popup modal
  async function approveTokenTransferResolveLoan() {
    if (checkedResolveLoan) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);

    //calling approveErc20ResolveLoan hook to approve the token transfer
    if (loanAmountDue) {
      await approveErc20ResolveLoan({
        address: loan?.lendingDesk?.erc20.id as `0x${string}`,
        args: [magnifyCashV1Address[chainId], loanAmountDue ?? BigInt(0)],
      });
    } else {
      loanAmountDueRefetch();
      addToast(
        "Error",
        <ErrorDetails error={"loanAmountDue is not defined"} />,
        "error",
      );
    }
    setApprovalIsLoading(false);
  }

  async function resolveLoan(loanID: string) {
    //Check if resolveLoanPaymentConfig is undefined or resolveLoanPaymentConfigError is not null
    if (!resolveLoanPaymentConfig || resolveLoanPaymentConfigError) {
      console.error(
        "resolveLoanPaymentConfigError",
        resolveLoanPaymentConfigError?.message,
      );
      addToast(
        "Error",
        <ErrorDetails
          error={
            resolveLoanPaymentConfigError
              ? resolveLoanPaymentConfigError.message
              : "Error initiating loan repayment"
          }
        />,
        "error",
      );
      return;
    }
    setActionIsLoading(true);
    await resolveLoanPaymentWrite(resolveLoanPaymentConfig!.request);
  }

  //actionConfigLoadingMap is used to check if the action config is loading
  const actionConfigLoadingMap = {
    payback: makeLoanPaymentConfigIsLoading,
    liquidate: liquidateConfigIsLoading,
    resolve: resolveLoanPaymentConfigIsLoading,
  };

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

  const actionErrorMap = {
    payback: makeLoanPaymentError,
    liquidate: liquidateError,
    resolve: resolveLoanPaymentError,
  };

  const {
    isLoading: actionIsConfirming,
    isSuccess: actionIsConfirmed,
    error: actionConfirmError,
  } = useWaitForTransactionReceipt({
    hash: actionDataMap[action] as `0x${string}`,
  });

  useEffect(() => {
    if (actionErrorMap[action]) {
      console.error(actionErrorMap[action]);
      addToast(
        "Error",
        <ErrorDetails error={actionErrorMap[action]?.message as string} />,
        "error",
      );
      setActionIsLoading(false);
    }
    if (actionConfirmError) {
      addToast("Error", <ErrorDetails error={actionConfirmError?.message} />, "error");
      setActionIsLoading(false);
    }
    if (actionIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (actionIsConfirmed) {
      // Close the loading toast and show success toast
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={actionDataMap[action]!} />,
          "success",
        );
      }
      // Refetch data based on the action type
      if (action === "payback") {
        loanAmountDueRefetch(); // Refetch loan amount due after successful payment
      } else {
        setActionIsLoading(false);
        reexecuteQuery ? reexecuteQuery() : null;
      }
      // Close modal
      const modal = document.getElementsByClassName("modal show")[0];
      window.bootstrap.Modal.getInstance(modal)?.hide();
    }
  }, [
    actionErrorMap[action],
    actionConfirmError,
    actionIsConfirmed,
    actionIsConfirming,
  ]);

  // get amount due
  // if still active, use getLoanAmountDue
  // if not, calculate manually
  let loanPaymentAmountDue: number;
  if (status === "Active" && loanAmountDue) {
    const _ = fromWei(loanAmountDue, loan?.lendingDesk?.erc20?.decimals);
    loanPaymentAmountDue = Number.parseFloat(_);
  } else {
    loanPaymentAmountDue =
      Number.parseFloat(fromWei(loan?.amount, loan?.lendingDesk?.erc20?.decimals)) -
      Number.parseFloat(
        fromWei(loan?.amountPaidBack, loan?.lendingDesk?.erc20?.decimals),
      );
  }

  return (
    <div className="col-sm-6 col-xl-4 mb-4" key={loan?.id}>
      <div className="card bg-primary-subtle border-primary-subtle rounded-4 h-100">
        {isLender ? (
          <div className="card-header py-2 rounded-top-4 text-center">
            <NavLink
              className="d-block w-100 h-100"
              to={`/manage-desks/${loan.lendingDesk?.id}`}
              style={{ fontSize: "16px" }}
            >
              Lending Desk #{loan.lendingDesk?.id}
            </NavLink>
          </div>
        ) : null}
        <div className="card-body px-4">
          {status === "Defaulted" ? (
            <i className="fa-solid fa-times-circle text-danger-emphasis fs-4" />
          ) : status === "Resolved" ? (
            <i className="fa-solid fa-check-circle text-success-emphasis fs-4" />
          ) : null}
          <div
            style={{ height: "60px", width: "60px" }}
            className="d-flex align-items-center justify-content-center rounded-circle overflow-hidden mx-auto position-relative"
          >
            <Blockies seed={`${loan?.nftId}-${loan?.nftCollection.id}`} size={16} />
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
          <div className="h5 text-center mt-3 mb-0">
            {loan?.nftCollection.id} #{loan?.nftId}
          </div>
          <div className="container-fluid g-0 mt-4">
            <div className="row g-3">
              <div
                className={status !== "Resolved" ? "col-xs-12 col-sm-6" : "col-12 px-3"}
              >
                <div
                  className={`p-2 rounded-3 ${
                    status === "Defaulted" ? "bg-secondary-subtle" : "bg-info-subtle"
                  } text-center`}
                >
                  <div className="text-info-emphasis h3">
                    <i className="fa-light fa-hand-holding-dollar" />
                  </div>
                  <div className="h6 mb-0">
                    {fromWei(loan?.amount, loan?.lendingDesk?.erc20.decimals)}{" "}
                    {loan?.lendingDesk?.erc20.symbol}
                  </div>
                  <div>borrowed</div>
                </div>
              </div>
              {status !== "Resolved" ? (
                <div className="col-xs-12 col-sm-6">
                  <div
                    className={`p-2 rounded-3 ${
                      status === "Defaulted"
                        ? "bg-secondary-subtle"
                        : "bg-success-subtle"
                    } text-center`}
                  >
                    <div className="text-success-emphasis h3">
                      <i className="fa-light fa-calendar-lines" />
                    </div>
                    <div className="h6 mb-0">
                      ~
                      {`${loanPaymentAmountDue.toFixed(4)} ${
                        loan?.lendingDesk?.erc20.symbol
                      }`}
                    </div>
                    <div>unpaid</div>
                  </div>
                </div>
              ) : null}
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
                onClose={resetForm}
                disabled={!timeInfo.isLoanActive}
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
                              <div className="h3">{loanPaymentAmountDue}</div>
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
                        disabled={
                          !checked || actionIsLoading || actionConfigLoadingMap[action]
                        }
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
                }}
                onClose={() => {
                  setAction(initialAction);
                }}
                disabled={!timeInfo.isLoanActive}
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
                              <div className="h3">{loanPaymentAmountDue}</div>
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
                          value={loanPaymentAmountDue}
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
                        disabled={
                          !checkedResolveLoan ||
                          actionIsLoading ||
                          actionConfigLoadingMap[action]
                        }
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
                disabled={!timeInfo.isLoanActive}
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
                                {`${loanPaymentAmountDue} ${loan?.lendingDesk?.erc20.symbol}`}
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
                        disabled={actionIsLoading || actionConfigLoadingMap[action]}
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
          {!timeInfo.isLoanActive ? (
            <p className="text-danger mt-1">
              {"Loan must be active for at least one hour for interaction."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
