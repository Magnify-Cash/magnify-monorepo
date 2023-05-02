import {
  getProtocolAddress,
  getProtocolChain,
} from "@/helpers/ProtocolDefaults";
import { toast } from "@/helpers/Toast";
import {
  usePrepareNftyLendingCreateLiquidityShop,
  useNftyLendingCreateLiquidityShop,
} from "../../../../wagmi-generated";
import { Web3Button } from "@/components";
import { BigNumber, ethers } from "ethers";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNetwork } from "wagmi";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { CreateShopState } from "./CreateShop";

export const CreateShopConfirm = () => {
  // hooks
  const navigate = useNavigate();
  const state = useLocation().state as CreateShopState;

  // web3 hooks
  const { chain } = useNetwork();
  const { address, isConnecting, isDisconnected } = useAccount();

  // token allowance read hook
  // check how many tokens have been approved
  const { data: allowanceData, refetch: allowanceRefetch } = useContractRead({
    // @ts-ignore
    address: state.form.erc20,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, getProtocolAddress(chain?.id)],
    chainId: chain?.id,
  });

  // token approval write hook
  // used for approving tokens to spend in liquidity shop
  const { config: approvalConfig, error: approvalError } =
    usePrepareContractWrite({
      // @ts-ignore
      address: state.form.erc20,
      abi: erc20ABI,
      functionName: "approve",
      args: [
        getProtocolAddress(chain?.id),
        ethers.utils.parseUnits(
          state.form.shopAmount?.toString(),
          state.erc20.decimals
        ),
      ],
      chainId: chain?.id,
    });
  const {
    write: approvalWrite,
    data: approvalData,
    isLoading: approvalLoading,
  } = useContractWrite({
    ...approvalConfig,
    onSettled(data, error) {
      toast({
        title: "Token Approval",
        content: error ? error?.message : data?.hash,
        alertType: error ? "alert-danger" : "alert-success",
      });
    },
  });

  // create liquidity shop hook
  const {
    config: createShopConfig,
    refetch: createShopRefetch,
    isLoading: createShopLoading,
    error: createShopError,
    isError: createShopErrorBool,
  } = usePrepareNftyLendingCreateLiquidityShop({
    chainId: getProtocolChain(chain?.id),
    args: [
      state.form.shopName, // string calldata _name,
      // @ts-ignore
      state.form.erc20, // address _erc20,
      // @ts-ignore
      state.form.nftCollection, // address _nftCollection,
      ethers.utils.parseUnits(
        state.form.shopAmount.toString(),
        state.erc20.decimals
      ), // uint256 _liquidityAmount,
      BigNumber.from(state.form.interestA), // uint256 _interestA,
      BigNumber.from(state.form.interestB), // uint256 _interestB,
      BigNumber.from(state.form.interestC), // uint256 _interestC,
      ethers.utils.parseUnits(
        state.form.offerAmount.toString(),
        state.erc20.decimals
      ), // uint256 _maxOffer,
      true, // bool _automaticApproval,
      false, // bool _allowRefinancingTerms
    ],
  });
  const { write: createShopWrite } = useNftyLendingCreateLiquidityShop({
    ...createShopConfig,
    onSettled(data, error) {
      // if error
      if (error) {
        console.log(data, error);
      }

      // if success
      else {
        navigate("/lend/create-shop/success", {
          state: {
            ...state,
            createShopTx: data?.hash,
          },
        });
      }
    },
  });

  // Effects
  useEffect(() => {
    allowanceRefetch();
    createShopRefetch();
  }, [approvalData]);

  /*
	Submit Button
	Handles conditional render logic for varying approve -> create flow (+ loading)
	*/
  const SubmitButton = () => {
    // Token allowance less than amount required by shop
    // Prompt user to approve more tokens
    if (
      allowanceData &&
      allowanceData <
        ethers.utils.parseUnits(
          state.form.shopAmount.toString(),
          state.erc20.decimals
        )
    ) {
      return (
        <div className="form-group">
          <Web3Button
            loading={approvalLoading}
            error={approvalError}
            onClick={() => approvalWrite?.()}
            className="btn btn-primary btn-lg btn-block"
          >
            {`Approve ${state.form.shopAmount} ${state.erc20.symbol}`}
          </Web3Button>
        </div>
      );
    }

    // Token allowance has been met
    // However, not enough tokens to fund shop
    // Prompt User: Unsure. Display Error
    if (
      allowanceData &&
      allowanceData >=
        ethers.utils.parseUnits(
          state.form.shopAmount.toString(),
          state.erc20.decimals
        ) &&
      createShopErrorBool
    ) {
      return (
        <div className="form-group">
          <Web3Button
            loading={createShopLoading}
            error={createShopError}
            onClick={() => createShopWrite?.()}
            className="btn btn-primary btn-lg btn-block"
          >
            Not enough {state.erc20.symbol} tokens
          </Web3Button>
        </div>
      );
    }

    // Token allowance has been met
    // Prompt user to create liquidity shop
    if (
      allowanceData &&
      allowanceData >=
        ethers.utils.parseUnits(
          state.form.shopAmount.toString(),
          state.erc20.decimals
        )
    ) {
      return (
        <div className="form-group">
          <Web3Button
            error={createShopError}
            loading={createShopLoading}
            onClick={() => createShopWrite?.()}
            className="btn btn-primary btn-lg btn-block"
          >
            Create Liquidity Shop
          </Web3Button>
        </div>
      );
    }

    // Default blank return
    return (
      <div className="form-group">
        <Web3Button
          isConnected={!!address && (!isConnecting || !isDisconnected)}
          className="btn btn-primary btn-lg btn-block"
        ></Web3Button>
      </div>
    );
  };

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            {/* Content start --> */}
            <div className="card">
              <Link
                to={"/lend/create-shop"}
                state={state}
                className="link-reset text-decoration-none fw-bold d-inline-flex align-items-center"
              >
                <i className="fa-solid fa-circle-arrow-left fs-base-p4 text-primary me-10"></i>
                Go Back
              </Link>
              <h1 className="text-strong fw-700 display-6 mt-5 mb-0">
                Confirm Liquidity Shop
              </h1>
              <p className="text-muted mt-5">
                Please double-check the data you've entered and confirm your
                Liquidity Shop.
              </p>
              <div className="row mt-40 mb-10">
                <div className="col-lg-6 text-muted">Shop Name</div>
                <div className="col-lg-6 text-lg-end">
                  {state.form.shopName}
                </div>
              </div>
              <hr />
              <div className="row my-10">
                <div className="col-lg-6 text-muted">Collection Ratio</div>
                <div className="col-lg-6 text-lg-end">
                  1 {state.erc20.symbol} = {state.form.offerAmount}{" "}
                  {state.erc20.symbol}
                </div>
              </div>
              <hr />
              <div className="row my-10">
                <div className="col-lg-6 text-muted">Shop Amount</div>
                <div className="col-lg-6 text-lg-end">
                  {state.form.shopAmount} {state.erc20.symbol}
                </div>
              </div>
              <hr />
              <div className="row my-10">
                <div className="col-lg-6 text-muted">Interest Rates</div>
                <div className="col-lg-6 text-lg-end">
                  {state.form.interestA}% (30d), &nbsp;
                  {state.form.interestB}% (60d), &nbsp;
                  {state.form.interestC}% (90d)
                </div>
              </div>
              <form className="mt-40" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label" htmlFor="approval_mechanism_1">
                    Approval Mechanism
                  </label>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="approval_mechanism_1"
                      defaultChecked
                    />
                    <label
                      className="form-check-label"
                      htmlFor="approval_mechanism_1"
                    >
                      Automatically accept all loan applications
                    </label>
                  </div>
                  <div className="form-check mt-10">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="approval_mechanism_2"
                      disabled
                    />
                    <label
                      className="form-check-label"
                      htmlFor="approval_mechanism_1"
                    >
                      Manually accept all loan applications (Coming Soon)
                    </label>
                  </div>
                </div>
                <div className="form-group mt-30">
                  <div className="form-check">
                    <input
                      required
                      type="checkbox"
                      className="form-check-input"
                      id="terms_and_conditions"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="terms_and_conditions"
                    >
                      I have read and agreed to the NFTY Finance Terms &
                      Conditions
                    </label>
                  </div>
                </div>
                <SubmitButton />
              </form>
            </div>
            {/* Content end --> */}
          </div>
        </div>
      </div>
    </div>
  );
};
