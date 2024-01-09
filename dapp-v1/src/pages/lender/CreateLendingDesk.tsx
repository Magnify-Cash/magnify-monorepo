import { useState } from "react";
import { PopupTokenList, PopupTransaction } from "@/components";
import { ITokenListItem, INFTListItem } from "@/components/PopupTokenList";
import {
  useNftyFinanceV1InitializeNewLendingDesk,
  nftyFinanceV1Address,
  useErc20Approve,
} from "@/wagmi-generated";
import { useAccount, useChainId } from "wagmi";
import { toWei } from "@/helpers/utils";
import { useQuery } from "urql";
import { CreateLendingDeskDocument } from "../../../.graphclient";

interface IConfigForm {
  hiddenInputNft: INFTListItem;
  maxDuration: string;
  maxInterest: string;
  maxOffer: string;
  minDuration: string;
  minInterest: string;
  minOffer: string;
}

export const CreateLendingDesk = (props: any) => {
  // tokenlist state management
  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();
  const [deskConfigs, setDeskConfigs] = useState<Array<IConfigForm>>([]);
  const [deskFundingAmount, setDeskFundingAmount] = useState("0");

  const { address } = useAccount();
  const [result] = useQuery({
    query: CreateLendingDeskDocument,
    variables: {
      walletAddress: address?.toLowerCase(),
    },
  });

  console.log(deskConfigs);

  // lending desk config submit
  function handleConfigSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const form = document.getElementById("configForm") as HTMLFormElement;
    const isValid = form.checkValidity();

    if (!isValid) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);

    const formJson: IConfigForm = {} as IConfigForm;
    //Getting the value of selected nft("hiddenInputNft") directly from nftCollection state variable
    if (nftCollection) {
      try {
        formJson["hiddenInputNft"] = nftCollection;
      } catch (error) {
        console.error(`Nft collection is not selected`);
      }
    }
    formData.forEach((value, key) => {
      formJson[key] = value;
    });
    setDeskConfigs([...deskConfigs, formJson]);
  }

  // Create Lending Desk Hook
  const chainId = useChainId();
  const { writeAsync: approveErc20 } = useErc20Approve({
    address: token?.token?.address as `0x${string}`,
    args: [
      nftyFinanceV1Address[chainId],
      toWei(deskFundingAmount, token?.token?.decimals),
    ],
  });
  const { writeAsync: initializeNewLendingDesk } =
    useNftyFinanceV1InitializeNewLendingDesk({
      args: [
        token?.token?.address as `0x${string}`,
        toWei(deskFundingAmount, token?.token?.decimals),
        deskConfigs.map((config) => ({
          nftCollection: config.hiddenInputNft.nft.address as `0x${string}`,
          nftCollectionIsErc1155: false,
          minAmount: BigInt(toWei(config.minOffer, token?.token?.decimals)),
          maxAmount: toWei(config.maxOffer, token?.token?.decimals),
          // To account for days
          minDuration: BigInt(parseInt(config.minDuration) * 24),
          maxDuration: BigInt(parseInt(config.maxDuration) * 24),
          // To account for basis points
          minInterest: BigInt(parseInt(config.minInterest) * 100),
          maxInterest: BigInt(parseInt(config.maxInterest) * 100),
        })),
      ],
    });

  // modal submit
  async function initLendingDesk() {
    console.log("token", token);
    console.log("deskConfigs", deskConfigs);
    console.log("nftCollection", nftCollection);
    console.log("deskFundingAmount", deskFundingAmount);
    console.log("wagmi function with above data.....");
    await approveErc20();
    await initializeNewLendingDesk();
  }

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
                          Choose Collection(s) & Paramaters
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
                                type="number"
                                className="form-control fs-5"
                                id="min-offer"
                                name="minOffer"
                                placeholder="Min Offer"
                                min="0"
                                max="99999"
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
                          onClick={(e) => handleConfigSubmit(e)}
                          style={{ filter: "grayscale(1)" }}
                        >
                          Add to Desk
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
                          <div className="text-body-secondary text-truncate">
                            Collection {index + 1}
                          </div>
                          <div className="flex-shrink-0 ms-auto">
                            <span className="text-body-secondary me-2">
                              <a
                                href="#"
                                className="text-reset text-decoration-none"
                                aria-lable="Edit"
                              >
                                <i className="fa-regular fa-edit"></i>
                              </a>
                            </span>
                            <span className="text-danger-emphasis">
                              <a
                                href="#"
                                className="text-reset text-decoration-none"
                                aria-lable="Delete"
                              >
                                <i className="fa-regular fa-trash-can"></i>
                              </a>
                            </span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center">
                          <img
                            src={config.hiddenInputNft.nft?.logoURI}
                            alt={`${config.hiddenInputNft.nft.name} Logo`}
                            height="24"
                            className="d-block rounded-circle flex-shrink-0 me-2"
                          />
                          <div className="text-truncate fw-medium">
                            {config.hiddenInputNft.nft.name}
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
                              key={index}
                              className="pb-2 mb-2 border-bottom"
                            >
                              <div className="d-flex align-items-center">
                                <div className="text-body-secondary text-truncate">
                                  Collection {index + 1}
                                </div>
                                <div className="flex-shrink-0 ms-auto">
                                  <span className="text-body-secondary me-2">
                                    <a
                                      href="#"
                                      className="text-reset text-decoration-none"
                                      aria-lable="Edit"
                                    >
                                      <i className="fa-regular fa-edit"></i>
                                    </a>
                                  </span>
                                  <span className="text-danger-emphasis">
                                    <a
                                      href="#"
                                      className="text-reset text-decoration-none"
                                      aria-lable="Delete"
                                    >
                                      <i className="fa-regular fa-trash-can"></i>
                                    </a>
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center">
                                <img
                                  src={config.hiddenInputNft.nft?.logoURI}
                                  alt={`${config.hiddenInputNft.nft.name} Logo`}
                                  height="24"
                                  className="d-block rounded-circle flex-shrink-0 me-2"
                                />
                                <div className="text-truncate fw-medium">
                                  {config.hiddenInputNft.nft.name}
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
                              alt="Image"
                            />
                          ) : (
                            <img
                              src="theme/images/image-10.png"
                              height="24"
                              className="d-block rounded-circle flex-shrink-0 me-2"
                              alt="Image"
                            />
                          )}
                          <div className="text-truncate">
                            {token?.token.symbol || "USDT"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => initLendingDesk()}
                      className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
                    >
                      Request Loan
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
