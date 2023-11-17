import { useState } from "react";
import { PopupTokenList, PopupTransaction } from "@/components";
import { ITokenListItem, INFTListItem } from "@/components/PopupTokenList";
import {
  useNftyFinanceV1InitializeNewLendingDesk,
  nftyFinanceV1Address,
  useErc20Approve,
} from "@/wagmi-generated";
import { useChainId } from "wagmi";
import { LendingDeskDetails } from "@/components/LendingDeskDetails";

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
  const [token, _setToken] = useState<ITokenListItem | null>();
  const [nftCollection, _setNftCollection] = useState<INFTListItem | null>();
  const setToken = (e: string) => _setToken(JSON.parse(e));
  const setNftCollection = (e: string) => _setNftCollection(JSON.parse(e));
  const [deskConfigs, setDeskConfigs] = useState<Array<IConfigForm>>([]);
  const [deskFundingAmount, setDeskFundingAmount] = useState("");

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
    formData.forEach((value, key) => {
      if (key === "nftCollection" || key === "hiddenInputNft") {
        try {
          formJson[key] = JSON.parse(value as string);
        } catch (error) {
          console.error(`Error parsing JSON for key '${key}':`, error);
        }
      } else {
        formJson[key] = value;
      }
    });
    setDeskConfigs([...deskConfigs, formJson]);
  }

  // Create Lending Desk Hook
  const chainId = useChainId();
  const { writeAsync: approveErc20 } = useErc20Approve({
    address: token?.token?.address as `0x${string}`,
    args: [nftyFinanceV1Address[chainId], BigInt(deskFundingAmount)],
  });
  const { writeAsync: initializeNewLendingDesk } =
    useNftyFinanceV1InitializeNewLendingDesk({
      args: [
        token?.token?.address as `0x${string}`,
        BigInt(deskFundingAmount),
        deskConfigs.map((config) => ({
          nftCollection: config.hiddenInputNft.nft.address as `0x${string}`,
          nftCollectionIsErc1155: false,
          minAmount: BigInt(config.minOffer),
          maxAmount: BigInt(config.maxOffer),
          minDuration: BigInt(config.minDuration),
          maxDuration: BigInt(config.maxDuration),
          minInterest: BigInt(config.minInterest),
          maxInterest: BigInt(config.maxInterest),
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
              <div className="col-xl-7">
                <div className="card border-0 shadow rounded-4">
                  <div className="card-body p-4">
                    <h5 className="fw-medium text-primary-emphasis">
                      Lending Desk Name
                    </h5>
                    <input
                      type="text"
                      className="form-control form-control-lg py-2 border-0 bg-transparent fs-5 fw-bold mt-4"
                      id="name"
                      placeholder="Lending Desk 1"
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-5">
                <div className="card border-0 shadow rounded-4">
                  <div className="card-body p-4">
                    <h5 className="fw-medium text-primary-emphasis">
                      Choose Currency
                    </h5>
                    <select
                      className="form-select form-select-lg py-2 border-primary-subtle bg-primary-subtle fs-5 mt-4"
                      id="select-currency"
                    >
                      <option value="ETH" selected>
                        ETH
                      </option>
                      <option value="...">...</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card border-0 shadow rounded-4">
                  <div className="card-body p-4">
                    <h5 className="fw-medium text-primary-emphasis">
                      Choose Collection(s) & Paramaters
                    </h5>
                    <select
                      className="form-select form-select-lg py-2 border-primary-subtle bg-primary-subtle fs-5 mt-4 w-lg-75"
                      id="select-collection"
                    >
                      <option value="Pudgy" selected>
                        Pudgy Penguins
                      </option>
                      <option value="...">...</option>
                    </select>
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
                              placeholder="Min Offer"
                              min="0"
                              max="99999"
                              step="1"
                              value="0"
                            />
                            <label htmlFor="min-offer">Min Offer</label>
                          </div>
                          <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                            USDT
                          </span>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-group">
                          <div className="form-floating">
                            <input
                              type="number"
                              className="form-control fs-5"
                              id="max-offer"
                              placeholder="Max Offer"
                              min="0"
                              max="99999"
                              step="1"
                              value="0"
                            />
                            <label htmlFor="max-offer">Max Offer</label>
                          </div>
                          <span className="input-group-text specific-w-75 px-0 justify-content-center bg-primary-subtle text-primary-emphasis fw-bold">
                            USDT
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
                              id="min-duration"
                              placeholder="Min Duration"
                              min="0"
                              max="99999"
                              step="1"
                              value="0"
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
                              id="max-duration"
                              placeholder="Max Durtion"
                              min="0"
                              max="99999"
                              step="1"
                              value="0"
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
                              id="min-interest-rate"
                              placeholder="Min Interest Rate"
                              min="0"
                              max="100"
                              step="1"
                              value="0"
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
                              id="max-interest-rate"
                              placeholder="Max Durtion"
                              min="0"
                              max="100"
                              step="1"
                              value="0"
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <LendingDeskDetails
            name="Lending Desk 1"
            currrencyType="USDC"
            id="1"
            collectionName="Doodles"
            offer="8000-16000 ETH"
            duration="4-30 Days"
            interestRate="1-5"
          />
          <div>
            <button
              type="button"
              className="btn btn-primary btn-lg py-2 px-5 rounded-pill d-block w-100"
            >
              Finalize Lending Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
