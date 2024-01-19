import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { useChainId } from "wagmi";
import { BrowseCollectionDocument } from "../../../.graphclient";
import { fromWei, toWei } from "@/helpers/utils";
import fetchNFTDetails, { INft } from "@/helpers/FetchNfts";
import { formatAddress } from "@/helpers/formatAddress";
import { IToken, fetchTokensForCollection } from "@/helpers/FetchTokens";
import {
  nftyFinanceV1Address,
  useErc721Approve,
  useNftyFinanceV1InitializeNewLoan,
  usePrepareNftyFinanceV1InitializeNewLoan,
} from "@/wagmi-generated";
import GetLoanModal from "@/components/GetLoanModal";

export const BrowseCollection = (props) => {
  // GraphQL
  const { collection_address } = useParams();
  const chainId = useChainId();
  const [result] = useQuery({
    query: BrowseCollectionDocument,
    variables: {
      nftCollectionId: collection_address,
    },
  });
  const { data, fetching, error } = result;

  var title = document.getElementById("base-title");
  useEffect(() => {
    // This function will be executed whenever the query data changes
    const getTitle = async () => {
      if (!fetching && collection_address) {
        const fetchedNftArr: INft[] = await fetchNFTDetails([
          collection_address,
        ]);
        if (title) {
          title.innerHTML = `${fetchedNftArr[0].name} Liquidity Desks`;
        }
      }
    };
    getTitle();
  }, [data]);

  useEffect(() => {
    // This function will be executed whenever the query data changes
    if (!fetching) {
      getTokenDetails();
      getNFTdetails();
    }
  }, [data]);

  // loan params selection
  const [nft, setNFT] = useState<INft>();
  const [nftId, setNftId] = useState<number>();
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [selectedLendingDesk, setSelectedLendingDesk] = useState<any>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();

  const getTokenDetails = async () => {
    const fetchedTokens = await fetchTokensForCollection(result.data);
    setTokens(fetchedTokens);
  };

  const getNFTdetails = async () => {
    const fetchedNfts = await fetchNFTDetails([collection_address!]);
    setNFT(fetchedNfts[0]); //There is only one nft in the array
  };

  // Initialize New Loan Hook
  const { writeAsync: approveErc721 } = useErc721Approve({
    address: nft?.address as `0x${string}`,
    args: [nftyFinanceV1Address[chainId], BigInt(nftId || 0)],
  });
  const { config: newLoanConfig } = usePrepareNftyFinanceV1InitializeNewLoan({
    args: [
      BigInt(selectedLendingDesk?.id ?? 0),
      nft?.address as `0x${string}`,
      BigInt(nftId || 0),
      BigInt((duration || 0) * 24),
      toWei(
        amount ? amount.toString() : "0",
        selectedLendingDesk?.erc20.decimals
      ),
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
    await approveErc721();
    await newLoanWrite?.();
  }

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      <div className="text-body-secondary position-relative mt-n3">
        <NavLink to="/explore" className="text-reset text-decoration-none">
          <i className="fa-light fa-angle-left me-1"></i>
          Explore Collections
        </NavLink>
      </div>

      {/* Demo table */}
      <div className="card border-0 shadow rounded-4 my-4 mb-xl-5 overflow-hidden">
        <div className="table-responsive">
          <table className="table m-0 text-nowrap">
            <thead>
              <tr>
                <th
                  className="py-3 bg-primary-subtle text-primary-emphasis ps-3"
                  colSpan={2}
                >
                  Lender
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Currency
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Offer
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  Duration
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  Interest Rate
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3 text-end">
                  {" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data?.loanConfigs.map((loanConfig, index) => {
                return (
                  <tr className="align-middle" key={index}>
                    <td className="py-3 ps-3">
                      <img
                        src="/images/placeholder/images/image-12.png"
                        width="30"
                        className="d-block rounded-circle"
                        alt="Image"
                      />
                    </td>
                    <td className="py-3">
                      {formatAddress(loanConfig.lendingDesk.owner.id)}
                    </td>
                    <td className="py-3 align-middle">
                      <img
                        src={tokens?.[index]?.logoURI}
                        height="30"
                        className="d-block rounded-circle"
                        alt="Image"
                      />
                    </td>
                    <td className="py-3">
                      {fromWei(
                        loanConfig.minAmount,
                        loanConfig.lendingDesk?.erc20?.decimals
                      )}{" "}
                      -{" "}
                      {fromWei(
                        loanConfig.maxAmount,
                        loanConfig.lendingDesk?.erc20?.decimals
                      )}
                    </td>
                    <td className="py-3">
                      {loanConfig.minDuration / 24}-
                      {loanConfig.maxDuration / 24} days
                    </td>
                    <td className="py-3">
                      {loanConfig.minInterest / 100}-
                      {loanConfig.maxInterest / 100}%
                    </td>
                    <td className="py-3 pe-3 text end">
                      <GetLoanModal
                        {...{
                          btnClass: "btn btn-primary rounded-pill px-4",
                          disabled: false,
                          onSubmit: () => {
                            setSelectedLendingDesk(loanConfig.lendingDesk);
                            requestLoan();
                          },
                          nft,
                          duration,
                          setDuration,
                          amount,
                          setAmount,
                          loanConfig: loanConfig,
                          lendingDesk: loanConfig?.lendingDesk,
                          nftId,
                          setNftId,
                          nftCollectionAddress: collection_address,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* End Table */}

      {/* End Container*/}
    </div>
  );
};

BrowseCollection.defaultProps = {
  titleElement: <div>hello</div>,
  // ...
};
