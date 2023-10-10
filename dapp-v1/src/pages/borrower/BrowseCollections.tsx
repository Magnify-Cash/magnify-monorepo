import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { BrowseCollectionsDocument } from "../../../.graphclient";

export const BrowseCollections = (props: any) => {
  // GraphQL
  const [result] = useQuery({
    query: BrowseCollectionsDocument,
  });

  return (
    <div className="container-md px-3 px-sm-4 px-lg-5">
      {/* start stats card */}
      <div className="card border-0 shadow rounded-4">
        <div className="card-body p-4">
          <div className="row g-4 g-xl-5 justify-content-center">
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-hexagon-vertical-nft h4 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">{result.data?.nftCollections.length}</h3>
                  <p className="m-0 text-primary-emphasis">number of collections</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-square-dollar h4 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">[X] <small className="fw-normal">USD</small></h3>
                  <p className="m-0 text-primary-emphasis">total value locked (TVL)</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-sack-dollar h4 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">[X] <small className="fw-normal">USD</small></h3>
                  <p className="m-0 text-primary-emphasis">total available liquidity (TAL)</p>
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
                <th className="py-3 bg-primary-subtle text-primary-emphasis ps-3" colSpan={2}>Collection</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">Currency</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">Desks</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">TAL (USD)</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">Utilization</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3"> </th>
              </tr>
            </thead>
            <tbody>
              {result.data?.nftCollections.map((nftCollection) => {
              const currencies: string[] = nftCollection.loanConfigs.map(
                (x) => x.lendingDesk.erc20.symbol
              );
              return (
               <tr className="align-middle">
                 <td className="py-3 ps-3">
                   <img src="images/placeholder/images/image-5.png" width="30" className="d-block rounded-circle" alt="Image" />
                 </td>
                 <td className="py-3">Pudgy Penguins</td>
                 <td className="py-3 align-middle">
                   <div className="d-flex align-items-center">
                     <div className="position-relative" style={{ width: '60px', height: '30px' }}>
                       <img src="images/placeholder/images/image-8.svg" height="30" className="d-block rounded-circle position-absolute top-0 start-0 z-3" alt="Image" />
                       <img src="images/placeholder/images/image-10.png" height="30" className="d-block rounded-circle position-absolute top-0 start-0 z-2" alt="Image" style={{ marginLeft: '15px' }} />
                       <img src="images/placeholder/images/image-13.png" height="30" className="d-block rounded-circle position-absolute top-0 start-0 z-1" alt="Image" style={{ marginLeft: '30px' }} />
                     </div>
                     <span className="ms-1">...</span>
                   </div>
                 </td>
                 <td className="py-3">3</td>
                 <td className="py-3">$60,000</td>
                 <td className="py-3">67%</td>
                 <td className="py-3 pe-3">
                   <button className="btn btn-primary rounded-pill px-4">Find a Loan</button>
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
