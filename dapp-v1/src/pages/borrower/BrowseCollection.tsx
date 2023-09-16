import { useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { PopupTransaction } from "@/components";
import { BrowseCollectionDocument } from "../../../.graphclient";

export const BrowseCollection = (props) => {
  // GraphQL
  const { collection_address } = useParams();
  const [result] = useQuery({
    query: BrowseCollectionDocument,
    variables: {
      nftCollectionId: collection_address,
    },
  });
  console.log(result);

  // Title
  var title = document.getElementById("base-title");
  useEffect(() => {
    if (title) {
      title.innerHTML = `$x Liquidity Desks`;
    }
  }, [title]);

  return (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      <p>
        <i className="fa-solid fa-arrow-left me-1"></i>
        <NavLink to="/explore">Explore Collections</NavLink>
      </p>

      {/* Demo table */}
      <div className="card border-0 shadow rounded-4 my-4 my-xl-5 overflow-hidden">
        <div className="table-responsive">
          <table className="table m-0 text-nowrap">
            <thead>
              <tr>
                <th className="py-3 bg-primary-subtle text-primary-emphasis ps-3">
                  Collection
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Currency
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Offer
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Duration
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">
                  Interest
                </th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data?.loanConfigs.map((loanConfigs) => {
                return (
                  <tr className="align-middle">
                    <td className="py-3 ps-3">
                      Lending Desk {loanConfigs.lendingDesk.id}
                    </td>
                    <td className="py-3 align-center">
                      {loanConfigs.lendingDesk.erc20.symbol}
                    </td>
                    <td className="py-3 align-center">
                      {loanConfigs.minAmount}-{loanConfigs.maxAmount}
                    </td>
                    <td className="py-3">
                      {loanConfigs.minDuration}-{loanConfigs.maxDuration} days
                    </td>
                    <td className="py-3">
                      {loanConfigs.minInterest}-{loanConfigs.maxInterest}%
                    </td>
                    <td className="py-3">
                      <PopupTransaction
                        btnClass="btn btn-primary"
                        btnText="Request Loan"
                        modalId="txModal"
                        modalTitle="Request Loan"
                        modalContent={
                          <div>
                            <button className="btn btn-primary" onClick={() => console.log(1)}>
                            Button Text
                            </button>
                          </div>
                        }
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
