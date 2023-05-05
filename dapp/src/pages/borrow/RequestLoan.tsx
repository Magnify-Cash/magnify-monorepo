import { Link, useNavigate, useParams } from "react-router-dom";
import ReactSlider from "react-slider";
import { useQuery } from "urql";
import { BigNumber, ethers } from "ethers";
import {
  erc20ABI,
  erc721ABI,
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import {
  useNftyLendingCreateLoan,
  usePrepareNftyLendingCreateLoan,
} from "@/wagmi/generated";
import {
  getProtocolAddress,
  getProtocolChain,
} from "@/helpers/ProtocolDefaults";
import { RequestLoanDocument } from "../../../.graphclient";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Loading } from "@/components/Loading";
import { toast } from "@/helpers/Toast";

type RequestLoanForm = {
  nftCollateralId: string;
  duration: number;
  requestedAmount: number;
  acceptTerms: boolean;
};

export const RequestLoan = () => {
  const { id } = useParams();
  const { address } = useAccount();
  const navigate = useNavigate();

  // Data to populate page
  const [result] = useQuery({
    query: RequestLoanDocument,
    // @ts-ignore
    variables: { liquidityShopId: id, walletAddress: address },
  });

  // Form
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { isValid },
  } = useForm<RequestLoanForm>({
    defaultValues: {
      nftCollateralId: "-1",
      duration: 30,
      requestedAmount: 1,
      acceptTerms: false,
    },
  });

  // Wagmi hooks
  const { chain } = useNetwork();

  // Approve $NFTY transfer
  const { config: nftyApprovalConfig, error: nftyApprovalError } =
    usePrepareContractWrite({
      address: import.meta.env.VITE_NFTY_TOKEN_ADDRESS,
      abi: erc20ABI,
      functionName: "approve",
      // TODO: hardcoded amount for now, fix this
      args: [getProtocolAddress(chain?.id), ethers.utils.parseUnits("100", 18)],
      chainId: chain?.id,
    });
  const {
    write: nftyApprovalWrite,
    data: nftyApprovalData,
    isLoading: nftyApprovalLoading,
  } = useContractWrite({
    ...nftyApprovalConfig,
  });

  // Approve NFT transfer
  const { config: nftApprovalConfig, error: nftApprovalError } =
    usePrepareContractWrite({
      // @ts-ignore
      address: result.data?.liquidityShop?.nftCollection.id,
      abi: erc721ABI,
      functionName: "approve",
      args: [
        getProtocolAddress(chain?.id),
        BigNumber.from(watch("nftCollateralId")),
      ],
      chainId: chain?.id,
    });
  const {
    write: nftApprovalWrite,
    data: nftApprovalData,
    isLoading: nftApprovalLoading,
  } = useContractWrite({
    ...nftApprovalConfig,
  });

  // Create loan
  const {
    config: createLoanConfig,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareNftyLendingCreateLoan({
    chainId: getProtocolChain(chain?.id),
    args: [
      {
        shopId: BigNumber.from(id),
        nftCollateralId: BigNumber.from(watch("nftCollateralId")),
        loanDuration: BigNumber.from(watch("duration")),
        // Convert display amount to decimal representation
        amount: ethers.utils.parseUnits(
          watch("requestedAmount").toString(),
          result.data?.liquidityShop?.erc20.decimals
        ),
      },
    ],
    overrides: {
      gasLimit: BigNumber.from(1000000),
    },
  });
  const { write: createLoanWrite } = useNftyLendingCreateLoan({
    ...createLoanConfig,
    onSettled(data, error) {
      if (error)
        toast({
          title: "Request Loan",
          content: error ? error?.message : data?.hash,
          alertType: error ? "alert-danger" : "alert-success",
        });
      else navigate("/borrow/dashboard");
    },
  });

  // On form submit
  const onSubmit: SubmitHandler<RequestLoanForm> = (data: RequestLoanForm) => {
    nftApprovalWrite?.();
    nftyApprovalWrite?.();
    createLoanWrite?.();
  };

  const maxOffer = result?.data
    ? parseFloat(
        ethers.utils.formatUnits(
          result?.data.liquidityShop?.maxOffer,
          result?.data.liquidityShop?.erc20.decimals
        )
      )
    : 0;

  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            {/* Header start */}
            <div className="content">
              <Link
                to="/borrow/explore-collections"
                className="link-reset text-decoration-none fw-bold d-flex align-items-center"
              >
                <i className="fa-solid fa-circle-arrow-left fs-base-p4 text-primary me-10"></i>
                Back to Explore
              </Link>
              <details
                className="bg-content shadow-lg rounded-3 mt-20 overflow-hidden border-0"
                open={true}
              >
                <summary className="p-10 cursor-pointer list-style-none bg-primary-gradient text-on-primary d-flex align-items-center">
                  <div className="p-10 fw-bold text-truncate">
                    <div className="fw-bold fs-base-p8">
                      {result.data?.liquidityShop?.name}
                    </div>
                    <div>By {result.data?.liquidityShop?.owner}</div>
                  </div>
                  <div className="ms-auto fs-base-p12 px-20">
                    <div className="show-open">
                      <i className="fa-solid fa-angle-down"></i>
                    </div>
                    <div className="show-closed">
                      <i className="fa-solid fa-angle-right"></i>
                    </div>
                  </div>
                </summary>
                <div className="px-10">
                  <div className="row">
                    <div className="col-lg-4 px-10 my-10 my-lg-20">
                      <div className="text-truncate text-warning-dim-lm text-warning-light-dm fw-bold fs-base-p8">
                        <i className="fa-regular fa-badge-percent me-5"></i>
                        {Math.min(
                          result.data?.liquidityShop?.interestA,
                          result.data?.liquidityShop?.interestB,
                          result.data?.liquidityShop?.interestC
                        )}{" "}
                        -{" "}
                        {Math.max(
                          result.data?.liquidityShop?.interestA,
                          result.data?.liquidityShop?.interestB,
                          result.data?.liquidityShop?.interestC
                        )}
                        %
                      </div>
                      <div className="text-truncate text-muted">
                        Interest Rates
                      </div>
                    </div>
                    <div className="col-lg-4 px-10 my-10 my-lg-20">
                      <div className="text-truncate text-success fw-bold fs-base-p8">
                        <i className="fa-regular fa-piggy-bank me-5"></i>$
                        {ethers.utils.formatUnits(
                          result.data?.liquidityShop?.balance,
                          result.data?.liquidityShop?.erc20.decimals
                        )}
                      </div>
                      <div className="text-truncate text-muted">
                        Available Liquidity
                      </div>
                    </div>
                    <div className="col-lg-4 px-10 my-10 my-lg-20">
                      <div className="text-truncate text-secondary-lm text-secondary-light-dm fw-bold fs-base-p8">
                        <i className="fa-regular fa-image me-5"></i>
                        {result.data?.liquidityShop?.nftCollection?.name}
                      </div>
                      <div className="text-truncate text-muted">
                        Collection Type
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            {/* Header end */}

            {/* Content start */}
            <div className="card">
              <h1 className="text-strong fw-700 display-6 mt-5 mb-0">
                Request Loan
              </h1>
              <p className="text-muted mt-5">
                Please fill out the following form to request a loan from the
                Liquidity Shop.
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* NFT to borrow against start */}
                <div className="form-group">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6 align-self-center">
                      <label className="form-label m-0">
                        NFT to Borrow Against
                      </label>
                    </div>
                    <div className="col-lg-6">
                      <select
                        className="form-select form-select-lg"
                        {...register("nftCollateralId", {
                          required: true,
                          validate: (x) => x != "-1",
                        })}
                      >
                        <option value="-1">Select NFT</option>
                        {result.data?.liquidityShop?.nftCollection.nfts?.map(
                          (x) => (
                            <option value={x.tokenId} key={x.tokenId}>
                              {result.data?.liquidityShop?.nftCollection?.name}{" "}
                              #{x.tokenId}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="my-30">
                  <div className="ws-200 hs-200 rounded-circle overflow-hidden mx-auto d-flex align-items-center justify-content-center">
                    <img
                      src="/images/placeholder/doodles-square.png"
                      alt="image"
                      className="d-block w-auto h-100"
                    />
                  </div>
                  <div className="fw-bold text-primary text-center mt-10">
                    Doodle #7603
                  </div>
                </div>
                {/* NFT to borrow against end */}

                {/* Request loan amount start */}
                <div className="form-group">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6">
                      <label className="form-label">Request Loan Amount</label>
                      <Controller
                        name="requestedAmount"
                        control={control}
                        rules={{ min: 0, max: maxOffer }}
                        defaultValue={0}
                        render={({ field: { onChange, value } }) => (
                          <input
                            type="number"
                            step="0.1"
                            className="form-control form-control-alt form-control-lg form-number"
                            placeholder="0.0"
                            value={value}
                            onChange={onChange}
                            min={1}
                            max={maxOffer}
                          />
                        )}
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Selected Coin</label>
                      <div className="form-control form-control-alt form-control-lg d-flex align-items-center">
                        <img
                          src={`/images/tokens/${result.data?.liquidityShop?.erc20.symbol}.svg`}
                          className="w-auto hs-25 d-block me-5"
                        />
                        {result.data?.liquidityShop?.erc20.symbol}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group mt-30">
                  <div className="d-flex align-items-center">
                    <label className="me-10">$1</label>
                    <Controller
                      name="requestedAmount"
                      control={control}
                      rules={{
                        min: 1,
                        max: result.data?.liquidityShop?.maxOffer,
                      }}
                      defaultValue={1}
                      render={({ field: { onChange, value } }) => (
                        <ReactSlider
                          className="react-slider"
                          thumbClassName="react-slider-thumb"
                          trackClassName="react-slider-track"
                          onChange={onChange}
                          value={value}
                          max={maxOffer}
                          min={1}
                        />
                      )}
                    />
                    <label className="ms-10">${maxOffer}</label>
                  </div>
                  <div className="text-center text-muted mt-10">
                    Selected:{" "}
                    <strong className="text-primary">
                      $<span>{watch("requestedAmount")}</span>
                    </strong>{" "}
                    | NOTES: Maximum Loan size is ${maxOffer}
                  </div>
                </div>
                {/* Request loan amount end */}

                {/* Loan duration start */}
                <div className="form-group mt-30">
                  <label className="form-label">
                    Loan Duration{" "}
                    <span className="text-muted">(Choose one)</span>
                  </label>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      value={30}
                      {...register("duration")}
                    />
                    <label className="form-check-label">
                      30 Days - {result.data?.liquidityShop?.interestA}% APY
                    </label>
                  </div>
                  <div className="form-check mt-10">
                    <input
                      type="radio"
                      {...register("duration")}
                      value={60}
                      className="form-check-input"
                    />
                    <label className="form-check-label">
                      60 Days - {result.data?.liquidityShop?.interestB}% APY
                    </label>
                  </div>
                  <div className="form-check mt-10">
                    <input
                      type="radio"
                      {...register("duration")}
                      value={90}
                      className="form-check-input"
                    />
                    <label className="form-check-label">
                      90 Days - {result.data?.liquidityShop?.interestC}% APY
                    </label>
                  </div>
                </div>
                {/* Loan duration end */}

                {/* Loan details start */}
                <label className="form-label mt-30">Loan Details</label>
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-calendar me-5 text-secondary-lm text-secondary-light-dm"></i>{" "}
                    Due Date
                  </div>
                  <div className="col-lg-6 text-lg-end">June 15, 2022</div>
                </div>
                <hr />
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-piggy-bank me-5 text-success"></i>{" "}
                    Total Loan
                  </div>
                  <div className="col-lg-6 text-lg-end">$25,000</div>
                </div>
                <hr />
                {/* Loan details end */}

                {/* Confirmation start */}
                <div className="form-group mt-30">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      {...register("acceptTerms", { required: true })}
                    />
                    <label className="form-check-label">
                      I have read and agreed to the NFTY Finance Terms &
                      Conditions
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <button
                    disabled={!isValid}
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                  >
                    Request Loan
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
