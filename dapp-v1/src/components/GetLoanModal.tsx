import type { INft } from "@/helpers/FetchNfts";
import {
  calculateGrossAmount,
  calculateLoanInterest,
  calculateLoanOriginationFee,
} from "@/helpers/LoanInterest";
import { type WalletNft, fromWei, getWalletNfts } from "@/helpers/utils";
import type { LendingDesk, LoanConfig } from "dapp-v1/.graphclient";
import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Spinner } from "./LoadingIndicator";
import PopupTransaction from "./PopupTransaction";

type GetLoanModalProps = {
  onCheck: () => void;
  checked: boolean;
  onSubmit: () => void;
  loanConfig?: LoanConfig;
  lendingDesk?: LendingDesk;
  nft?: INft;
  duration?: number;
  setDuration: (duration: number) => void;
  amount?: number;
  setAmount: (amount: number) => void;
  nftId?: number;
  setNftId: (nftId: number) => void;
  nftCollectionAddress?: string;
  disabled: boolean;
  btnClass: string;
  btnOnClick?: () => void;
  index?: number;
  approvalIsLoading: boolean;
  newLoanIsLoading: boolean;
  newLoanConfigIsLoading: boolean;
};

export default function GetLoanModal({
  onSubmit,
  nft,
  lendingDesk,
  loanConfig,
  duration,
  setDuration,
  amount,
  setAmount,
  nftId,
  setNftId,
  nftCollectionAddress,
  disabled,
  btnClass,
  btnOnClick,
  onCheck,
  checked,
  index,
  approvalIsLoading,
  newLoanIsLoading,
  newLoanConfigIsLoading,
}: GetLoanModalProps) {
  // Wallet NFTs
  const { address } = useAccount();
  const chainId = useChainId();
  const [walletNfts, setWalletNfts] = useState<WalletNft[]>([]);

  const selectedNft = walletNfts.find((x) => x.tokenId === nftId?.toString());
  const selectedNftName =
    nftId !== undefined ? selectedNft?.name || `${nft?.name} #${nftId}` : null;

  // Get the available NFTs from the wallet
  useEffect(() => {
    const fetchWalletNfts = async () => {
      const walletNfts = await getWalletNfts({
        chainId: chainId,
        wallet: address?.toLowerCase()!,
        nftCollection: nftCollectionAddress!,
      });
      setWalletNfts(walletNfts);
    };
    fetchWalletNfts();
  }, [address, nftCollectionAddress]);

  return (
    <PopupTransaction
      btnOnClick={btnOnClick}
      btnClass={btnClass}
      btnText="Get a Loan"
      modalId={`txModal${index || ""}`}
      modalTitle="Get a Loan"
      disabled={disabled}
      modalFooter={
        <div className="modal-footer text-start">
          {selectedNftName && (
            <div className={`form-check mb-3 w-100 ${approvalIsLoading ? "" : "ms-3"}`}>
              <input
                name="check"
                disabled={approvalIsLoading}
                checked={checked}
                onClick={onCheck}
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckChecked"
                hidden={approvalIsLoading}
                style={{
                  transform: "scale(1.5)",
                }}
              />
              <Spinner show={approvalIsLoading} size="sm" />
              <label
                className="form-check-label ps-2 text-wrap"
                htmlFor="flexCheckChecked"
              >
                Grant permission for {selectedNftName} transfer by checking this box.
              </label>
            </div>
          )}
          <button
            type="button"
            disabled={!checked || newLoanIsLoading || newLoanConfigIsLoading}
            onClick={() => onSubmit()}
            className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
          >
            {newLoanIsLoading ? <Spinner show={newLoanIsLoading} /> : "Request Loan"}
          </button>
        </div>
      }
      modalContent={
        loanConfig &&
        lendingDesk && (
          // using index to make formID unique
          <form
            id={`quickLoanForm${typeof index === "number" ? index : ""}`}
            className="modal-body text-start"
          >
            <p className="text-body-secondary">Lending Desk Details</p>
            <div className="container-fluid g-0 mt-3">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                    <div className="d-flex align-items-center justify-content-center">
                      {nft?.logoURI && (
                        <img
                          src={nft.logoURI}
                          alt={nft.name}
                          className="d-block flex-shrink-0 me-2 rounded-circle"
                          width="30"
                        />
                      )}
                      <div className="h5 fw-medium m-0">{nft?.name}</div>
                    </div>
                    <div className="text-body-secondary">Collection Type</div>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="h4 fw-medium">
                        {fromWei(loanConfig?.minAmount, lendingDesk?.erc20?.decimals)}-
                        {fromWei(loanConfig?.maxAmount, lendingDesk?.erc20?.decimals)}
                      </div>
                      <span className="text-body-secondary ms-2">
                        {lendingDesk.erc20.symbol}
                      </span>
                    </div>
                    <div className="text-body-secondary">Min/Max Offer</div>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="h4 fw-medium">
                        {loanConfig?.minDuration / 24}-{loanConfig?.maxDuration / 24}
                      </div>
                      <span className="text-body-secondary ms-2">Days</span>
                    </div>
                    <div className="text-body-secondary">Min/Max Duration</div>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="h4 fw-medium">
                        {loanConfig?.minInterest / 100} -{" "}
                        {loanConfig?.maxInterest / 100}
                      </div>
                      <span className="text-body-secondary ms-2">%</span>
                    </div>
                    <div className="text-body-secondary">Min/Max Interest Rate</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="my-3 py-3 border-top border-bottom">
              <div className="mb-3">
                <label htmlFor="select-nft" className="form-label">
                  Select NFT
                </label>
                <select
                  className="form-select form-select-lg py-2"
                  id="select-nft"
                  onChange={(e) =>
                    setNftId(
                      // @ts-ignore
                      e.target.value ? Number.parseInt(e.target.value) : undefined,
                    )
                  }
                >
                  <option selected value="">
                    Select NFT
                  </option>
                  {walletNfts.map((x) => (
                    <option key={x.tokenId} value={x.tokenId}>
                      {x.name || `${nft?.name} #${x.tokenId}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="set-duration" className="form-label">
                  Set Duration
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    name="loanDuration"
                    className="form-control form-control-lg py-2"
                    id="set-duration"
                    placeholder="Duration"
                    step="any"
                    min={loanConfig?.minDuration / 24}
                    max={loanConfig?.maxDuration / 24}
                    value={duration}
                    onChange={(e) =>
                      // @ts-ignore
                      setDuration(e.target.value)
                    }
                    required
                  />
                  <span className="input-group-text">Days</span>
                </div>
              </div>
              <div>
                <label htmlFor="set-amount" className="form-label">
                  Set Amount
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    name="loanAmount"
                    className="form-control form-control-lg py-2"
                    id="set-amount"
                    placeholder="Amount"
                    step="any"
                    min={fromWei(loanConfig?.minAmount, lendingDesk?.erc20?.decimals)}
                    max={fromWei(loanConfig?.maxAmount, lendingDesk?.erc20?.decimals)}
                    value={amount}
                    // @ts-ignore
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <span className="input-group-text">{lendingDesk.erc20.symbol}</span>
                </div>
                <div className="d-flex align-items-center justify-content-start pt-2">
                  <span className="text-body-secondary">Available Balance: </span>
                  <div className="h4 text-primary fw-medium ms-2">
                    {fromWei(lendingDesk?.balance, lendingDesk?.erc20?.decimals)}
                  </div>
                  <span className="text-body-secondary ms-2">
                    {lendingDesk.erc20.symbol}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-body-secondary">Loan Overview</p>
            <div className="d-flex align-items-center mb-3">
              <h6 className="m-0">{selectedNftName}</h6>
            </div>
            <div className="my-2 d-flex align-items-center">
              <span className="text-body-secondary">Duration</span>
              <span className="fw-medium ms-auto">{duration} Days</span>
            </div>
            <div className="my-2 d-flex align-items-center">
              <span className="text-body-secondary">
                Interest Rate <i className="fa-light fa-info-circle ms-1" />
              </span>
              <span className="fw-medium ms-auto">
                {loanConfig
                  ? calculateLoanInterest(
                      loanConfig,
                      amount,
                      duration,
                      lendingDesk.erc20?.decimals,
                    )
                  : null}
                %
              </span>
            </div>
            <div className="my-2 d-flex align-items-center">
              <span className="text-body-secondary">Requested Amount</span>
              <span className="fw-medium ms-auto">
                {amount ? amount : "0"} {lendingDesk.erc20.symbol}
              </span>
            </div>
            <div className="my-2 d-flex align-items-center">
              <span className="text-body-secondary">
                2% Loan Origination Fee <i className="fa-light fa-info-circle ms-1" />
              </span>
              <span className="fw-medium ms-auto">
                {"- "}
                {amount ? calculateLoanOriginationFee(amount) : "0"}{" "}
                {lendingDesk.erc20.symbol}
              </span>
            </div>
            <div className="mt-3 pt-3 border-top d-flex align-items-center">
              <span className="text-body-secondary">Gross Amount</span>
              <span className="h3 ms-auto my-0 text-primary-emphasis">
                {amount ? calculateGrossAmount(amount) : "0"}{" "}
                <span className="fw-medium">{lendingDesk.erc20.symbol}</span>
              </span>
            </div>
          </form>
        )
      }
    />
  );
}
