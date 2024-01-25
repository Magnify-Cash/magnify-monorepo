import { useEffect, useState } from "react";
import { useAccount, useChainId, useWaitForTransaction } from "wagmi";
import { PopupTransaction } from "@/components";
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

interface ManageFundsProps {
  lendingDesk: any;
  action: "deposit" | "withdraw";
}

//ManageFunds component is used to deposit or withdraw liquidity from a lending desk
const ManageFunds = ({ lendingDesk, action }: ManageFundsProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [checked, setChecked] = useState(false);
  const [amount, setAmount] = useState(0);

  let btnText: string, modalId: string, modalTitle: string, actionText: string;

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
  const { writeAsync: depositWrite } =
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
  const { writeAsync: withdrawWrite } =
    useNftyFinanceV1WithdrawLendingDeskLiquidity(withdrawConfig);

  const withdrawLiquidity = async () => {
    await withdrawWrite?.();
  };

  //actionMap is used to call the respective function based on the action
  const actionMap = {
    deposit: depositLiquidity,
    withdraw: withdrawLiquidity,
  };

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
                checked={checked}
                onClick={() => approveErc20()}
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
            disabled={!checked && action === "deposit"}
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
                value={amount}
                onChange={(e) =>
                  // @ts-ignore
                  setAmount(e.target.value)
                }
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

export default ManageFunds;
