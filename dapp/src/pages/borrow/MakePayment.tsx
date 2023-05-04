import { Loading } from "@/components";
import { MakePaymentDocument } from "../../../.graphclient";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import { useQuery } from "urql";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import {
  useNftyLendingPayBackLoan,
  usePrepareNftyLendingPayBackLoan,
} from "@/wagmi/generated";
import {
  getProtocolAddress,
  getProtocolChain,
} from "@/helpers/ProtocolDefaults";
import {
  erc20ABI,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { toast } from "@/helpers/Toast";

type MakePaymentForm = {
  amount: number;
};

export const MakePayment = () => {
  const { id } = useParams();
  const { chain } = useNetwork();

  const [result] = useQuery({
    query: MakePaymentDocument,
    variables: {
      // @ts-ignore
      loanId: id,
    },
  });

  const { register, handleSubmit, watch } = useForm<MakePaymentForm>({
    defaultValues: {
      // TODO: add min and max values for this
      amount: 1,
    },
  });

  const parsedAmount = ethers.utils.parseUnits(
    watch("amount").toString(),
    result.data?.loan?.liquidityShop.erc20.decimals
  );

  // Approve ERC20 transfer
  const { config: erc20ApprovalConfig, error: erc20ApprovalError } =
    usePrepareContractWrite({
      // @ts-ignore
      address: result.data?.loan?.liquidityShop.erc20.id,
      abi: erc20ABI,
      functionName: "approve",
      args: [getProtocolAddress(chain?.id), parsedAmount],
      chainId: chain?.id,
    });
  const {
    write: erc20ApprovalWrite,
    data: erc20ApprovalData,
    isLoading: erc20ApprovalLoading,
  } = useContractWrite({
    ...erc20ApprovalConfig,
  });

  // Payback loan
  const {
    config: paybackLoanConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareNftyLendingPayBackLoan({
    chainId: getProtocolChain(chain?.id),
    args: [result.data?.loan?.nftyNotesId, parsedAmount],
  });

  const {
    write: paybackLoanWrite,
    data: paybackLoanData,
    isLoading: paybackLoanIsLoading,
  } = useNftyLendingPayBackLoan({
    ...paybackLoanConfig,
    onSettled(data, error) {
      toast({
        title: "Payback Loan",
        content: error ? error?.message : data?.hash,
        alertType: error ? "alert-danger" : "alert-success",
      });
    },
  });

  const onSubmit = (form: MakePaymentForm) => {
    erc20ApprovalWrite?.();
    paybackLoanWrite?.();
  };

  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            {/* Content start */}
            <div className="card">
              <h1 className="text-strong fw-700 display-6 mt-5 mb-0">
                Make a Payment
              </h1>
              <p className="text-muted mt-5">
                Please fill out the following form to make a payment.
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="my-30">
                  <div className="ws-200 hs-200 rounded-circle overflow-hidden mx-auto d-flex align-items-center justify-content-center">
                    <img
                      // TODO: replace with actual NFT image
                      src="/images/placeholder/loan.png"
                      alt="image"
                      className="d-block w-auto h-100"
                    />
                  </div>
                  <div className="fw-bold text-primary text-center mt-10">
                    {result.data?.loan?.liquidityShop.nftCollection.name} #
                    {result.data?.loan?.nftCollateralId}
                  </div>
                </div>

                {/* Loan details start */}
                <label className="form-label mt-30">Loan Details</label>
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-calendar me-5 text-secondary-lm text-secondary-light-dm"></i>{" "}
                    Due Date
                  </div>
                  <div className="col-lg-6 text-lg-end">
                    {dayjs
                      .unix(result.data?.loan?.startTime)
                      .add(result.data?.loan?.duration, "days")
                      .toDate()
                      .toLocaleDateString()}
                  </div>
                </div>
                <hr />
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-piggy-bank me-5 text-success"></i>{" "}
                    Total Loan
                  </div>
                  <div className="col-lg-6 text-lg-end">
                    $
                    {ethers.utils.formatUnits(
                      result.data?.loan?.amount,
                      result.data?.loan?.liquidityShop.erc20.decimals
                    )}
                  </div>
                </div>
                <hr />
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-hand-holding-dollar me-5 text-warning-dim-lm text-warning-light-dm"></i>{" "}
                    Outstanding Balance
                  </div>
                  <div className="col-lg-6 text-lg-end">
                    $
                    {ethers.utils.formatUnits(
                      result.data?.loan?.remainder,
                      result.data?.loan?.liquidityShop.erc20.decimals
                    )}
                  </div>
                </div>
                <hr />
                {/* Loan details end */}

                {/* Deposit amount start */}
                <div className="form-group mt-30">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6">
                      <label className="form-label">Deposit Amount</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        {...register("amount", { required: true })}
                        className="form-control form-control-alt form-control-lg form-number"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Selected Coin</label>
                      <div className="form-control form-control-alt form-control-lg d-flex align-items-center">
                        <img
                          src={`/images/tokens/${result.data?.loan?.liquidityShop.erc20.symbol}.svg`}
                          className="w-auto hs-25 d-block me-5"
                        />
                        {result.data?.loan?.liquidityShop.erc20.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-muted mt-10">
                    NOTES: Minimum payment size is $
                    {ethers.utils.formatUnits(
                      result.data?.loan?.liquidityShop.erc20
                        .minimumPaymentAmount,
                      result.data?.loan?.liquidityShop.erc20.decimals
                    )}
                  </div>
                </div>
                {/* Deposit amount end */}

                {/* Confirmation start */}
                <div className="form-group mt-30">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                  >
                    Deposit Amount
                  </button>
                </div>
                {/* Confirmation end */}
              </form>
            </div>
            {/* Content end */}
          </div>
        </div>
      </div>
    </div>
  );
};
