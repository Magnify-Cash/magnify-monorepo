import { useEffect, useState } from "react";
import { PopupTokenList, PopupTransaction } from "@/components";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";
import { useNftyFinanceV1InitializeNewLoan } from "@/wagmi-generated";
import { useQuery } from "urql";
import { QuickLoanDocument } from "../../../.graphclient";

export const QuickLoan = (props: any) => {
  // tokenlist state management
  const [token, _setToken] = useState<ITokenListItem | null>();
  const [nftCollection, _setNftCollection] = useState<INFTListItem | null>();
  const setToken = (e: string) => _setToken(JSON.parse(e));
  const setNftCollection = (e: string) => _setNftCollection(JSON.parse(e));

  // Loan params selection
  const [selectedLendingDesk, setSelectedLendingDesk] = useState<string>();
  const [nftId, setNftId] = useState<string>("1");
  const [duration, setDuration] = useState<string>("1");
  const [amount, setAmount] = useState<string>("1");

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
  const { writeAsync: initializeNewLoan } = useNftyFinanceV1InitializeNewLoan({
    args: [
      BigInt(selectedLendingDesk ?? 0),
      nftCollection?.nft.address as `0x${string}`,
      BigInt(1),
      BigInt(1),
      BigInt(1),
    ],
  });

  // Modal submit
  function handleModalSubmit() {
    console.log("token", token);
    console.log("nftCollection", nftCollection);
    console.log("selectedLendingDesk", selectedLendingDesk);
    console.log("wagmi function with above data.....");
    initializeNewLoan?.();
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
                flatResult.map((item) => (
                  <label className="col-12">
                    <input type="radio" name="shop" onClick={(e) => setSelectedLendingDesk(e.target.value)} className="border" value={item.lendingDesk.id} key={item.lendingDesk.id}/>
                      <p>{item.lendingDesk.owner}</p>
                      <p>Offer: {item.loanConfig.minAmount}-{item.loanConfig.maxAmount} {item.lendingDesk.erc20.symbol}</p>
                      <p>Duration: {item.loanConfig.minDuration}-{item.loanConfig.maxDuration} days</p>
                      <p>Interest: {item.loanConfig.minInterest}-{item.loanConfig.maxInterest}%</p>
                  </label>
                ))
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
          modalFunc={() => handleModalSubmit()}
          modalTitle="Get Loan"
          modalContent={<></>}
        />
      </div>
      {/* End Container*/}
    </div>
  );
};
