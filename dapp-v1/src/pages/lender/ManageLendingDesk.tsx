import { ManageFunds } from "@/components";
import ErrorDetails from "@/components/ErrorDetails";
import { Spinner } from "@/components/LoadingIndicator";
import { type INFTListItem, PopupTokenList } from "@/components/PopupTokenList";
import TransactionDetails from "@/components/TransactionDetails";
import { useToastContext } from "@/helpers/CreateToast";
import fetchNFTDetails, { type INft } from "@/helpers/FetchNfts";
import refetchData from "@/helpers/refetchData";
import { fromWei, toWei } from "@/helpers/utils";
import {
  useSimulateNftyFinanceV1SetLendingDeskState,
  useWriteNftyFinanceV1RemoveLendingDeskLoanConfig,
  useWriteNftyFinanceV1SetLendingDeskLoanConfigs,
  useWriteNftyFinanceV1SetLendingDeskState,
} from "@/wagmi-generated";
import type { NFTInfo } from "@nftylabs/nft-lists";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useQuery } from "urql";
import { useChainId, useWaitForTransactionReceipt } from "wagmi";
import { ManageLendingDeskDocument } from "../../../.graphclient";
import type { IConfigForm } from "./CreateLendingDesk";

export const ManageLendingDesk = (props: any) => {
  /*
  wagmi hooks
  */
  const chainId = useChainId();

  /*
  graphql hooks
  */
  const { id } = useParams();
  const [result, reexecuteQuery] = useQuery({
    query: ManageLendingDeskDocument,
    variables: {
      // @ts-ignore
      deskId: id,
    },
    requestPolicy: "cache-and-network",
  });
  const token = result.data?.lendingDesk?.erc20?.decimals;

  /*
  page title hook
  */
  const title = document.getElementById("base-title");
  useEffect(() => {
    if (title && result.data?.lendingDesk) {
      title.innerHTML = `Manage Lending Desk ${result.data?.lendingDesk?.id}`;
    }
  }, [result]);

  /*
  form hooks / functions
  */
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();
  const [editDesk, setEditDesk] = useState<boolean>(false);
  const [editDeskIndex, setEditDeskIndex] = useState<number>(0);
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<IConfigForm>();
  const [deskConfig, setDeskConfig] = useState<IConfigForm>({
    selectedNftCollection: {} as INFTListItem,
    minOffer: "0",
    maxOffer: "0",
    minDuration: "0",
    maxDuration: "0",
    minInterest: "0",
    maxInterest: "0",
  });
  const getFormValues = (selectedLoan: any) => {
    const { maxAmount, minAmount, maxDuration, minDuration, maxInterest, minInterest } =
      selectedLoan;
    const decimals = result?.data?.lendingDesk?.erc20?.decimals;
    const formValues: IConfigForm = {
      maxOffer: fromWei(maxAmount, decimals),
      minOffer: fromWei(minAmount, decimals),
      maxDuration: (maxDuration / 24).toString(),
      minDuration: (minDuration / 24).toString(),
      maxInterest: (maxInterest / 100).toString(),
      minInterest: (minInterest / 100).toString(),
    };
    return formValues;
  };
  //On submit of the add to desk form, add the form data to the deskConfigs state variable
  const onSubmit: SubmitHandler<IConfigForm> = (data) => {
    // Getting the value of selected nft("selectedNftCollection") directly from nftCollection state variable
    // If nft is not selected form can not be submitted
    if (nftCollection) {
      try {
        data.selectedNftCollection = nftCollection;
        setDeskConfig(data);
      } catch (error: any) {
        console.error("Nft collection is not selected");
      }
    }
  };
  //Loads the supplied values into the add to desk/edit desk form
  const loadValuesIntoForm = (values: IConfigForm) => {
    for (const key in values) {
      //@ts-ignore
      setValue(key, values[key]);
    }
  };

  const handleEditCollection = (index: number) => {
    // Extract loanConfigs from result.data.lendingDesk
    const loanConfigs = result.data?.lendingDesk?.loanConfigs?.items;
    const selectedConfig = loanConfigs?.[index];
    const selectedNft = nftArr[index];

    // Set editDesk and editDeskIndex state
    setEditDesk(true);
    setEditDeskIndex(index);

    // load the selected config into form values
    const formValues = getFormValues(selectedConfig);

    // Set form values
    Object.entries(formValues).forEach(([key, value]) =>
      setValue(key as keyof IConfigForm, value),
    );

    // Set the selected NFT collection
    setNftCollection({ nft: selectedNft as NFTInfo });
  };
  //set deleting collection variable to true
  const handleDeleteCollection = async (index) => {
    const selectedNft = nftArr[index];
    setNftCollection({ nft: selectedNft as NFTInfo });
    try {
      await deleteCollection({
        args: [
          BigInt(result.data?.lendingDesk?.id || 0),
          selectedNft?.address as `0x${string}`,
        ],
      });
    } catch (error: any) {
      console.error(error);
      addToast("Error", <ErrorDetails error={error.message} />, "error");
    }
  };
  // Whenever an nft collection is selected, first check if
  // the collection is already present in result loan configs
  // If it is present then auto load the present values in the add to desk form
  useEffect(() => {
    if (nftCollection) {
      const selectedNftAddress = nftCollection.nft.address;
      const loanConfigs = result?.data?.lendingDesk?.loanConfigs;
      const filteredLoans = loanConfigs?.items?.filter((loan) => {
        return loan.nftCollection.id.toLowerCase() === selectedNftAddress.toLowerCase();
      });
      const loanIndex = loanConfigs?.items?.findIndex((loan) => {
        return loan.nftCollection.id.toLowerCase() === selectedNftAddress.toLowerCase();
      });
      if (filteredLoans?.length) {
        const selectedLoan = filteredLoans[0];
        setEditDesk(true);
        setEditDeskIndex(loanIndex as number);
        const formValues = getFormValues(selectedLoan);
        loadValuesIntoForm(formValues);
      } else {
        setEditDesk(false);
        setEditDeskIndex(0);
      }
    }
  }, [nftCollection]);

  /*
  toast hooks
  */
  const { addToast, closeToast } = useToastContext();
  const [loadingToastId, setLoadingToastId] = useState<number | null>(null);
  const [freezeUnfreezeIsLoading, setFreezeUnfreezeIsLoading] =
    useState<boolean>(false);
  const [updateDeskIsLoading, setUpdateDeskIsLoading] = useState<boolean>(false);

  /*
  Fetch NFT Details
  This is used to lookup a list of NFTs off chain
  */
  const [nftArr, setNftArr] = useState<INft[]>([]);
  const getNFTs = async () => {
    const nftIds: string[] | undefined =
      result.data?.lendingDesk?.loanConfigs?.items.map((loan) => loan.nftCollection.id);
    if (nftIds?.length) {
      const resultArr = await fetchNFTDetails(nftIds, chainId);
      setNftArr(resultArr);
    }
  };
  useEffect(() => {
    if (!result.fetching) {
      getNFTs();
    }
  }, [result.data]);

  /*
  Freeze/Unfreeze lending desk
  */
  const boolStatus = result.data?.lendingDesk?.status === "Frozen" ? false : true;
  const boolString = boolStatus ? "Freeze" : "Un-Freeze";
  const {
    data: freezeConfig,
    isLoading: freezeConfigIsLoading,
    error: freezeConfigError,
    refetch: refetchFreezeConfig,
  } = useSimulateNftyFinanceV1SetLendingDeskState({
    args: [BigInt(result.data?.lendingDesk?.id || 0), boolStatus],
    query: {
      enabled: !!result.data?.lendingDesk?.id,
    },
  });
  const {
    data: freezeData,
    writeContractAsync: freezeWrite,
    error: freezeError,
  } = useWriteNftyFinanceV1SetLendingDeskState();
  const {
    isLoading: freezeIsConfirming,
    isSuccess: freezeIsConfirmed,
    error: freezeConfirmError,
  } = useWaitForTransactionReceipt({
    hash: freezeData as `0x${string}`,
  });
  const freezeUnfreeze = async () => {
    //Check if freezeConfig is undefined or freezeConfigError is not null
    if (!freezeConfig || freezeConfigError) {
      console.error("freezeConfigError", freezeConfigError?.message);
      addToast(
        "Error",
        <ErrorDetails
          error={
            freezeConfigError
              ? freezeConfigError.message
              : "Error initiating freeze/unfreeze"
          }
        />,
        "error",
      );
      return;
    }
    setFreezeUnfreezeIsLoading(true);
    await freezeWrite(freezeConfig!.request);
  };
  useEffect(() => {
    if (freezeError) {
      console.error(freezeError);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Failed",
        <ErrorDetails error={freezeError.message} />,
        "error",
      );
      setFreezeUnfreezeIsLoading(false);
    }
    if (freezeConfirmError) {
      console.error(freezeConfirmError);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Failed",
        <ErrorDetails error={freezeConfirmError.message} />,
        "error",
      );
      setFreezeUnfreezeIsLoading(false);
    }
    if (freezeIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (freezeIsConfirmed) {
      refetchData(reexecuteQuery);
      refetchFreezeConfig();
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Successful",
        <TransactionDetails transactionHash={freezeData!} />,
        "success",
      );
      setFreezeUnfreezeIsLoading(false);
    }
  }, [freezeError, freezeConfirmError, freezeIsConfirming, freezeIsConfirmed]);

  /*
  Update Lending Desk Configurations
  */
  const {
    data: updateLendingDeskData,
    writeContractAsync: updateLendingDesk,
    error: updateLendingDeskError,
  } = useWriteNftyFinanceV1SetLendingDeskLoanConfigs();
  const {
    isLoading: updateLendingDeskIsConfirming,
    isSuccess: updateLendingDeskIsConfirmed,
    error: updateLendingDeskConfirmError,
  } = useWaitForTransactionReceipt({
    hash: updateLendingDeskData as `0x${string}`,
  });
  async function updateDesk() {
    setUpdateDeskIsLoading(true);
    await updateLendingDesk({
      args: [
        BigInt(result.data?.lendingDesk?.id || 0),
        [
          {
            nftCollection: deskConfig?.selectedNftCollection?.nft
              ?.address as `0x${string}`,
            nftCollectionIsErc1155: false,
            minAmount: BigInt(
              toWei(deskConfig?.minOffer, result.data?.lendingDesk?.erc20?.decimals),
            ),
            maxAmount: toWei(
              deskConfig?.maxOffer,
              result.data?.lendingDesk?.erc20?.decimals,
            ),
            // To account for days
            minDuration: Number.parseFloat(deskConfig?.minDuration) * 24, // Convert days to hours
            maxDuration: Number.parseFloat(deskConfig?.maxDuration) * 24,
            // To account for basis points
            minInterest: Number.parseFloat(deskConfig?.minInterest) * 100,
            maxInterest: Number.parseFloat(deskConfig?.maxInterest) * 100,
          },
        ],
      ],
    });
  }
  useEffect(() => {
    if (updateLendingDeskError) {
      console.error(updateLendingDeskError);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Failed",
        <ErrorDetails error={updateLendingDeskError.message} />,
        "error",
      );
      setUpdateDeskIsLoading(false);
    }
    if (updateLendingDeskConfirmError) {
      console.error(updateLendingDeskConfirmError);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Failed",
        <ErrorDetails error={updateLendingDeskConfirmError.message} />,
        "error",
      );
      setUpdateDeskIsLoading(false);
    }
    if (updateLendingDeskIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (updateLendingDeskIsConfirmed) {
      refetchData(reexecuteQuery);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Successful",
        <TransactionDetails transactionHash={updateLendingDeskData!} />,
        "success",
      );
      setEditDesk(false);
      setEditDeskIndex(0);
      setUpdateDeskIsLoading(false);
    }
  }, [
    updateLendingDeskError,
    updateLendingDeskConfirmError,
    updateLendingDeskIsConfirming,
    updateLendingDeskIsConfirmed,
  ]);
  useEffect(() => {
    //Call update desk hook when deskconfig is updated i.e. when new deskconfig is submitted via the form
    // Check if nftCollection is selected from the drop down selection list before calling update desk hook
    //This stops the update desk hook from being called when the page is first loaded as nftCollection is null
    if (nftCollection?.nft?.address) {
      updateDesk();
    }
  }, [deskConfig]);

  /*
  Delete Lending Desk Hook
  */
  const {
    data: deleteCollectionData,
    writeContractAsync: deleteCollection,
    error: deleteCollectionError,
  } = useWriteNftyFinanceV1RemoveLendingDeskLoanConfig();
  const {
    isLoading: deleteCollectionIsConfirming,
    isSuccess: deleteCollectionIsConfirmed,
    error: deleteCollectionConfirmError,
  } = useWaitForTransactionReceipt({
    hash: deleteCollectionData as `0x${string}`,
  });
  useEffect(() => {
    if (deleteCollectionError) {
      console.error(deleteCollectionError);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Failed",
        <ErrorDetails error={deleteCollectionError.message} />,
        "error",
      );
    }
    if (deleteCollectionConfirmError) {
      console.error(deleteCollectionConfirmError);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Failed",
        <ErrorDetails error={deleteCollectionConfirmError.message} />,
        "error",
      );
    }
    if (deleteCollectionIsConfirming) {
      const id = addToast(
        "Transaction Pending",
        "Please wait for the transaction to be confirmed.",
        "loading",
      );
      if (id) {
        setLoadingToastId(id);
      }
    }
    if (deleteCollectionIsConfirmed) {
      refetchData(reexecuteQuery);
      loadingToastId ? closeToast(loadingToastId) : null;
      addToast(
        "Transaction Successful",
        <TransactionDetails transactionHash={deleteCollectionData!} />,
        "success",
      );
    }
  }, [
    deleteCollectionError,
    deleteCollectionConfirmError,
    deleteCollectionIsConfirming,
    deleteCollectionIsConfirmed,
  ]);

  /*
  JSX Return
  */
  return result.data?.lendingDesk ? (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      <div className="text-body-secondary position-relative">
        <NavLink to="/manage-desks" className="text-reset text-decoration-none">
          <i className="fa-light fa-angle-left me-1" />
          Manage Lending Desks
        </NavLink>
      </div>
      <div className="row g-4 mt-n2 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-medium text-primary-emphasis">
                Lending Desk {result.data?.lendingDesk?.id}
              </h5>
              <div className="container-fluid g-0 mt-4">
                <div className="row g-4">
                  <div className="col-lg-4">
                    <h6 className="fw-medium text-body-secondary">Currency Type</h6>
                    <div className="mt-1 fs-4 d-flex align-items-center">
                      <div className="text-truncate">
                        {result.data?.lendingDesk?.erc20.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <h6 className="fw-medium text-body-secondary">
                      Available Liquidity
                    </h6>
                    <div className="mt-1 fs-4 text-body-secondary">
                      <strong className="text-primary-emphasis">
                        {fromWei(
                          result.data?.lendingDesk?.balance,
                          result.data?.lendingDesk?.erc20?.decimals,
                        )}
                        &nbsp;
                      </strong>
                      {result.data?.lendingDesk?.erc20.symbol}
                    </div>
                  </div>
                  <div className="col-lg-4 text-lg-end ">
                    <ManageFunds
                      lendingDesk={result?.data?.lendingDesk}
                      action="deposit"
                      reexecuteQuery={reexecuteQuery}
                    />
                    <ManageFunds
                      lendingDesk={result?.data?.lendingDesk}
                      action="withdraw"
                      reexecuteQuery={reexecuteQuery}
                    />
                    <div className=" form-check form-switch d-flex align-items-center justify-content-center space-x-4">
                      <input
                        className="form-check-input"
                        style={{ width: "20%", height: "30px" }}
                        type="checkbox"
                        role="switch"
                        aria-checked={!boolStatus}
                        id="freeze-unfreeze-switch"
                        checked={!boolStatus}
                        onChange={() => freezeUnfreeze()}
                        disabled={freezeUnfreezeIsLoading || freezeConfigIsLoading}
                        hidden={freezeUnfreezeIsLoading}
                      />
                      <Spinner show={freezeUnfreezeIsLoading} size="sm" />
                      <label
                        className="form-check-label fs-5 text-primary-emphasis fw-medium  text-end ms-2"
                        htmlFor="freeze-unfreeze-switch"
                      >
                        {boolString}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End row */}
        <div className="col-xxl-6">
          <div className="card border-0 shadow rounded-4 h-100 overflow-hidden d-block">
            <div className="card-body p-4 specific-h-75">
              <h5 className="fw-medium text-primary-emphasis">
                {/* Total number of collections */}
                Collections | {result.data?.lendingDesk?.loanConfigs?.items.length}
              </h5>
            </div>
            <div className="card-body p-4 pt-0 specific-h-xxl-450 overflow-y-auto">
              {result.data?.lendingDesk?.loanConfigs?.items.map((config, index) => {
                return (
                  <div key={config.id} className="pb-2 mb-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          src={nftArr[index]?.logoURI}
                          alt={nftArr[index]?.symbol}
                          height="24"
                          className="d-block rounded-circle flex-shrink-0 me-2"
                        />
                        <div className="text-truncate fw-medium">
                          {nftArr[index]?.name}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ms-auto">
                        <span className="text-body-secondary me-2">
                          <button
                            onClick={() => handleEditCollection(index)}
                            className="text-reset text-decoration-none btn border-0 p-0"
                            aria-label="Edit"
                          >
                            <i className="fa-regular fa-edit" />
                          </button>
                        </span>
                        <span className="text-danger-emphasis">
                          <button
                            onClick={() => handleDeleteCollection(index)}
                            className="text-reset text-decoration-none btn border-0 p-0"
                            aria-label="Edit"
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
                        <strong>Offer:</strong>{" "}
                        {fromWei(
                          config.minAmount,
                          result.data?.lendingDesk?.erc20?.decimals,
                        )}
                        -
                        {fromWei(
                          config.maxAmount,
                          result.data?.lendingDesk?.erc20?.decimals,
                        )}{" "}
                        {result.data?.lendingDesk?.erc20.symbol}
                      </div>
                    </div>
                    <div className="mt-1 d-flex align-items-center">
                      <span className="flex-shrink-0 specific-w-25">
                        <i className="fa-light fa-calendar-clock text-info-emphasis" />
                      </span>
                      <div className="text-truncate">
                        <strong>Duration:</strong> {config.minDuration / 24}-
                        {config.maxDuration / 24} Days
                      </div>
                    </div>
                    <div className="mt-1 d-flex align-items-center">
                      <span className="flex-shrink-0 specific-w-25">
                        <i className="fa-light fa-badge-percent text-primary-emphasis" />
                      </span>
                      <div className="text-truncate">
                        <strong>Interest Rate:</strong> {config.minInterest / 100}-
                        {config.maxInterest / 100}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-xxl-6">
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body p-4">
              <div>
                <h5 className="fw-medium text-primary-emphasis">
                  {editDesk
                    ? `Edit Collection ${editDeskIndex + 1} & Paramaters`
                    : "Collection Paramaters"}
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
                <PopupTokenList nft modalId="nftModal" onClick={setNftCollection} />
              </div>
              <h6 className="fw-medium text-primary-emphasis mt-4">Min/Max Offer</h6>
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
                        placeholder="Min Offer"
                        min="0"
                        max="99999"
                        step="1"
                      />
                      <label htmlFor="min-offer">Min Offer</label>
                    </div>
                    <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                      {result.data?.lendingDesk?.erc20.symbol}
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
                        id="max-offer"
                        placeholder="Max Offer"
                        min="0"
                        max="99999"
                        step="1"
                      />
                      <label htmlFor="max-offer">Max Offer</label>
                    </div>
                    <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                      {result.data?.lendingDesk?.erc20.symbol}
                    </span>
                  </div>
                </div>
              </div>
              <h6 className="fw-medium text-primary-emphasis mt-4">Min/Max Duration</h6>
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
                        id="min-duration"
                        placeholder="Min Duration"
                        min="0"
                        max="99999"
                        step="1"
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
                        id="max-duration"
                        placeholder="Max Durtion"
                        min="0"
                        max="99999"
                        step="1"
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
                        {...register("minInterest", { required: true })}
                        type="number"
                        className={`form-control fs-5${
                          errors.minInterest ? " is-invalid" : ""
                        }`}
                        id="min-interest-rate"
                        placeholder="Min Interest Rate"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <label htmlFor="min-interest-rate">Min Interest Rate</label>
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
                        id="max-interest-rate"
                        placeholder="Max Durtion"
                        min="0"
                        max="100"
                        step="1"
                      />
                      <label htmlFor="max-interest-rate">Max Interest Rate</label>
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
                  disabled={!nftCollection || updateDeskIsLoading}
                  onClick={handleSubmit(onSubmit)} //update deskconfig state
                  className="btn btn-primary btn-lg py-2 px-5 rounded-pill"
                >
                  {updateDeskIsLoading ? (
                    <Spinner show={updateDeskIsLoading} />
                  ) : editDesk ? (
                    "Update Collection"
                  ) : (
                    "Add to Desk"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
