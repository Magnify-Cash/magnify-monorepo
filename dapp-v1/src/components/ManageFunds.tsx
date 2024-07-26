import { PopupTransaction } from "@/components";
import { useToastContext } from "@/helpers/CreateToast";
import { fromWei, toWei } from "@/helpers/utils";
import {
  magnifyCashV1Address,
  useReadErc20Allowance,
  useSimulateMagnifyCashV1DepositLendingDeskLiquidity,
  useSimulateMagnifyCashV1WithdrawLendingDeskLiquidity,
  useWriteErc20Approve,
  useWriteMagnifyCashV1DepositLendingDeskLiquidity,
  useWriteMagnifyCashV1WithdrawLendingDeskLiquidity,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";
import ErrorDetails from "./ErrorDetails";
import { Spinner } from "./LoadingIndicator";
import TransactionDetails from "./TransactionDetails";

interface ManageFundsProps {
  lendingDesk: any;
  action: "deposit" | "withdraw";
}

interface ManageFundForm {
  amount: number;
}

//ManageFunds component is used to deposit or withdraw liquidity from a lending desk
export const ManageFunds = ({ lendingDesk, action }: ManageFundsProps) => {
  /*
  wagmi hooks
  */
  const { address } = useAccount();
  const chainId = useChainId();

  /*
  form hooks / functions
  */
  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<ManageFundForm>();

  const [checked, setChecked] = useState(false);
  //use watch to get the value of the input field as it changes
  const amount = watch("amount", 0);

  //reset the form when modal is closed
  const resetForm = () => {
    reset({ amount: 0 });
  };

  let btnText: string;
  let modalId: string;
  let modalTitle: string;
  let actionText: string;

  if (action === "deposit") {
    btnText = "Add Funds";
    modalId = "depositModal";
    modalTitle = "Add Funds";
    actionText = "Deposit Liquidity";
  } else {
    btnText = "Withdraw Funds";
    modalId = "withdrawModal";
    modalTitle = "Withdraw Funds";
    actionText = "Withdraw Liquidity";
  }

  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [actionIsLoading, setActionIsLoading] = useState<boolean>(false);

  /*
  Deposit Liquidity
  Calls `depositLendingDeskLiquidity`
  Note: Requires token approval
  */
  const {
    data: approveErc20TransactionData,
    writeContractAsync: approveErc20,
    error: approveErc20Error,
  } = useWriteErc20Approve();

  const { data: approvalData, refetch: refetchApprovalData } = useReadErc20Allowance({
    address: lendingDesk?.erc20.id as `0x${string}`,
    args: [address as `0x${string}`, magnifyCashV1Address[chainId]],
  });

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
      refetchDepositConfig();
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

  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (Number(fromWei(approvalData, lendingDesk?.erc20?.decimals)) >= Number(amount)) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [amount, approvalData]);

  const {
    data: depositConfig,
    isLoading: depositConfigIsLoading,
    error: depositConfigError,
    refetch: refetchDepositConfig,
  } = useSimulateMagnifyCashV1DepositLendingDeskLiquidity({
    args: [
      BigInt(lendingDesk?.id || 0),
      toWei(amount.toString(), lendingDesk?.erc20?.decimals),
    ],
    query: {
      enabled: amount > 0 && checked,
    },
  });
  const {
    data: depositWriteData,
    writeContractAsync: depositWrite,
    error: depositWriteError,
  } = useWriteMagnifyCashV1DepositLendingDeskLiquidity();
  const depositLiquidity = async () => {
    await depositWrite(depositConfig!.request);
  };

  /*
  Withdraw Liquidity
  Calls `withdrawLendingDeskLiquidity`
  */
  const {
    data: withdrawConfig,
    isLoading: withdrawConfigIsLoading,
    error: withdrawConfigError,
  } = useSimulateMagnifyCashV1WithdrawLendingDeskLiquidity({
    args: [
      BigInt(lendingDesk?.id || 0),
      toWei(amount?.toString(), lendingDesk?.erc20?.decimals),
    ],
    query: {
      enabled: amount > 0,
    },
  });
  const {
    data: withdrawWriteData,
    writeContractAsync: withdrawWrite,
    error: withdrawWriteError,
  } = useWriteMagnifyCashV1WithdrawLendingDeskLiquidity();

  const withdrawLiquidity = async () => {
    // Check if withdrawWrite is a function i.e. if the withdrawWrite function is defined
    try {
      if (
        amount > Number(fromWei(lendingDesk?.balance, lendingDesk?.erc20?.decimals))
      ) {
        addToast(
          "Error",
          <ErrorDetails error={"InsufficientLendingDeskBalance"} />,
          "error",
        );
        setActionIsLoading(false);
        return;
      }

      await withdrawWrite(withdrawConfig!.request);
    } catch (error: any) {
      console.error(error);
    }
  };

  //Deposit function is used to deposit liquidity
  //This function is called when the user clicks on the deposit button
  async function deposit() {
    //check if depositConfig is undefined or depositConfigError is not null
    if (!depositConfig || depositConfigError) {
      console.error("depositConfigError", depositConfigError?.message);
      addToast(
        "Error",
        <ErrorDetails
          error={
            depositConfigError
              ? depositConfigError.message
              : "Error initializing deposit"
          }
        />,
        "error",
      );
      return;
    }
    setActionIsLoading(true);
    await depositLiquidity();
  }
  //Withdraw function is used to withdraw liquidity
  //This function is called when the user clicks on the withdraw button
  async function withdraw() {
    //check if withdrawConfig is undefined or withdrawConfigError is not null
    if (!withdrawConfig || withdrawConfigError) {
      console.error("withdrawConfigError", withdrawConfigError?.message);
      addToast(
        "Error",
        <ErrorDetails
          error={
            withdrawConfigError
              ? withdrawConfigError.message
              : "Error initializing withdraw"
          }
        />,
        "error",
      );
      return;
    }
    setActionIsLoading(true);
    await withdrawLiquidity();
  }

  //actionMap is used to call the respective function based on the action
  const actionMap = {
    deposit,
    withdraw,
  };

  //actionDataMap is used to aceess the action data based on the action
  const actionDataMap = {
    deposit: depositWriteData,
    withdraw: withdrawWriteData,
  };

  //actionConfigLoadingMap is used to access the loading state of actionConfig based on the action
  const actionConfigLoadingMap = {
    deposit: depositConfigIsLoading,
    withdraw: withdrawConfigIsLoading,
  };

  //actionErrorMap is used to aceess the action error based on the action
  const actionErrorMap = {
    deposit: depositWriteError,
    withdraw: withdrawWriteError,
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
      setActionIsLoading(false);
      refetchApprovalData();
      if (loadingToastId) {
        closeToast(loadingToastId);
        setLoadingToastId(null);
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={actionDataMap[action]!} />,
          "success",
        );
      }
      // Close modal
      const modal = document.getElementsByClassName("modal show")[0];
      window.bootstrap.Modal.getInstance(modal)?.hide();
      // Close modal backdrop
      const modalBackdrop = document.getElementsByClassName("modal-backdrop")[0];
      modalBackdrop?.remove();
    }
  }, [
    actionErrorMap[action],
    actionConfirmError,
    actionIsConfirmed,
    actionIsConfirming,
  ]);

  // Checkbox click function
  async function approveERC20TokenTransfer() {
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);

    await approveErc20({
      address: lendingDesk?.erc20.id as `0x${string}`,
      args: [
        magnifyCashV1Address[chainId],
        toWei(amount.toString(), lendingDesk?.erc20?.decimals),
      ],
    });
  }

  return (
    <PopupTransaction
      btnClass="btn btn-primary py-2 w-100 rounded-pill mb-2"
      btnText={btnText}
      modalId={modalId}
      modalTitle={modalTitle}
      onClose={resetForm}
      modalFooter={
        <div className="modal-footer text-start">
          {action === "deposit" && (
            <div className="form-check mb-3 ms-3 w-100 ">
              <input
                disabled={approvalIsLoading || amount <= 0}
                checked={checked}
                onChange={() => approveERC20TokenTransfer()}
                className="form-check-input "
                type="checkbox"
                value=""
                id="flexCheckChecked"
                style={{ transform: "scale(1.5)" }}
                hidden={approvalIsLoading}
              />
              <Spinner show={approvalIsLoading} size="sm" />
              <label
                className="form-check-label ps-2 text-wrap "
                htmlFor="flexCheckChecked"
              >
                {`Grant permission for ${
                  lendingDesk?.erc20.symbol || ""
                } transfer by checking this box.`}{" "}
              </label>
            </div>
          )}
          <button
            type="button"
            disabled={
              actionIsLoading ||
              actionConfigLoadingMap[action] ||
              (!checked && action === "deposit") ||
              amount <= 0
            }
            className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
            onClick={actionMap[action] || (() => console.log("error"))}
          >
            {actionIsLoading ? <Spinner show={actionIsLoading} /> : actionText}
          </button>
        </div>
      }
      modalContent={
        <div className="text-lg-start ">
          <div className="card-body">
            <h5 className="fw-medium text-body-secondary mb-4">{actionText}</h5>
            <p className="text-body-secondary mb-4">
              Available Liquidity:{" "}
              <strong>
                {fromWei(lendingDesk?.balance, lendingDesk?.erc20?.decimals)}
              </strong>{" "}
              {lendingDesk?.erc20.symbol}
            </p>
            <div className="input-group ">
              <input
                {...register("amount")}
                type="number"
                className="form-control form-control-lg py-2 mb-2 flex-grow-1"
              />
              <div className="flex-shrink-0 fs-5 d-flex  ms-3">
                <div className="text-truncate ">{lendingDesk?.erc20.symbol}</div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
