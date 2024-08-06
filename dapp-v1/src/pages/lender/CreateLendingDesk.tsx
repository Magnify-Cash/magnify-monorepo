import { PopupTokenList, PopupTransaction } from "@/components";
import ErrorDetails from "@/components/ErrorDetails";
import { Spinner } from "@/components/LoadingIndicator";
import type { INFTListItem, ITokenListItem } from "@/components/PopupTokenList";
import TransactionDetails from "@/components/TransactionDetails";
import { useToastContext } from "@/helpers/CreateToast";
import { useCustomWatchContractEvent } from "@/helpers/useCustomHooks";
import { fromWei, toWei } from "@/helpers/utils";
import {
  magnifyCashV1Address,
  useReadErc20Allowance,
  useWriteErc20Approve,
  useWriteMagnifyCashV1InitializeNewLendingDesk,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAccount, useChainId, useWaitForTransactionReceipt } from "wagmi";

export interface IConfigForm {
  selectedNftCollection?: INFTListItem;
  maxDuration: string;
  maxInterest: string;
  maxOffer: string;
  minDuration: string;
  minInterest: string;
  minOffer: string;
}

export const CreateLendingDesk = (props: any) => {
  /*
  react-router hooks
  */
  const navigate = useNavigate();

  /*
  wagmi hooks
  */
  const { address } = useAccount();
  const chainId = useChainId();

  /*
  form hooks / functions
  */
  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();
  const [deskConfigs, setDeskConfigs] = useState<Array<IConfigForm>>([]);
  const [editDesk, setEditDesk] = useState<boolean>(false);
  const [editDeskIndex, setEditDeskIndex] = useState<number>(0);
  const [deskFundingAmount, setDeskFundingAmount] = useState("0");
  const [checked, setChecked] = useState(false);
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<IConfigForm>();
  // Loads the supplied values into the add to desk/edit desk form
  const loadValuesIntoForm = (values: IConfigForm) => {
    for (const key in values) {
      //@ts-ignore
      setValue(key, values[key]);
    }
  };
  // handle deleting the lending desk config given the index
  // if deleted desk matches selected, than set edit desk to false
  const handleDeleteConfig = (index: number) => {
    const newDeskConfigs = deskConfigs.filter((_, i) => i !== index);
    setDeskConfigs(newDeskConfigs);
    if (
      nftCollection?.nft.address ===
      deskConfigs[index].selectedNftCollection?.nft.address
    ) {
      setEditDesk(false);
    }
  };
  //handle loading the form for editing the lending desk config given the index
  const handleEditConfig = (index: number) => {
    setEditDesk(true);
    setEditDeskIndex(index);
    const exisitingConfig = deskConfigs[index];
    Object.entries(exisitingConfig).forEach(([key, value]) => {
      setValue(key as keyof IConfigForm, value);
    });
    setNftCollection(exisitingConfig.selectedNftCollection);
  };
  //handle updating the lending desk config given the index and the new config
  const onUpdate: SubmitHandler<IConfigForm> = (newConfig) => {
    if (
      Number.parseFloat(newConfig.minDuration) >
        Number.parseFloat(newConfig.maxDuration) ||
      Number.parseFloat(newConfig.minInterest) >
        Number.parseFloat(newConfig.maxInterest) ||
      Number.parseFloat(newConfig.minOffer) > Number.parseFloat(newConfig.maxOffer)
    ) {
      addToast(
        "Invalid Input",
        "Please ensure that the min values are less than or equal to the max values",
        "error",
      );
      return;
    }
    if (
      Number.parseFloat(newConfig.minDuration) <= 0 ||
      Number.parseFloat(newConfig.minInterest) <= 0 ||
      Number.parseFloat(newConfig.minOffer) <= 0
    ) {
      addToast(
        "Invalid Input",
        "Please ensure that the min values are all greater than 0",
        "error",
      );
      return;
    }

    // Getting the value of selected nft("selectedNftCollection") directly from nftCollection state variable
    // If nft is selected form can not be submitted
    if (nftCollection) {
      newConfig.selectedNftCollection = nftCollection;
      const newDeskConfigs = deskConfigs.map((config, i) =>
        i === editDeskIndex ? newConfig : config,
      );
      setDeskConfigs(newDeskConfigs);
      //Don't switch to add desk mode because this collection is already added
    }
  };
  // Whenever an nft collection is selected, first check if
  // the collection is already present in result loan configs
  // If it is present then auto load the present values in the add to desk form
  useEffect(() => {
    if (nftCollection) {
      const selectedNftAddress = nftCollection.nft.address;
      const loanConfigs = deskConfigs;

      const filteredLoans = loanConfigs?.filter((loan) => {
        return (
          loan?.selectedNftCollection?.nft?.address.toLowerCase() ===
          selectedNftAddress.toLowerCase()
        );
      });

      const loanIndex = loanConfigs?.findIndex((loan) => {
        return (
          loan?.selectedNftCollection?.nft?.address.toLowerCase() ===
          selectedNftAddress.toLowerCase()
        );
      });

      if (filteredLoans?.length) {
        const selectedLoan = filteredLoans[0];
        setEditDesk(true);
        setEditDeskIndex(loanIndex as number);
        // const formValues = getFormValues(selectedLoan);
        loadValuesIntoForm(selectedLoan);
      } else {
        setEditDesk(false);
        setEditDeskIndex(0);
      }
    }
  }, [nftCollection]);
  //On submit of the lending desk form, add the form data to the deskConfigs state variable
  const onSubmit: SubmitHandler<IConfigForm> = (data) => {
    if (
      Number.parseFloat(data.minDuration) > Number.parseFloat(data.maxDuration) ||
      Number.parseFloat(data.minInterest) > Number.parseFloat(data.maxInterest) ||
      Number.parseFloat(data.minOffer) > Number.parseFloat(data.maxOffer)
    ) {
      addToast(
        "Invalid Input",
        "Please ensure that the min values are less than or equal to the max values",
        "error",
      );
      return;
    }
    if (
      Number.parseFloat(data.minDuration) <= 0 ||
      Number.parseFloat(data.minInterest) <= 0 ||
      Number.parseFloat(data.minOffer) <= 0
    ) {
      addToast(
        "Invalid Input",
        "Please ensure that the min values are all greater than 0",
        "error",
      );
      return;
    }
    // Getting the value of selected nft("selectedNftCollection") directly from nftCollection state variable
    // If nft is selected form can not be submitted
    if (nftCollection) {
      try {
        data.selectedNftCollection = nftCollection;
        setDeskConfigs([...deskConfigs, data]);
        //switch to edit desk mode because this collection is already added
        setEditDesk(true);
        setEditDeskIndex(deskConfigs.length);
      } catch (error) {
        console.error("Nft collection is not selected");
      }
    }
  };

  //Reset form on closing the confirm lending desk modal
  const resetForm = () => {
    setDeskFundingAmount("0");
  };
  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [initLendingDeskIsLoading, setInitLendingDeskIsLoading] =
    useState<boolean>(false);

  /*
  Hook to watch for contract events
  */
  useCustomWatchContractEvent({
    eventName: "NewLendingDeskInitialized",
    onLogs(logs) {
      // Close modal
      const modal = document.getElementsByClassName("modal show")[0];
      window.bootstrap.Modal.getInstance(modal)?.hide();
      // Redirect to manage desk page after 1 second
      setTimeout(() => {
        navigate(`/manage-desks/${logs[0].args.lendingDeskId?.toString()}`);
      }, 1000);
    },
  });

  /*
  ERC20 Token Allowance
  */
  const { data: approvalData, refetch: refetchApprovalData } = useReadErc20Allowance({
    address: token?.token?.address as `0x${string}`,
    args: [address as `0x${string}`, magnifyCashV1Address[chainId]],
  });
  const {
    data: approveErc20TransactionData,
    writeContractAsync: approveErc20,
    error: approveErc20Error,
  } = useWriteErc20Approve();
  const {
    isLoading: approveIsConfirming,
    isSuccess: approveIsConfirmed,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approveErc20TransactionData as `0x${string}`,
  });
  async function approveERC20TokenTransfer() {
    if (Number(deskFundingAmount) <= 0) {
      addToast("Error", <ErrorDetails error={"insufficient allowance"} />, "error");
      return;
    }
    if (checked) {
      addToast("Warning", <ErrorDetails error={"already approved"} />, "warning");
      return;
    }
    setApprovalIsLoading(true);
    await approveErc20({
      address: token?.token?.address as `0x${string}`,
      args: [
        magnifyCashV1Address[chainId],
        toWei(deskFundingAmount, token?.token?.decimals),
      ],
    });
  }
  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (
      Number(fromWei(approvalData, token?.token?.decimals)) >= Number(deskFundingAmount)
    ) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [deskFundingAmount, approvalData]);
  useEffect(() => {
    if (approveErc20Error) {
      console.log("ERROR");
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

  /*
   Create Lending Desk
  */
  const {
    data: initializeNewLendingDeskData,
    writeContractAsync: initializeNewLendingDesk,
    error: initializeNewLendingDeskError,
  } = useWriteMagnifyCashV1InitializeNewLendingDesk();
  const {
    isLoading: initDeskIsConfirming,
    isSuccess: initDeskIsConfirmed,
    error: initDeskConfirmError,
  } = useWaitForTransactionReceipt({
    hash: initializeNewLendingDeskData as `0x${string}`,
  });
  async function initDesk() {
    setInitLendingDeskIsLoading(true);
    await initializeNewLendingDesk({
      args: [
        token?.token?.address as `0x${string}`,
        toWei(deskFundingAmount, token?.token?.decimals),
        deskConfigs.map((config) => ({
          nftCollection: config.selectedNftCollection?.nft?.address as `0x${string}`,
          nftCollectionIsErc1155: false,
          minAmount: BigInt(toWei(config.minOffer, token?.token?.decimals)),
          maxAmount: toWei(config.maxOffer, token?.token?.decimals),
          // To account for days
          minDuration: Number.parseFloat(config.minDuration) * 24,
          maxDuration: Number.parseFloat(config.maxDuration) * 24,
          // To account for basis points
          minInterest: Number.parseFloat(config.minInterest) * 100,
          maxInterest: Number.parseFloat(config.maxInterest) * 100,
        })),
      ],
    });
  }
  useEffect(() => {
    if (initializeNewLendingDeskError) {
      console.error(initializeNewLendingDeskError);
      addToast(
        "Error",
        <ErrorDetails error={initializeNewLendingDeskError.message} />,
        "error",
      );
      setInitLendingDeskIsLoading(false);
    }
    if (initDeskConfirmError) {
      console.error(initDeskConfirmError);
      addToast("Error", <ErrorDetails error={initDeskConfirmError.message} />, "error");
      setInitLendingDeskIsLoading(false);
    }
    if (initDeskIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (initDeskIsConfirmed) {
      refetchApprovalData();
      if (loadingToastId) {
        // Close loading toast
        closeToast(loadingToastId);
        setLoadingToastId(null);
        // Display success toast
        addToast(
          "Transaction Successful",
          <TransactionDetails transactionHash={initializeNewLendingDeskData!} />,
          "success",
        );
      }
    }
  }, [
    initializeNewLendingDeskError,
    initDeskConfirmError,
    initDeskIsConfirming,
    initDeskIsConfirmed,
  ]);

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="row g-4 mt-n2 mb-4">
        <div className="col-xl-8">
          <div className="container-gluid g-0">
            <div className="row g-4">
              <div className="col-xl-12">
                <div className="card bg-primary-subtle border-primary-subtle rounded-4">
                  <div className="card-body p-4 w-lg-75">
                    <div>
                      <h5 className="fw-medium text-primary-emphasis">
                        Choose Currency
                      </h5>
                      <div
                        className="form-select form-select-lg py-2 border-primary-subtle bg-primary-subtle fs-5 mt-4"
                        data-bs-toggle="modal"
                        data-bs-target="#tokenModal"
                      >
                        {token ? (
                          <div className="d-flex align-items-center">
                            <img
                              src={token.token.logoURI}
                              alt={`${token.token.name} Logo`}
                              height="20"
                              width="20"
                            />
                            <p className="m-0 ms-1">{token.token.name}</p>
                          </div>
                        ) : (
                          "Choose Currency..."
                        )}
                      </div>
                      <PopupTokenList token modalId="tokenModal" onClick={setToken} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card bg-primary-subtle border-primary-subtle rounded-4">
                  <form id="configForm">
                    <div className="card-body p-4">
                      <div>
                        <h5 className="fw-medium text-primary-emphasis">
                          {editDesk
                            ? `Edit Collection ${editDeskIndex + 1} Parameters`
                            : " Choose Collection(s) & Parameters"}
                        </h5>
                        <div
                          className="form-select form-select-lg py-2 border-primary-subtle bg-primary-subtle fs-5 mt-4 w-lg-75"
                          data-bs-toggle="modal"
                          data-bs-target="#nftModal"
                        >
                          {nftCollection ? (
                            <div className="d-flex align-items-center">
                              <img
                                src={nftCollection.nft.logoURI}
                                alt={`${nftCollection.nft.name} Logo`}
                                height="20"
                                width="20"
                              />
                              <p className="m-0 ms-1">{nftCollection.nft.name}</p>
                            </div>
                          ) : (
                            "Choose NFT Collection..."
                          )}
                        </div>
                        <PopupTokenList
                          nft
                          modalId="nftModal"
                          onClick={setNftCollection}
                        />
                      </div>
                      <h6 className="fw-medium mt-4">Min/Max Offer</h6>
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("minOffer", { required: true })}
                                type="number"
                                className={`form-control fs-5${
                                  errors.minOffer ? " is-invalid" : ""
                                }`}
                                id="min-offer"
                                name="minOffer"
                                placeholder="Min Offer"
                                min="0"
                                max={"99999"}
                                step="any"
                                defaultValue="0"
                              />
                              <label htmlFor="min-offer">Min Offer</label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              {token?.token.symbol || ""}
                            </span>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("maxOffer", { required: true })}
                                type="number"
                                className={`form-control fs-5${
                                  errors.maxOffer ? " is-invalid" : ""
                                }`}
                                name="maxOffer"
                                placeholder="Max Offer"
                                min="0"
                                max="99999"
                                step="any"
                                defaultValue="0"
                              />
                              <label htmlFor="max-offer">Max Offer</label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              {token?.token.symbol || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h6 className="fw-medium mt-4">Min/Max Duration</h6>
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("minDuration", { required: true })}
                                type="number"
                                className={`form-control fs-5${
                                  errors.minDuration ? " is-invalid" : ""
                                }`}
                                name="minDuration"
                                placeholder="Min Duration"
                                min="0"
                                max="99999"
                                step="any"
                                defaultValue="0"
                              />
                              <label htmlFor="min-duration">Min Duration</label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              DAYS
                            </span>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("maxDuration", { required: true })}
                                type="number"
                                className={`form-control fs-5${
                                  errors.maxDuration ? " is-invalid" : ""
                                }`}
                                name="maxDuration"
                                placeholder="Max Durtion"
                                min="0"
                                max="99999"
                                step="any"
                                defaultValue="0"
                              />
                              <label htmlFor="max-duration">Max Duration</label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              DAYS
                            </span>
                          </div>
                        </div>
                      </div>
                      <h6 className="fw-medium mt-4">Min/Max Interest Rate</h6>
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("minInterest", { required: true })}
                                type="number"
                                className={`form-control fs-5${
                                  errors.minInterest ? " is-invalid" : ""
                                }`}
                                name="minInterest"
                                placeholder="Min Interest Rate"
                                min="0"
                                max="100"
                                step="any"
                                defaultValue="0"
                              />
                              <label htmlFor="min-interest-rate">
                                Min Interest Rate
                              </label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              %
                            </span>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("maxInterest", { required: true })}
                                type="number"
                                className={`form-control fs-5${
                                  errors.maxInterest ? " is-invalid" : ""
                                }`}
                                name="maxInterest"
                                placeholder="Max Durtion"
                                min="0"
                                max="100"
                                step="any"
                                defaultValue="0"
                              />
                              <label htmlFor="max-interest-rate">
                                Max Interest Rate
                              </label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="my-4 text-end">
                        <button
                          type="button"
                          className="btn btn-primary btn-lg py-2 px-5 rounded-pill"
                          disabled={!nftCollection}
                          onClick={
                            editDesk ? handleSubmit(onUpdate) : handleSubmit(onSubmit)
                          }
                          style={{
                            filter: !nftCollection ? "grayscale(1)" : "none",
                          }}
                        >
                          {!nftCollection
                            ? "Choose Collection"
                            : editDesk
                              ? "Update Desk"
                              : "Add to Desk"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card bg-primary-subtle border-primary-subtle rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-medium text-body-secondary mb-4">
                Lending Desk Details
              </h6>
              {token ? (
                <div>
                  <div className="pb-2 mb-2 border-bottom">
                    <div className="text-body-secondary">Currency Type</div>
                    <div className="mt-1 fs-5 d-flex align-items-center">
                      <img
                        src={token.token.logoURI}
                        alt={`${token.token.name} Logo`}
                        height="24"
                        className="d-block rounded-circle flex-shrink-0 me-2"
                      />
                      <div className="text-truncate">{token.token.name}</div>
                    </div>
                  </div>

                  {deskConfigs.map((config, index) => {
                    return (
                      <div
                        key={config.selectedNftCollection?.nft.address}
                        className="pb-2 mb-2 border-bottom"
                      >
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center">
                            <img
                              src={config.selectedNftCollection?.nft?.logoURI}
                              alt={`${config.selectedNftCollection?.nft.name} Logo`}
                              height="24"
                              className="d-block rounded-circle flex-shrink-0 me-2"
                            />
                            <div className="text-truncate fw-medium">
                              {config.selectedNftCollection?.nft.name}
                            </div>
                          </div>
                          <div className="flex-shrink-0 ms-auto">
                            <span className="text-body-secondary me-2">
                              <button
                                onClick={() => handleEditConfig(index)}
                                className="text-reset text-decoration-none btn border-0 p-0"
                                aria-label="Edit"
                              >
                                <i className="fa-regular fa-edit" />
                              </button>
                            </span>
                            <span className="text-danger-emphasis">
                              <button
                                onClick={() => handleDeleteConfig(index)}
                                className="text-reset text-decoration-none btn border-0 p-0"
                                aria-label="Delete"
                              >
                                <i className="fa-regular fa-trash-can" />
                              </button>
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 d-flex align-items-center">
                          <span className="flex-shrink-0 specific-w-25">
                            <i className="fa-light fa-hand-holding-dollar text-success-emphasis" />
                          </span>
                          <div className="text-truncate">
                            <strong>Offer:</strong> {config.minOffer}-{config.maxOffer}{" "}
                            {token.token.symbol}
                          </div>
                        </div>
                        <div className="mt-1 d-flex align-items-center">
                          <span className="flex-shrink-0 specific-w-25">
                            <i className="fa-light fa-calendar-clock text-info-emphasis" />
                          </span>
                          <div className="text-truncate">
                            <strong>Duration:</strong> {config.minDuration}-
                            {config.maxDuration} Days
                          </div>
                        </div>
                        <div className="mt-1 d-flex align-items-center">
                          <span className="flex-shrink-0 specific-w-25">
                            <i className="fa-light fa-badge-percent text-primary-emphasis" />
                          </span>
                          <div className="text-truncate">
                            <strong>Interest Rate:</strong> {config.minInterest}-
                            {config.maxInterest}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="text-body-secondary text-center"
                  style={{ fontSize: 16 }}
                >
                  <i className="fa-light fa-info-circle text-primary-emphasis"></i>
                  <span className="ms-2">Select currency to get started</span>
                </div>
              )}
            </div>
          </div>
          <div className="d-flex mb-2 mt-2">
            <PopupTransaction
              btnClass="btn btn-primary btn-lg mt-2 mb-4 ms-auto"
              btnText="Finalize Lending Desk"
              modalId="txModal"
              modalTitle="Confirm Lending Desk"
              onClose={resetForm}
              modalContent={
                <div>
                  <div className="card-body">
                    <h5 className="fw-medium text-body-secondary mb-4">
                      Lending Desk Details
                    </h5>
                    {token ? (
                      <div>
                        <div className="pb-2 mb-2 border-bottom">
                          <div className="text-body-secondary">Currency Type</div>
                          <div className="mt-1 fs-5 d-flex align-items-center">
                            <img
                              src={token.token.logoURI}
                              alt={`${token.token.name} Logo`}
                              height="24"
                              className="d-block rounded-circle flex-shrink-0 me-2"
                            />
                            <div className="text-truncate">{token.token.name}</div>
                          </div>
                        </div>

                        {deskConfigs.map((config, index) => {
                          return (
                            <div
                              key={config.selectedNftCollection?.nft.address}
                              className="pb-2 mb-2 border-bottom"
                            >
                              <div className="d-flex align-items-center">
                                <img
                                  src={config.selectedNftCollection?.nft?.logoURI}
                                  alt={`${config.selectedNftCollection?.nft.name} Logo`}
                                  height="24"
                                  className="d-block rounded-circle flex-shrink-0 me-2"
                                />
                                <div className="text-truncate fw-medium">
                                  {config.selectedNftCollection?.nft.name}
                                </div>
                              </div>
                              <div className="mt-2 d-flex align-items-center">
                                <span className="flex-shrink-0 specific-w-25">
                                  <i className="fa-light fa-hand-holding-dollar text-success-emphasis" />
                                </span>
                                <div className="text-truncate">
                                  <strong>Offer:</strong> {config.minOffer}-
                                  {config.maxOffer} {token.token.symbol}
                                </div>
                              </div>
                              <div className="mt-1 d-flex align-items-center">
                                <span className="flex-shrink-0 specific-w-25">
                                  <i className="fa-light fa-calendar-clock text-info-emphasis" />
                                </span>
                                <div className="text-truncate">
                                  <strong>Duration:</strong> {config.minDuration}-
                                  {config.maxDuration} Days
                                </div>
                              </div>
                              <div className="mt-1 d-flex align-items-center">
                                <span className="flex-shrink-0 specific-w-25">
                                  <i className="fa-light fa-badge-percent text-primary-emphasis" />
                                </span>
                                <div className="text-truncate">
                                  <strong>Interest Rate:</strong> {config.minInterest}-
                                  {config.maxInterest}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <img
                          src="/theme/images/ThinkingMeme.svg"
                          alt="Thinking"
                          className="img-fluid mx-auto d-block my-3 specific-w-150 mw-100"
                        />
                        <p className="text-center">
                          Start customizing to see details...
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-3">
                      <label htmlFor="fund-lending-desk" className="form-label">
                        Fund Lending Desk
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          value={deskFundingAmount}
                          onChange={(e) => setDeskFundingAmount(e.target.value)}
                          type="number"
                          className="form-control form-control-lg py-2 flex-grow-1"
                          id="fund-lending-desk"
                        />
                        <div className="flex-shrink-0 fs-5 d-flex align-items-center ms-3">
                          {token ? (
                            <img
                              src={token.token.logoURI}
                              height="24"
                              className="d-block rounded-circle flex-shrink-0 me-2"
                              alt={token?.token.symbol}
                            />
                          ) : (
                            <img
                              src="theme/images/image-10.png"
                              height="24"
                              className="d-block rounded-circle flex-shrink-0 me-2"
                              alt="Token Placeholder"
                            />
                          )}
                          <div className="text-truncate">
                            {token?.token.symbol || ""}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-check mb-3 ">
                      <input
                        checked={checked}
                        disabled={approvalIsLoading || Number(deskFundingAmount) <= 0}
                        onChange={() => approveERC20TokenTransfer()}
                        className="form-check-input me-3"
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
                          token?.token.symbol || ""
                        } transfer by checking this box.`}
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={!checked || initLendingDeskIsLoading}
                      onClick={() => initDesk()}
                      className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
                    >
                      {initLendingDeskIsLoading ? (
                        <Spinner show={initLendingDeskIsLoading} />
                      ) : (
                        "Create Lending Desk"
                      )}
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
