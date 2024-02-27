import { PopupTokenList, PopupTransaction } from "@/components";
import { INFTListItem, ITokenListItem } from "@/components/PopupTokenList";
import { useToastContext } from "@/helpers/CreateToast";
import { fromWei, toWei } from "@/helpers/utils";
import {
  nftyFinanceV1Address,
  useErc20Allowance,
  useErc20Approve,
  useNftyFinanceV1InitializeNewLendingDesk,
} from "@/wagmi-generated";
import { useEffect, useState } from "react";
import { useQuery } from "urql";
import { useAccount, useChainId, useWaitForTransaction } from "wagmi";
import { useForm, SubmitHandler } from "react-hook-form";
import { CreateLendingDeskDocument } from "../../../.graphclient";

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
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<IConfigForm>();

  //Loads the supplied values into the add to desk/edit desk form
  const loadValuesIntoForm = (values: IConfigForm) => {
    for (const key in values) {
      //@ts-ignore
      setValue(key, values[key]);
    }
  };

  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [approvalIsLoading, setApprovalIsLoading] = useState<boolean>(false);
  const [initLendingDeskIsLoading, setInitLendingDeskIsLoading] =
    useState<boolean>(false);

  // Data Hooks
  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();
  const [deskConfigs, setDeskConfigs] = useState<Array<IConfigForm>>([]);
  const [editDesk, setEditDesk] = useState<boolean>(false);
  const [editDeskIndex, setEditDeskIndex] = useState<number>(0);
  const [deskFundingAmount, setDeskFundingAmount] = useState("0");
  const [checked, setChecked] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();
  const [result] = useQuery({
    query: CreateLendingDeskDocument,
    variables: {
      walletAddress: address?.toLowerCase() || "",
    },
  });

  //handle deleting the lending desk config given the index
  const handleDeleteConfig = (index: number) => {
    const newDeskConfigs = deskConfigs.filter((_, i) => i !== index);
    setDeskConfigs(newDeskConfigs);
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
      newConfig.minDuration > newConfig.maxDuration ||
      newConfig.minInterest > newConfig.maxInterest ||
      newConfig.minOffer > newConfig.maxOffer
    ) {
      addToast(
        "Invalid Input",
        "Please ensure that the min values are less than or equal to the max values",
        "error"
      );
      return;
    }
    // Getting the value of selected nft("selectedNftCollection") directly from nftCollection state variable
    // If nft is selected form can not be submitted
    if (nftCollection) {
      newConfig.selectedNftCollection = nftCollection;
      const newDeskConfigs = deskConfigs.map((config, i) =>
        i === editDeskIndex ? newConfig : config
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
      data.minDuration > data.maxDuration ||
      data.minInterest > data.maxInterest ||
      data.minOffer > data.maxOffer
    ) {
      addToast(
        "Invalid Input",
        "Please ensure that the min values are less than or equal to the max values",
        "error"
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
        console.error(`Nft collection is not selected`);
      }
    }
  };

  // ERC20 Token Allowance Hook
  // Note: UseEffect check for existing token allowance to auto check the checkbox
  const { data: approveErc20TransactionData, writeAsync: approveErc20 } =
    useErc20Approve({
      address: token?.token?.address as `0x${string}`,
      args: [
        nftyFinanceV1Address[chainId],
        toWei(deskFundingAmount, token?.token?.decimals),
      ],
    });

  const { data: approvalData, refetch: refetchApprovalData } =
    useErc20Allowance({
      address: token?.token?.address as `0x${string}`,
      args: [address as `0x${string}`, nftyFinanceV1Address[chainId]],
    });

  //On successful transaction of approveErc20 hook, refetch the approval data
  useWaitForTransaction({
    hash: approveErc20TransactionData?.hash as `0x${string}`,
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

  useEffect(() => {
    if (!approvalData) {
      setChecked(false);
      return;
    }
    if (
      Number(fromWei(approvalData, token?.token?.decimals)) >=
      Number(deskFundingAmount)
    ) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [deskFundingAmount, approvalData]);

  // Create Lending Desk Hook

  const {
    data: initializeNewLendingDeskData,
    writeAsync: initializeNewLendingDesk,
  } = useNftyFinanceV1InitializeNewLendingDesk({
    args: [
      token?.token?.address as `0x${string}`,
      toWei(deskFundingAmount, token?.token?.decimals),
      deskConfigs.map((config) => ({
        nftCollection: config.selectedNftCollection?.nft
          ?.address as `0x${string}`,
        nftCollectionIsErc1155: false,
        minAmount: BigInt(toWei(config.minOffer, token?.token?.decimals)),
        maxAmount: toWei(config.maxOffer, token?.token?.decimals),
        // To account for days
        minDuration: parseFloat(config.minDuration) * 24,
        maxDuration: parseFloat(config.maxDuration) * 24,
        // To account for basis points
        minInterest: parseFloat(config.minInterest) * 100,
        maxInterest: parseFloat(config.maxInterest) * 100,
      })),
    ],
  });

  //On successful transaction of initializeNewLendingDesk hook, display success toast
  //On failure display error toast
  useWaitForTransaction({
    hash: initializeNewLendingDeskData?.hash as `0x${string}`,
    onSuccess(data) {
      // Close loading toast
      loadingToastId ? closeToast(loadingToastId) : null;
      // Display success toast
      addToast(
        "Transaction Successful",
        "Your transaction has been confirmed.",
        "success"
      );
      refetchApprovalData();
      // reset the desk funding amount
      setDeskFundingAmount("0");
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
    if (Number(deskFundingAmount) <= 0) {
      console.log("insufficient allowance");
      return;
    }
    if (checked) {
      console.log("already approved");
      return;
    }
    setApprovalIsLoading(true);
    try {
      await approveErc20();
    } catch (error) {}
    setApprovalIsLoading(false);
  }

  // Modal Submit function
  async function initLendingDesk() {
    console.log("token", token);
    console.log("deskConfigs", deskConfigs);
    console.log("nftCollection", nftCollection);
    console.log("deskFundingAmount", deskFundingAmount);
    console.log("wagmi function with above data.....");
    setInitLendingDeskIsLoading(true);
    try {
      await initializeNewLendingDesk();
    } catch (error) {}
    setInitLendingDeskIsLoading(false);
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

  //This hook is used to display loading toast when the initializeNewLendingDesk transaction is pending

  useEffect(() => {
    if (initializeNewLendingDeskData?.hash) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading"
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
  }, [initializeNewLendingDeskData?.hash]);

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="row g-4 mt-n2 mb-4">
        <div className="col-xl-8">
          <div className="container-gluid g-0">
            <div className="row g-4">
              <div className="col-xl-12">
                <div className="card border-0 shadow rounded-4">
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
                      <PopupTokenList
                        token
                        urls={["https://tokens.coingecko.com/uniswap/all.json"]}
                        modalId="tokenModal"
                        onClick={setToken}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card border-0 shadow rounded-4">
                  <form id="configForm">
                    <div className="card-body p-4">
                      <div>
                        <h5 className="fw-medium text-primary-emphasis">
                          {editDesk
                            ? `Edit Collection ${editDeskIndex + 1} Paramaters`
                            : " Choose Collection(s) & Paramaters"}
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
                              <p className="m-0 ms-1">
                                {nftCollection.nft.name}
                              </p>
                            </div>
                          ) : (
                            "Choose NFT Collection..."
                          )}
                        </div>
                        <PopupTokenList
                          nft
                          urls={[
                            "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json",
                          ]}
                          modalId="nftModal"
                          onClick={setNftCollection}
                        />
                      </div>
                      <h6 className="fw-medium text-primary-emphasis mt-4">
                        Min/Max Offer
                      </h6>
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("minOffer")}
                                type="number"
                                className="form-control fs-5"
                                id="min-offer"
                                name="minOffer"
                                placeholder="Min Offer"
                                min="0"
                                max={"99999"}
                                step="1"
                                defaultValue="0"
                              />
                              <label htmlFor="min-offer">Min Offer</label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              {token?.token.symbol || "USDT"}
                            </span>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("maxOffer")}
                                type="number"
                                className="form-control fs-5"
                                name="maxOffer"
                                placeholder="Max Offer"
                                min="0"
                                max="99999"
                                step="1"
                                defaultValue="0"
                              />
                              <label htmlFor="max-offer">Max Offer</label>
                            </div>
                            <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                              {token?.token.symbol || "USDT"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h6 className="fw-medium text-primary-emphasis mt-4">
                        Min/Max Duration
                      </h6>
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("minDuration")}
                                type="number"
                                className="form-control fs-5"
                                name="minDuration"
                                placeholder="Min Duration"
                                min="0"
                                max="99999"
                                step="1"
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
                                {...register("maxDuration")}
                                type="number"
                                className="form-control fs-5"
                                name="maxDuration"
                                placeholder="Max Durtion"
                                min="0"
                                max="99999"
                                step="1"
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
                      <h6 className="fw-medium text-primary-emphasis mt-4">
                        Min/Max Interest Rate
                      </h6>
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="input-group">
                            <div className="form-floating">
                              <input
                                {...register("minInterest")}
                                type="number"
                                className="form-control fs-5"
                                name="minInterest"
                                placeholder="Min Interest Rate"
                                min="0"
                                max="100"
                                step="1"
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
                                {...register("maxInterest")}
                                type="number"
                                className="form-control fs-5"
                                name="maxInterest"
                                placeholder="Max Durtion"
                                min="0"
                                max="100"
                                step="1"
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
                            editDesk
                              ? handleSubmit(onUpdate)
                              : handleSubmit(onSubmit)
                          }
                          style={{ filter: "grayscale(1)" }}
                        >
                          {editDesk ? "Update Desk" : "Add to Desk"}
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
          <div className="card border-0 shadow rounded-4 h-100">
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
                      <div key={index} className="pb-2 mb-2 border-bottom">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 ms-auto">
                            <span className="text-body-secondary me-2">
                              <button
                                onClick={() => handleEditConfig(index)}
                                className="text-reset text-decoration-none btn border-0 p-0"
                                aria-label="Edit"
                              >
                                <i className="fa-regular fa-edit"></i>
                              </button>
                            </span>
                            <span className="text-danger-emphasis">
                              <button
                                onClick={() => handleDeleteConfig(index)}
                                className="text-reset text-decoration-none btn border-0 p-0"
                                aria-label="Delete"
                              >
                                <i className="fa-regular fa-trash-can"></i>
                              </button>
                            </span>
                          </div>
                        </div>

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
                            <i className="fa-light fa-hand-holding-dollar text-success-emphasis"></i>
                          </span>
                          <div className="text-truncate">
                            <strong>Offer:</strong> {config.minOffer}-
                            {config.maxOffer} {token.token.symbol}
                          </div>
                        </div>
                        <div className="mt-1 d-flex align-items-center">
                          <span className="flex-shrink-0 specific-w-25">
                            <i className="fa-light fa-calendar-clock text-info-emphasis"></i>
                          </span>
                          <div className="text-truncate">
                            <strong>Duration:</strong> {config.minDuration}-
                            {config.maxDuration} Days
                          </div>
                        </div>
                        <div className="mt-1 d-flex align-items-center">
                          <span className="flex-shrink-0 specific-w-25">
                            <i className="fa-light fa-badge-percent text-primary-emphasis"></i>
                          </span>
                          <div className="text-truncate">
                            <strong>Interest Rate:</strong> {config.minInterest}
                            -{config.maxInterest}%
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
          </div>
          <div className="d-flex mb-2 mt-2">
            <PopupTransaction
              btnClass="btn btn-primary btn-lg mt-2 mb-4 ms-auto"
              btnText="Finalize Lending Desk"
              modalId="txModal"
              modalTitle="Confirm Lending Desk"
              modalContent={
                <div>
                  <div className="card-body">
                    <h5 className="fw-medium text-body-secondary mb-4">
                      Lending Desk Details
                    </h5>
                    {token ? (
                      <div>
                        <div className="pb-2 mb-2 border-bottom">
                          <div className="text-body-secondary">
                            Currency Type
                          </div>
                          <div className="mt-1 fs-5 d-flex align-items-center">
                            <img
                              src={token.token.logoURI}
                              alt={`${token.token.name} Logo`}
                              height="24"
                              className="d-block rounded-circle flex-shrink-0 me-2"
                            />
                            <div className="text-truncate">
                              {token.token.name}
                            </div>
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
                                  src={
                                    config.selectedNftCollection?.nft?.logoURI
                                  }
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
                                  <i className="fa-light fa-hand-holding-dollar text-success-emphasis"></i>
                                </span>
                                <div className="text-truncate">
                                  <strong>Offer:</strong> {config.minOffer}-
                                  {config.maxOffer} {token.token.symbol}
                                </div>
                              </div>
                              <div className="mt-1 d-flex align-items-center">
                                <span className="flex-shrink-0 specific-w-25">
                                  <i className="fa-light fa-calendar-clock text-info-emphasis"></i>
                                </span>
                                <div className="text-truncate">
                                  <strong>Duration:</strong> 4-30 Days
                                </div>
                              </div>
                              <div className="mt-1 d-flex align-items-center">
                                <span className="flex-shrink-0 specific-w-25">
                                  <i className="fa-light fa-badge-percent text-primary-emphasis"></i>
                                </span>
                                <div className="text-truncate">
                                  <strong>Interest Rate:</strong>{" "}
                                  {config.minInterest}-{config.maxInterest}%
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
                            {token?.token.symbol || "USDT"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-check mb-3 ">
                      <input
                        checked={checked}
                        disabled={approvalIsLoading}
                        onClick={() => approveERC20TokenTransfer()}
                        className="form-check-input me-3"
                        type="checkbox"
                        value=""
                        id="flexCheckChecked"
                        style={{ transform: "scale(1.5)" }}
                      />
                      <label
                        className="form-check-label "
                        htmlFor="flexCheckChecked"
                      >
                        {`Grant permission for ${
                          token?.token.symbol || "USDT"
                        } transfer by checking this box.`}
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={!checked || initLendingDeskIsLoading}
                      onClick={() => initLendingDesk()}
                      className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
                    >
                      Create Lending Desk
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
