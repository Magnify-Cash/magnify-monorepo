import { PopupTransaction } from "@/components";
import { useToastContext } from "@/helpers/CreateToast";
import { fromWei, toWei } from "@/helpers/utils";
import {
  nftyFinanceV1Address,
  useErc20Allowance,
  useErc20Approve,
  useNftyFinanceV1DepositLendingDeskLiquidity,
  useNftyFinanceV1WithdrawLendingDeskLiquidity,
  usePrepareNftyFinanceV1DepositLendingDeskLiquidity,
  usePrepareNftyFinanceV1WithdrawLendingDeskLiquidity,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useChainId, useWaitForTransaction } from "wagmi";

interface ManageFundsProps {
  lendingDesk: any;
  action: "deposit" | "withdraw";
}

interface ManageFundForm {
  amount: number;
}

//ManageFunds component is used to deposit or withdraw liquidity from a lending desk
export const ManageFunds = ({ lendingDesk, action }: ManageFundsProps) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<ManageFundForm>();

  const { address } = useAccount();
  const chainId = useChainId();
  const { addToast, closeToast } = useToastContext();

  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [actionIsLoading, setActionIsLoading] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);
  //use watch to get the value of the input field as it changes
  const amount = watch("amount", 0);

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
  Deposit Liquidity
  Calls `depositLendingDeskLiquidity`
  Note: Requires token approval
  */
  const { data: approveErc20TransactionData, writeAsync: approveErc20 } =
    useErc20Approve({
      address: lendingDesk?.erc20.id as `0x${string}`,
      args: [
        nftyFinanceV1Address[chainId],
        toWei(amount.toString(), lendingDesk?.erc20?.decimals),
      ],
    });

  const { data: approvalData, refetch: refetchApprovalData } =
    useErc20Allowance({
      address: lendingDesk?.erc20.id as `0x${string}`,
      args: [address as `0x${string}`, nftyFinanceV1Address[chainId]],
    });

  //On successful transaction of approveErc20 hook, refetch the approval data
  useWaitForTransaction({
    hash: approveErc20TransactionData?.hash as `0x${string}`,
    onSuccess(data) {
      refetchApprovalData();
      refetchDepositConfig();
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        "Your transaction has been confirmed.",
        "success"
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast(
        "Transaction Failed",
        "Your transaction has failed. Please try again.",
        "error"
      );
    },
  });

  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (
      Number(fromWei(approvalData, lendingDesk?.erc20?.decimals)) >=
      Number(amount)
    ) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [amount, approvalData]);

  const { config: depositConfig, refetch: refetchDepositConfig } =
    usePrepareNftyFinanceV1DepositLendingDeskLiquidity({
      args: [
        BigInt(lendingDesk?.id || 0),
        toWei(amount.toString(), lendingDesk?.erc20?.decimals),
      ],
    });
  const { data: depositWriteData, writeAsync: depositWrite } =
    useNftyFinanceV1DepositLendingDeskLiquidity(depositConfig);
  const depositLiquidity = async () => {
    await depositWrite?.();
  };

  /*
  Withdraw Liquidity
  Calls `withdrawLendingDeskLiquidity`
  */
  const { config: withdrawConfig } =
    usePrepareNftyFinanceV1WithdrawLendingDeskLiquidity({
      args: [
        BigInt(lendingDesk?.id || 0),
        toWei(amount.toString(), lendingDesk?.erc20?.decimals),
      ],
    });
  const { data: withdrawWriteData, writeAsync: withdrawWrite } =
    useNftyFinanceV1WithdrawLendingDeskLiquidity(withdrawConfig);

  const withdrawLiquidity = async () => {
    await withdrawWrite?.();
  };

  //Deposit function is used to deposit liquidity
  //This function is called when the user clicks on the deposit button
  async function deposit() {
    setActionIsLoading(true);
    try {
      await depositLiquidity();
    } catch (error) {
      console.error(error);
      addToast("Error", "An error occurred. Please try again.", "error");
    }
    setActionIsLoading(false);
  }
  //Withdraw function is used to withdraw liquidity
  //This function is called when the user clicks on the withdraw button
  async function withdraw() {
    setActionIsLoading(true);
    try {
      await withdrawLiquidity();
    } catch (error) {
      console.error(error);
      addToast("Error", "An error occurred. Please try again.", "error");
    }
    setActionIsLoading(false);
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

  //on successful transaction of deposit/withdraw hook, refetch approval data and display relevant toast

  useWaitForTransaction({
    hash: actionDataMap[action]?.hash as `0x${string}`,
    onSuccess(data) {
      refetchApprovalData();
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        "Your transaction has been confirmed.",
        "success"
      );
    },
    onError(error) {
      console.error(error);
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display error toast
      addToast(
        "Transaction Failed",
        "Your transaction has failed. Please try again.",
        "error"
      );
    },
  });

  // Checkbox click function
  async function approveERC20TokenTransfer() {
    if (checked) {
      console.log("already approved");
      return;
    }
    setApprovalIsLoading(true);
    try {
      await approveErc20();
    } catch (error) {
      console.error(error);
      addToast("Error", "An error occurred. Please try again.", "error");
    }
    setApprovalIsLoading(false);
  }
  //This hook is used to display loading toast when the approve transaction is pending

  useEffect(() => {
    if (approveErc20TransactionData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading"
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [approveErc20TransactionData?.hash]);

  //This hook is used to display loading toast when the deposit/withdraw transaction is pending

  useEffect(() => {
    if (actionDataMap[action]?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading"
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [actionDataMap[action]?.hash]);

  return (
    <PopupTransaction
      btnClass="btn btn-primary py-2 w-100 rounded-pill mb-2"
      btnText={btnText}
      modalId={modalId}
      modalTitle={modalTitle}
      modalFooter={
        <div className="modal-footer text-start">
          {action === "deposit" && (
            <div className="form-check mb-3 ms-3 w-100 ">
              <input
                disabled={approvalIsLoading}
                checked={checked}
                onChange={() => approveERC20TokenTransfer()}
                className="form-check-input "
                type="checkbox"
                value=""
                id="flexCheckChecked"
                style={{ transform: "scale(1.5)" }}
              />
              <label
                className="form-check-label ps-2 text-wrap "
                htmlFor="flexCheckChecked"
              >
                {`Grant permission for ${
                  lendingDesk?.erc20.symbol || "USDT"
                } transfer by checking this box.`}{" "}
              </label>
            </div>
          )}
          <button
            type="button"
            disabled={actionIsLoading || (!checked && action === "deposit")}
            className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
            onClick={actionMap[action] || (() => console.log("error"))}
          >
            {actionText}
          </button>
        </div>
      }
      modalContent={
        <div className="text-lg-start ">
          <div className="card-body">
            <h5 className="fw-medium text-body-secondary mb-4">{actionText}</h5>
            <div className="input-group ">
              <input
                {...register("amount")}
                type="number"
                className="form-control form-control-lg py-2 mb-2 flex-grow-1"
              />
              <div className="flex-shrink-0 fs-5 d-flex  ms-3">
                <div className="text-truncate ">
                  {lendingDesk?.erc20.symbol}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
