import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { BrowseCollectionsDocument } from "../../../.graphclient";
import fetchNFTDetails from "@/helpers/FetchNfts";
import { useEffect, useState } from "react";

import { INft } from "@/helpers/FetchNfts";
import { IToken, fetchTokensForCollection } from "@/helpers/FetchTokens";

interface INftCollection extends INft {
  erc20s: IToken[];
}

export const BrowseCollections = (props: any) => {
  // GraphQL
  const [result] = useQuery({
    query: BrowseCollectionsDocument,
  });
  const { data, fetching, error } = result;

  const [nftArr, setNftArr] = useState<INftCollection[]>([]);

  useEffect(() => {
    // This function will be executed whenever the query data changes
    if (!fetching) getNFTs();
  }, [data]);

  //This is used to lookup a list of nfts off chain
  const getNFTs = async () => {
    //final result array that we need
    let resultArr: INftCollection[] = [];

    //An array of nft ids
    const nftIdArr = data?.nftCollections.map(
      (nftCollection) => nftCollection.id
    );

    if (nftIdArr?.length) {
      const fetchedNftArr = await fetchNFTDetails(nftIdArr);

      //fetching tokens associated with each collection
      if (data?.nftCollections.length) {
        for (let i = 0; i < data.nftCollections.length; i++) {
          const nftCollection = data.nftCollections[i];
          const tokens = await fetchTokensForCollection(nftCollection);
          resultArr[i] = { ...fetchedNftArr[i], erc20s: tokens };
        }
      }
    }
    setNftArr(resultArr);
  };

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      {/* start stats card */}
      <div className="card border-0 shadow rounded-4">
        <div className="card-body p-4">
          <div className="row g-4 g-xl-5 justify-space-around">
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-hexagon-vertical-nft h4 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">{result.data?.nftCollections.length}</h3>
                  <p className="m-0 text-primary-emphasis">
                    number of collections
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-square-dollar h4 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">{result.data?.erc20S.length}</h3>
                  <p className="m-0 text-primary-emphasis">
                    number of currencies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End stats card */}

      {/* Start table */}
      <div className="card border-0 shadow rounded-4 my-4 my-xl-5 overflow-hidden">
        <div className="table-responsive">
          <table className="table m-0 text-nowrap">
            <thead>
              <tr>
                <th
                  className="py-3 bg-primary-subtle text-primary-emphasis ps-3"
                  colSpan={2}
                >
                  Collection
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Currency
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Desks
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  {" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data?.nftCollections.map((nftCollection, index) => {
                const currencies: string[] = nftCollection.loanConfigs.map(
                  (x) => x.lendingDesk.erc20.symbol
                );
                return (
                  <tr className="align-middle" key={index}>
                    <td className="py-3 ps-3">
                      <img
                        src={nftArr.length ? nftArr[index].logoURI : ""}
                        width="30"
                        className="d-block rounded-circle"
                        alt="Image"
                      />
                    </td>
                    <td className="py-3">
                      {nftArr.length ? nftArr[index].name : null}
                    </td>
                    <td className="py-3 align-middle">
                      <div className="d-flex align-items-center">
                        <div
                          className="position-relative"
                          style={{
                            width: `${
                              15 * (nftArr[index]?.erc20s.length + 1)
                            }px`,
                            height: "30px",
                          }}
                        >
                          {nftArr[index]?.erc20s?.map((erc20, i) => {
                            return (
                              <img
                                key={i}
                                src={erc20.logoURI}
                                height="30"
                                className={`d-block rounded-circle position-absolute top-0 start-0 z-${
                                  3 - i
                                }`}
                                alt="Image"
                                style={{ marginLeft: `${15 * i}px` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      {nftCollection?.loanConfigs?.length}
                    </td>
                    <td className="py-3 pe-3">
                      <NavLink
                        to={`/explore/${nftCollection.id}`}
                        className="btn btn-primary rounded-pill px-4"
                      >
                        Find a Loan
                      </NavLink>
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
