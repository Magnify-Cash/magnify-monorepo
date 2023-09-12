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
  nftyFinanceV1Address
} from "@/wagmi-generated";
import { QuickLoanDocument } from "../../../.graphclient";

export const QuickLoan = (props: any) => {
  // constants
  const chainId = useChainId();

  // tokenlist / nftlist state management
  const [token, _setToken] = useState<ITokenListItem | null>();
  const [nftCollection, _setNftCollection] = useState<INFTListItem | null>();
  const setToken = (e: string) => _setToken(JSON.parse(e));
  const setNftCollection = (e: string) => _setNftCollection(JSON.parse(e));

  // Loan params selection
  const [selectedLendingDesk, _setSelectedLendingDesk] = useState<string>();
  const [nftId, setNftId] = useState<string>();
  const [duration, setDuration] = useState<string>("1");
  const [amount, setAmount] = useState<string>("1");
  const setSelectedLendingDesk = (e: string) => _setSelectedLendingDesk(JSON.parse(e));

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
    args: [nftyFinanceV1Address[chainId], BigInt(amount)],
  });
  const { config:newLoanConfig, refetch: newLoanRefetch } = usePrepareNftyFinanceV1InitializeNewLoan({
    enabled:false,
    args: [
      BigInt(selectedLendingDesk?.lendingDesk?.id ?? 0),
      nftCollection?.nft.address as `0x${string}`,
      BigInt(1),
      BigInt(1),
      BigInt(1),
    ],
  })
  const { writeAsync:newLoanWrite } = useNftyFinanceV1InitializeNewLoan(newLoanConfig);

  // Modal submit
  async function handleModalSubmit() {
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
    newLoanRefetch();
    await approveErc721();
    await newLoanWrite?.();
  }

  return (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      {/* Start Container */}
      <div className="row g-5">
        <div className="col-lg-4">
          <div className="card border-0 bg-primary shadow rounded-4">
            <div className="card-body">Choose NFT</div>
          </div>
          <div className="card border-0 shadow rounded-4 h-100">
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
        <div className="col-lg-4">
          <div className="card border-0 bg-primary shadow rounded-4">
            <div className="card-body">Choose Currency</div>
          </div>
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body">
              {nftCollection ? (
                <div>
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
                <div>
                  <img
                    height="200"
                    width="100%"
                    src="/theme/images/thinking_guy.svg"
                    alt="Thinking..."
                  />
                  <p className="text-center">
                    Select an NFT collection to see currencies...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 bg-primary shadow rounded-4">
            <div className="card-body">Select Offer</div>
          </div>
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body">
              {flatResult.length > 0 ? (
                flatResult.map((item) => {
                  return (
                  <label className="col-12" key={item.lendingDesk.id}>
                    <input type="radio" name="shop" onClick={(e) => setSelectedLendingDesk(e.target.value)} className="border" value={JSON.stringify(item)}/>
                      <p>{item.lendingDesk.owner}</p>
                      <p>Offer: {item.loanConfig.minAmount}-{item.loanConfig.maxAmount} {item.lendingDesk.erc20.symbol}</p>
                      <p>Duration: {item.loanConfig.minDuration}-{item.loanConfig.maxDuration} days</p>
                      <p>Interest: {item.loanConfig.minInterest}-{item.loanConfig.maxInterest}%</p>
                  </label>
                )})
              ) : (
                <div>
                  <img
                    height="200"
                    width="100%"
                    src="/theme/images/thinking_guy.svg"
                    alt="Thinking..."
                  />
                  <p className="text-center">Select currency & NFT to see offers...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <PopupTransaction
          divClass="col-12 d-flex"
          btnClass="btn btn-primary btn-lg mt-2 mb-4 ms-auto"
          disabled={!token || !nftCollection || !selectedLendingDesk}
          btnText="Get Loan"
          modalId="txModal"
          modalBtnText="Get Loan"
          modalTitle="Request Loan"
          modalContent={
            selectedLendingDesk && (
            <form id="quickLoanForm">
              <small>Lending Desk Details</small>
              <div className="row g-4">
                <div className="col-6 bg-secondary">
                  <h6>{selectedLendingDesk.loanConfig.nftCollection.id}</h6>
                  <small>collection type</small>
                </div>
                <div className="col-6 bg-secondary">
                  <h6>{selectedLendingDesk.loanConfig.minAmount} - {selectedLendingDesk.loanConfig.maxAmount} {selectedLendingDesk.lendingDesk.erc20.symbol}</h6>
                  <small>min/max offer</small>
                </div>
                <div className="col-6 bg-secondary">
                  <h6>{selectedLendingDesk.loanConfig.minDuration} days - {selectedLendingDesk.loanConfig.maxDuration} days</h6>
                  <small>min/max duration</small>
                </div>
                <div className="col-6 bg-secondary">
                  <h6>{selectedLendingDesk.loanConfig.minInterest} - {selectedLendingDesk.loanConfig.maxInterest} %</h6>
                  <small>min/max interest</small>
                </div>
              </div>
              <hr/>
              <div className="">
                <label className="form-label">Select NFT</label>
                <select name="nftID" className="form-select" onChange={(e) => setNftId(e.target.value)}>
                  <option disabled selected> -- select an option -- </option>
                  <option value="1">test</option>
                  <option value="2">test</option>
                </select>
              </div>
              <div className="mt-3">
                <label className="form-label">Select Duration</label>
                <input name="duration" min={selectedLendingDesk.loanConfig.minDuration} max={selectedLendingDesk.loanConfig.maxDuration} value={duration} onChange={e => setDuration(e.target.value)} type="number" className="form-control"/>
              </div>
              <div className="mt-3">
                <label className="form-label">Select Amount</label>
                <input name="amount" min={selectedLendingDesk.loanConfig.minAmount} max={selectedLendingDesk.loanConfig.maxAmount} value={amount} onChange={e => setAmount(e.target.value)} type="number" className="form-control"/>
              </div>
              {selectedLendingDesk && nftId && duration && amount &&
              <div className="mt-3">
                <hr/>
                <small>Loan Details</small>
                <p>{nftId}</p>
                <div className="d-flex justify-content-between">
                  <p>Duration: </p>
                  <p>{duration}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>Interest Rate</p>
                  <p>[interest</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>Requested Amount</p>
                  <p>{amount}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>2% Loan Origination Fee</p>
                  <p>[LOF]</p>
                </div>
                <hr/>
                <div className="d-flex justify-content-between">
                  <p>Gross Amount</p>
                  <h2 className="text-primary">[AMOUNT]</h2>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => handleModalSubmit()}>
                Button Text
                </button>
              </div>
            }
            </form>
          )
          }
        />
      </div>
      {/* End Container*/}
    </div>
  );
};
