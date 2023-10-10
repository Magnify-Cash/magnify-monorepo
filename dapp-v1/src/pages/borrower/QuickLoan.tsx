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
  const [selectedLendingDesk, _setSelectedLendingDesk] = useState<any>();
  const [nftId, setNftId] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();
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
    args: [nftyFinanceV1Address[chainId], BigInt(nftId || 0)],
  });
  const { config:newLoanConfig } = usePrepareNftyFinanceV1InitializeNewLoan({
    args: [
      BigInt(selectedLendingDesk?.lendingDesk?.id ?? 0),
      nftCollection?.nft.address as `0x${string}`,
      BigInt(nftId || 0),
      BigInt(duration || 0),
      BigInt(amount || 0),
    ],
  })
  const { writeAsync:newLoanWrite } = useNftyFinanceV1InitializeNewLoan(newLoanConfig);

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
            <div className="card-body">
              Choose NFT
            </div>
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
            <div className="card-body">
              Choose Currency
            </div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
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
              <div className="card-body specific-h-400 overflow-y-auto pt-0">
                 <img src="/images/placeholder/images/image-11.png" alt="Thinking" className="img-fluid mx-auto d-block my-3"/>
                 <p className="text-center text-body-secondary fst-italic">
                   Start customizing to see offers
                 </p>
               </div>
              )}
            </div>
          </div>
        </div>
        {/* Column end */}

        {/* Column start */}
        <div className="col-md-6 col-xl-4">
          <div className="card rounded-3 bg-primary-subtle text-primary-emphasis border-primary-subtle text-center fs-5 mb-3">
            <div className="card-body">
              Select Offer
            </div>
          </div>
          <div className="card border-0 shadow rounded-4 overflow-hidden d-block">
            <div className="card-body">
              {flatResult.length > 0 ? (
              flatResult.map((item) => {
                return (
                <label className="col-12" key={item.lendingDesk.id}>
                <input type="radio" name="shop" onClick={(e) => setSelectedLendingDesk((e.target as HTMLInputElement).value)} className="border" value={JSON.stringify(item)}/>
                  <p>{item.lendingDesk.owner}</p>
                  <p>Offer: {item.loanConfig.minAmount}-{item.loanConfig.maxAmount} {item.lendingDesk.erc20.symbol}</p>
                  <p>Duration: {item.loanConfig.minDuration}-{item.loanConfig.maxDuration} days</p>
                  <p>Interest: {item.loanConfig.minInterest}-{item.loanConfig.maxInterest}%</p>
                </label>
              )})
              ) : (
              <div className="card-body specific-h-400 overflow-y-auto pt-0">
                 <img src="/images/placeholder/images/image-11.png" alt="Thinking" className="img-fluid mx-auto d-block my-3"/>
                 <p className="text-center text-body-secondary fst-italic">
                   Start customizing to see offers
                 </p>
               </div>
              )}
            </div>
          </div>
        </div>
        {/* Column end */}
      </div>
      {/* End Container*/}
    </div>
  );
};
