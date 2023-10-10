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
                <th className="py-3 bg-primary-subtle text-primary-emphasis ps-3" colSpan={2}>Lender</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">Currency</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis">Offer</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">Duration</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">Interest Rate</th>
                <th className="py-3 bg-primary-subtle text-primary-emphasis pe-3"> </th>
              </tr>
            </thead>
            <tbody>
              {result.data?.loanConfigs.map((loanConfigs) => {
              return (
                <tr className="align-middle">
                  <td className="py-3 ps-3">
                    <img src="/images/placeholder/images/image-12.png" width="30" className="d-block rounded-circle" alt="Image" />
                  </td>
                  <td className="py-3">0x34n3...4j32op2j</td>
                  <td className="py-3 align-middle">
                    <img src="/images/placeholder/images/image-8.svg" height="30" className="d-block rounded-circle" alt="Image" />
                  </td>
                  <td className="py-3">2,000 - 9,000</td>
                  <td className="py-3">10-30 days</td>
                  <td className="py-3">3-9%</td>
                  <td className="py-3 pe-3">
                    <PopupTransaction
                      btnClass="btn btn-primary rounded-pill px-4"
                      btnText="Get a Loan"
                      modalId="txModal"
                      modalTitle="Get a Loan"
                      modalContent={
                      <div>
                        <button className="btn btn-primary rounded-pill px-4" onClick={() => console.log(1)}>
                        Get a Loan
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
