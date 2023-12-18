import { useState } from "react";
import { useQuery } from "urql";
import { useChainId } from "wagmi";
import { PopupTokenList, PopupTransaction } from "@/components";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";
import {
  useErc721Approve,
  useNftyFinanceV1InitializeNewLoan,
  usePrepareNftyFinanceV1InitializeNewLoan,
  nftyFinanceV1Address,
} from "@/wagmi-generated";
import { QuickLoanDocument } from "../../../.graphclient";

export const QuickLoan = (props: any) => {
  // constants
  const chainId = useChainId();

  // tokenlist / nftlist state management
  const [token, setToken] = useState<ITokenListItem | null>();
  const [nftCollection, setNftCollection] = useState<INFTListItem | null>();

  // Loan params selection
  const [selectedLendingDesk, _setSelectedLendingDesk] = useState<any>();
  const [nftId, setNftId] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const setSelectedLendingDesk = (e: string) =>
    _setSelectedLendingDesk(JSON.parse(e));

  // GraphQL query
  const flatResult: any[] = [];
  const [result] = useQuery({
    query: QuickLoanDocument,
    variables: {
      nftCollectionId: nftCollection?.nft?.address?.toLowerCase(),
      erc20Id: token?.token?.address?.toLowerCase(),
    },
  });
  for (const lendingDesk of result.data?.lendingDesks ?? []) {
    for (const loanConfig of lendingDesk.loanConfigs) {
      flatResult.push({ lendingDesk, loanConfig });
    }
  }

  // Initialize New Loan Hook
  const { writeAsync: approveErc721 } = useErc721Approve({
    address: nftCollection?.nft.address as `0x${string}`,
    args: [nftyFinanceV1Address[chainId], BigInt(nftId || 0)],
  });
  const { config: newLoanConfig } = usePrepareNftyFinanceV1InitializeNewLoan({
    args: [
      BigInt(selectedLendingDesk?.lendingDesk?.id ?? 0),
      nftCollection?.nft.address as `0x${string}`,
      BigInt(nftId || 0),
      BigInt(duration || 0),
      BigInt(amount || 0),
    ],
  });
  const { writeAsync: newLoanWrite } =
    useNftyFinanceV1InitializeNewLoan(newLoanConfig);

  // Modal submit
  async function requestLoan() {
    const form = document.getElementById("quickLoanForm") as HTMLFormElement;
    const isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
      return;
    }
    console.log("token", token);
    console.log("nftCollection", nftCollection);
    console.log("selectedLendingDesk", selectedLendingDesk);
    console.log("nftId", nftId);
    console.log("duration", duration);
    console.log("amount", amount);
    console.log("form is valid, wagmi functions with above data.....");
    console.log(newLoanConfig);
    await approveErc721();
    await newLoanWrite?.();
  }

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="row g-4 justify-content-center mt-0">
        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">Choose NFT</div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            <div className="card-body">
              <div
                className="form-select w-100 btn btn-secondary"
                id="currency"
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
                urls={[
                  "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json",
                ]}
                modalId="nftModal"
                onClick={setNftCollection}
              />
            </div>
          </div>
        </div>
        {/* Column end */}

        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">Choose Currency</div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            {nftCollection ? (
              <div className="card-body">
                <div
                  className="form-select w-100 btn btn-secondary"
                  id="currency"
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
            ) : (
              <div className="card-body specific-h-400 overflow-y-auto pt-0">
                <img
                  src="/theme/images/ThinkingMeme.svg"
                  alt="Thinking"
                  className="img-fluid mx-auto d-block my-3 specific-w-150 mw-100"
                />
                <p className="text-center text-body-secondary fst-italic">
                  Start customizing to see offers
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Column end */}

        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">Select Offer</div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            <div className="card-body specific-h-400 overflow-y-auto">
              {flatResult.length > 0 ? (
                flatResult.map((item) => {
                  console.log(item);
                  return (
                    <div className="nfty-check" key={item.lendingDesk.id}>
                      <input
                        type="radio"
                        className="btn-check"
                        autoComplete="off"
                        name="desks"
                        id={item.lendingDesk.id}
                        onClick={(e) =>
                          setSelectedLendingDesk(
                            (e.target as HTMLInputElement).value
                          )
                        }
                        value={JSON.stringify(item)}
                      />
                      <label
                        className="btn py-2 d-block w-100 border border-secondary border-opacity-25"
                        htmlFor={item.lendingDesk.id}
                      >
                        <div className="d-flex align-items-center justify-content-center mx-auto">
                          <img
                            src="/images/placeholder/images/image-12.png"
                            width="30"
                            alt="Image"
                            className="flex-shrink-0"
                          />
                          <span className="ms-3">0x4323...43vfk32</span>
                        </div>
                        <div className="container-fluid g-0">
                          <div className="row g-2 mt-2">
                            <div className="col">
                              <div className="p-2 rounded-3 bg-success-subtle text-center">
                                <div className="text-success-emphasis h3 mb-3">
                                  <i className="fa-light fa-hand-holding-dollar"></i>
                                </div>
                                <div className="fw-bold">
                                  {item.loanConfig.maxAmount}
                                </div>
                                <small className="fw-normal">max offer</small>
                              </div>
                            </div>
                            <div className="col">
                              <div className="p-2 rounded-3 bg-info-subtle text-center">
                                <div className="text-info-emphasis h3 mb-3">
                                  <i className="fa-light fa-calendar-clock"></i>
                                </div>
                                <div className="fw-bold">
                                  {item.loanConfig.maxDuration} days
                                </div>
                                <small className="fw-normal">duration</small>
                              </div>
                            </div>
                            <div className="col">
                              <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-center">
                                <div className="text-primary-emphasis h3 mb-3">
                                  <i className="fa-light fa-badge-percent"></i>
                                </div>
                                <div className="fw-bold">
                                  {item.loanConfig.maxInterest} %
                                </div>
                                <small className="fw-normal">interest</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="card-body specific-h-400 overflow-y-auto pt-0">
                  <img
                    src="/theme/images/ThinkingMeme.svg"
                    alt="Thinking"
                    className="img-fluid mx-auto d-block my-3 specific-w-150 mw-100"
                  />
                  <p className="text-center text-body-secondary fst-italic">
                    Start customizing to see offers
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Column end */}
        <div className="my-4 text-end">
          <PopupTransaction
            btnClass="btn btn-primary btn-lg py-3 px-5 rounded-pill"
            disabled={!token || !nftCollection || !selectedLendingDesk}
            btnText="Get Loan"
            modalId="txModal"
            modalTitle="Get Loan"
            modalFooter={
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => requestLoan()}
                  className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1"
                >
                  Request Loan
                </button>
              </div>
            }
            modalContent={
              selectedLendingDesk && (
                <form id="quickLoanForm" className="modal-body">
                  <p className="text-body-secondary">Lending Desk Details</p>
                  <div className="container-fluid g-0 mt-3">
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                          <div className="d-flex align-items-center justify-content-center">
                            <img
                              src="/images/placeholder/images/image-5.png"
                              alt="Image"
                              className="d-block flex-shrink-0 me-2 rounded-circle"
                              width="30"
                            />
                            <div className="h5 fw-medium m-0">
                              Pudgy Penguins
                            </div>
                          </div>
                          <div className="text-body-secondary">
                            Collection Type
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                          <div className="d-flex align-items-center justify-content-center">
                            <div className="h4 fw-medium">
                              {selectedLendingDesk.loanConfig.minAmount}-
                              {selectedLendingDesk.loanConfig.maxAmount}
                            </div>
                            <span className="text-body-secondary ms-2">
                              {selectedLendingDesk.lendingDesk.erc20.symbol}
                            </span>
                          </div>
                          <div className="text-body-secondary">
                            Min/Max Offer
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                          <div className="d-flex align-items-center justify-content-center">
                            <div className="h4 fw-medium">
                              {selectedLendingDesk.loanConfig.minDuration}-
                              {selectedLendingDesk.loanConfig.maxDuration}
                            </div>
                            <span className="text-body-secondary ms-2">
                              Days
                            </span>
                          </div>
                          <div className="text-body-secondary">
                            Min/Max Duration
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                          <div className="d-flex align-items-center justify-content-center">
                            <div className="h4 fw-medium">
                              {selectedLendingDesk.loanConfig.minInterest} -{" "}
                              {selectedLendingDesk.loanConfig.maxInterest}
                            </div>
                            <span className="text-body-secondary ms-2">%</span>
                          </div>
                          <div className="text-body-secondary">
                            Min/Max Interest Rate
                          </div>
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
                      >
                        <option selected>Select NFT</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="...">Pudgy Penguins #421</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="set-duration" className="form-label">
                        Set Duration
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control form-control-lg py-2"
                          id="set-duration"
                          placeholder="Duration"
                          step="1"
                          min={selectedLendingDesk.loanConfig.minDuration}
                          max={selectedLendingDesk.loanConfig.maxDuration}
                          value={duration}
                          // @ts-ignore
                          onChange={(e) => setDuration(e.target.value)}
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
                          className="form-control form-control-lg py-2"
                          id="set-amount"
                          placeholder="Amount"
                          step="1"
                          min={selectedLendingDesk.loanConfig.minAmount}
                          max={selectedLendingDesk.loanConfig.maxAmount}
                          value={amount}
                          // @ts-ignore
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="input-group-text">
                          {selectedLendingDesk.lendingDesk.erc20.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-body-secondary">Loan Overview</p>
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src="/images/placeholder/images/image-1.png"
                      className="img-fluid flex-shrink-0 me-3"
                      width="32"
                      alt="Image"
                    />
                    <h6 className="m-0">Pudgy Penguin #7338</h6>
                  </div>
                  <div className="my-2 d-flex align-items-center">
                    <span className="text-body-secondary">Duration</span>
                    <span className="fw-medium ms-auto">{duration} Days</span>
                  </div>
                  <div className="my-2 d-flex align-items-center">
                    <span className="text-body-secondary">
                      Interest Rate{" "}
                      <i className="fa-light fa-info-circle ms-1"></i>
                    </span>
                    <span className="fw-medium ms-auto">3%</span>
                  </div>
                  <div className="my-2 d-flex align-items-center">
                    <span className="text-body-secondary">
                      Requested Amount
                    </span>
                    <span className="fw-medium ms-auto">
                      {amount} {selectedLendingDesk.lendingDesk.erc20.symbol}
                    </span>
                  </div>
                  <div className="my-2 d-flex align-items-center">
                    <span className="text-body-secondary">
                      2% Loan Origination Fee{" "}
                      <i className="fa-light fa-info-circle ms-1"></i>
                    </span>
                    <span className="fw-medium ms-auto">
                      -180 {selectedLendingDesk.lendingDesk.erc20.symbol}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-top d-flex align-items-center">
                    <span className="text-body-secondary">Gross Amount</span>
                    <span className="h3 ms-auto my-0 text-primary-emphasis">
                      8820{" "}
                      <span className="fw-medium">
                        {selectedLendingDesk.lendingDesk.erc20.symbol}
                      </span>
                    </span>
                  </div>
                </form>
              )
            }
          />
        </div>
      </div>
      {/* End Container*/}
    </div>
  );
};
