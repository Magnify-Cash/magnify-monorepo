import { Blockies } from "@/components";
import PaginatedList from "@/components/LoadMore";
import LoadingIndicator from "@/components/LoadingIndicator";
import fetchNFTDetails from "@/helpers/FetchNfts";
import type { INft } from "@/helpers/FetchNfts";
import { type IToken, fetchTokensForCollection } from "@/helpers/FetchTokens";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useChainId } from "wagmi";
import { BrowseCollectionsDocument } from "../../../.graphclient";
import { useQuery } from "urql"
import { HomeDocument } from "../../../.graphclient";

interface INftCollection extends INft {
  erc20s: IToken[];
}

const renderLendingDesks = ({ items, loading, error, loadMore, hasNextPage }) => {
  const chainId = useChainId();
  const [nftArr, setNftArr] = useState<INftCollection[]>([]);

  // This function will be executed whenever the query data changes
  useEffect(() => {
    if (!loading) getNFTs();
  }, [items]);

  //This is used to lookup a list of nfts off chain
  const getNFTs = async () => {
    //final result array that we need
    const resultArr: INftCollection[] = [];

    //An array of nft ids
    const nftIdArr = items?.map(
      (nftCollection) => nftCollection.id,
    );

    if (nftIdArr?.length) {
      const fetchedNftArr = await fetchNFTDetails(nftIdArr, chainId);

      //fetching tokens associated with each collection
      if (items?.length) {
        for (let i = 0; i < items?.length; i++) {
          const nftCollection = items[i];
          const tokens = await fetchTokensForCollection(nftCollection, chainId);
          resultArr[i] = { ...fetchedNftArr[i], erc20s: tokens };
        }
      }
    }
    setNftArr(resultArr);
  };
  return (
    <tbody>
    {items && items?.map((nftCollection, index) => {
      return (
        <tr className="align-middle" key={nftCollection.id}>
          <td className="py-3 ps-3">
            {nftArr.length && nftArr[index]?.logoURI ? (
              <img
                src={nftArr[index]?.logoURI}
                width="30"
                className="d-block rounded-circle"
                alt={nftArr[index]?.symbol}
              />
            ) : (
              <Blockies seed={nftArr[index]?.address} size={8} />
            )}
          </td>
          <td className="py-3">
            {nftArr.length ? nftArr[index]?.name : null}
          </td>
          <td className="py-3">
            <NavLink
              to={`/explore/${nftCollection.id}`}
              className="btn btn-outline-primary rounded-pill px-4"
            >
              <i className="fa-solid fa-link" />
              <span className="d-none d-sm-inline ms-3">Find a Loan</span>
            </NavLink>
          </td>
        </tr>
      );
    })}
    {loading && <LoadingIndicator/>}
    {error && <p>Error: {error.message}</p>}
    {hasNextPage && (
      <button onClick={loadMore} disabled={loading} className="btn btn-primary">
        Load More
      </button>
    )}
    </tbody>
  )
}

export const BrowseCollections = (props: any) => {
  // GraphQL
  const [result] = useQuery({
    query: HomeDocument,
  });

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      {/* start stats card */}
      <div className="card bg-primary-subtle border-primary-subtle rounded-4 col-xl-8 mx-auto">
        <div className="card-body p-4">
          <div className="row g-4 justify-space-around">
            <div className="col-sm-6">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-hexagon-vertical-nft h4 m-0" />
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                    {result.data?.protocolInfo?.nftCollectionsCount}
                  </h3>
                  <p className="m-0 text-primary-emphasis">number of collections</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-square-dollar h4 m-0" />
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                  {result.data?.protocolInfo?.erc20sCount}
                  </h3>
                  <p className="m-0 text-primary-emphasis">number of currencies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End stats card */}

      {/* Start table */}
      <div className="card bg-primary-subtle border-primary-subtle rounded-4 my-4 overflow-hidden col-xl-7 mx-auto">
        <div className="table-responsive">
          <table className="table m-0 text-nowrap">
            <thead>
              <tr>
                <th
                  className="py-3 bg-primary-subtle text-primary-emphasis ps-3"
                  colSpan={3}
                >
                  Collection
                </th>
              </tr>
            </thead>
            <PaginatedList
              query={BrowseCollectionsDocument}
              dataKey="nftCollections"
              variables={{}}
              props={{}}
            >
              {renderLendingDesks}
            </PaginatedList>
          </table>
        </div>
      </div>

      {/* End Table */}

      {/* End Container*/}
    </div>
  );
};
