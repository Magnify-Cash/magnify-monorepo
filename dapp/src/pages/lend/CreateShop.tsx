import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "urql";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { useEffect } from "react";

type CreateShopForm = {
  shopName: string;
  nftCollection: string;
  erc20: string;
  offerAmount: number;
  shopAmount: number;
  interestA: number;
  interestB: number;
  interestC: number;
};

export type CreateShopState = {
  form: CreateShopForm;
  erc20: {
    symbol: string;
    decimals: number;
  };
  nftCollection: {
    symbol: string;
    name: string;
  };
};

export const CreateShop = () => {
  // Hooks
  const navigate = useNavigate();
  const state = useLocation().state as CreateShopState;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<CreateShopForm>({
    // Take default values from state if available
    defaultValues: state?.form,
  });

  // GraphQL fetch
  const [result] = useQuery({ query: CreateShopDocument });

  // After GraphQL is done loading, set form values that depend on GraphQL
  useEffect(() => {
    if (state?.form && !result.fetching) {
      setValue("erc20", state.form.erc20, { shouldValidate: true });
      setValue("nftCollection", state.form.nftCollection, {
        shouldValidate: true,
      });
    }
  }, [result.fetching]);

  // Dynamic part of form that depends on selected ERC20
  const selectedErc20 = result.data?.erc20S.filter(
    (x) => x.id == watch("erc20")
  )[0];

  // Create Liquidity Shop Form
  const onSubmit = (form: CreateShopForm) => {
    if (!isValid) {
      console.log("Form is not valid");
      return;
    }

    // Navigate to confirm page with all data
    navigate("/lend/create-shop/confirm", {
      state: {
        form,
        erc20: selectedErc20,
        nftCollection: result.data?.nftCollections.filter(
          (x) => x.id == form.nftCollection
        )[0],
      },
    });
  };

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            {/* Header start --> */}
            <div className="content">
              <h1 className="text-strong fw-700 display-6 mt-0">
                New Liquidity Shop
              </h1>
              <p className="text-muted mb-0">
                Please fill out the following form to create your new Liquidity
                Shop.
              </p>
            </div>
            {/* Header end --> */}

            {/* Content start --> */}
            <div className="card">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Shop name start --> */}
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    {...register("shopName", { required: true })}
                    className="form-control form-control-alt form-control-lg"
                    placeholder="Name of your Liquidity Shop"
                  />
                </div>
                {/* Shop name end --> */}

                {/* Maximum offer start --> */}
                <h6 className="fsr-5 text-strong mt-40 mb-0">
                  <i className="fa-light fa-money-check-dollar text-primary me-5"></i>
                  Set Your Maximum Offer
                </h6>
                <p className="text-muted fs-base-n2 mb-30">
                  Set a maximum offer for your shop.
                </p>
                <div className="form-group">
                  <label className="form-label">Select Collection</label>
                  <select
                    className="form-select form-select-lg"
                    {...register("nftCollection", { required: true })}
                  >
                    <option value="">Select NFT Collection</option>
                    {result.data?.nftCollections.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6">
                      <label className="form-label">Offer Amount</label>
                      <input
                        type="number"
                        step="1"
                        {...register("offerAmount", {
                          required: true,
                          min: selectedErc20
                            ? ethers.utils.formatUnits(
                                selectedErc20?.minimumPaymentAmount,
                                selectedErc20?.decimals
                              )
                            : 0,
                          valueAsNumber: true,
                        })}
                        className="form-control form-control-alt form-control-lg form-number"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Select Coin</label>
                      <select
                        {...register("erc20")}
                        className="form-select form-select-lg"
                      >
                        <option value="">Select Token</option>
                        {result.data?.erc20S.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {/* Maximum offer end --> */}

                {/* Add liquidity start --> */}
                <h6 className="fsr-5 text-strong mt-40 mb-0">
                  <i className="fa-light fa-badge-dollar text-primary me-5"></i>
                  Add Liquidity to Your Shop
                </h6>
                <p className="text-muted fs-base-n2 mb-30">
                  Add liquidity to your shop by setting the shop amount and the
                  interest rates.
                </p>
                <div className="form-group">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6">
                      <label className="form-label">Shop Amount</label>
                      <input
                        type="number"
                        step="1"
                        {...register("shopAmount", {
                          required: true,
                          min: selectedErc20
                            ? ethers.utils.formatUnits(
                                selectedErc20?.minimumBasketSize,
                                selectedErc20?.decimals
                              )
                            : 0,
                        })}
                        className="form-control form-control-alt form-control-lg form-number"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Selected Coin</label>
                      <div className="form-control form-control-alt form-control-lg d-flex align-items-center">
                        {selectedErc20 ? (
                          <div className="d-flex align-items-center">
                            <img
                              height="24"
                              width="24"
                              src={`/images/tokens/${selectedErc20.symbol}.svg`}
                              alt="Token Logo"
                            />
                            <div className="ms-10">
                              {selectedErc20.name} ({selectedErc20.symbol})
                            </div>
                          </div>
                        ) : (
                          <div>...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedErc20 ? (
                  <div className="text-center text-muted fs-base-n2 mt-10">
                    NOTES: Minimum Shop size is{" "}
                    {ethers.utils.formatUnits(
                      selectedErc20.minimumBasketSize,
                      selectedErc20.decimals
                    )}{" "}
                    {selectedErc20.symbol}
                  </div>
                ) : null}

                {/* Add liquidity end --> */}

                {/* Interest rates start --> */}
                <h6 className="fsr-6 text-strong mt-40 mb-30">
                  Preferred Interest Rates
                </h6>
                <div className="form-group">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6 align-self-center">
                      <label className="text-muted">30 days</label>
                    </div>
                    <div className="col-lg-6">
                      <div className="position-relative">
                        <input
                          type="number"
                          step="1"
                          {...register("interestA", {
                            required: true,
                            min: 0,
                            valueAsNumber: true,
                          })}
                          className="form-control form-control-alt form-control-lg form-number"
                          placeholder="0.0"
                        />
                        <label className="position-absolute top-50 end-0 translate-y-middle p-10">
                          %
                        </label>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6 align-self-center">
                      <label className="text-muted">60 days</label>
                    </div>
                    <div className="col-lg-6">
                      <div className="position-relative">
                        <input
                          type="number"
                          step="1"
                          {...register("interestB", {
                            required: true,
                            min: 0,
                            valueAsNumber: true,
                          })}
                          className="form-control form-control-alt form-control-lg form-number"
                          placeholder="0.0"
                        />
                        <label className="position-absolute top-50 end-0 translate-y-middle p-10">
                          %
                        </label>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6 align-self-center">
                      <label className="text-muted">90 days</label>
                    </div>
                    <div className="col-lg-6">
                      <div className="position-relative">
                        <input
                          type="number"
                          step="1"
                          {...register("interestC", {
                            required: true,
                            min: 0,
                            valueAsNumber: true,
                          })}
                          className="form-control form-control-alt form-control-lg form-number"
                          placeholder="0.0"
                        />
                        <label className="position-absolute top-50 end-0 translate-y-middle p-10">
                          %
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Interest rates end --> */}

                <div className="form-group mt-30">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
            {/* Content end --> */}
          </div>
        </div>
      </div>
    </div>
  );
};
