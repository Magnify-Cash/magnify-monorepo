import { useEffect, useState } from "react";
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

  // loan params selection
  const [nftId, setNftId] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [amount, setAmount] = useState<number>();

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
              {result.data?.loanConfigs.map((loanConfig, index) => {
              return (
                <tr className="align-middle">
                  <td className="py-3 ps-3">
                    <img src="/images/placeholder/images/image-12.png" width="30" className="d-block rounded-circle" alt="Image" />
                  </td>
                  <td className="py-3">0x34n3...4j32op2j</td>
                  <td className="py-3 align-middle">
                    <img src="/images/placeholder/images/image-8.svg" height="30" className="d-block rounded-circle" alt="Image" />
                  </td>
                  <td className="py-3">{loanConfig.minAmount} - {loanConfig.maxAmount}</td>
                  <td className="py-3">{loanConfig.minDuration}-{loanConfig.maxDuration} days</td>
                  <td className="py-3">{loanConfig.minInterest}-{loanConfig.maxInterest}%</td>
                  <td className="py-3 pe-3">
                    <PopupTransaction
                      btnClass="btn btn-primary rounded-pill px-4"
                      btnText="Get a Loan"
                      modalId={`txModal-${index}`}
                      modalTitle="Get a Loan"
                      modalFooter={
                          <div className="modal-footer">
                              <button type="button" onClick={() => console.log()} className="btn btn-primary btn-lg rounded-pill d-block w-100 py-3 lh-1">Request Loan</button>
                          </div>
                        }
                        modalContent={
                          <form id="quickLoanForm" className="modal-body">
                            <p className="text-body-secondary">
                              Lending Desk Details
                            </p>
                            <div className="container-fluid g-0 mt-3">
                              <div className="row g-3">
                                <div className="col-12 col-sm-6">
                                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                                    <div className="d-flex align-items-center justify-content-center">
                                      <img src="/images/placeholder/images/image-5.png" alt="Image" className="d-block flex-shrink-0 me-2 rounded-circle" width="30"/>
                                      <div className="h5 fw-medium m-0">
                                        Pudgy Penguins
                                      </div>
                                    </div>
                                    <div className="text-body-secondary">
                                      Collection Type
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12 col-sm-6">
                                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                                    <div className="d-flex align-items-center justify-content-center">
                                      <div className="h4 fw-medium">{loanConfig?.minAmount}-{loanConfig?.maxAmount}</div>
                                      <span className="text-body-secondary ms-2">{loanConfig?.lendingDesk.erc20.symbol}</span>
                                    </div>
                                    <div className="text-body-secondary">
                                      Min/Max Offer
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12 col-sm-6">
                                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                                    <div className="d-flex align-items-center justify-content-center">
                                      <div className="h4 fw-medium">{loanConfig?.minDuration}-{loanConfig?.maxDuration}</div>
                                      <span className="text-body-secondary ms-2">Days</span>
                                    </div>
                                    <div className="text-body-secondary">
                                      Min/Max Duration
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12 col-sm-6">
                                  <div className="h-100 rounded bg-secondary-subtle text-center p-2">
                                    <div className="d-flex align-items-center justify-content-center">
                                      <div className="h4 fw-medium">{loanConfig?.minInterest} - {loanConfig?.maxInterest}</div>
                                      <span className="text-body-secondary ms-2">%</span>
                                    </div>
                                    <div className="text-body-secondary">
                                      Min/Max Interest Rate
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="my-3 py-3 border-top border-bottom">
                              <div className="mb-3">
                                  <label htmlFor="select-nft" className="form-label">Select NFT</label>
                                  <select className="form-select form-select-lg py-2" id="select-nft">
                                  <option selected>Select NFT</option>
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5</option>
                                  <option value="6">6</option>
                                  <option value="7">7</option>
                                  <option value="8">8</option>
                                  <option value="9">9</option>
                                  <option value="10">10</option>
                                  <option value="...">Pudgy Penguins #421</option>
                                  </select>
                              </div>
                              <div className="mb-3">
                                  <label htmlFor="set-duration" className="form-label">Set Duration</label>
                                  <div className="input-group">
                                    <input type="number" className="form-control form-control-lg py-2" id="set-duration" placeholder="Duration" step="1" min={loanConfig?.minDuration} max={loanConfig?.maxDuration} value={duration} onChange={e => setDuration(e.target.value)}/>
                                    <span className="input-group-text">Days</span>
                                  </div>
                              </div>
                              <div>
                                  <label htmlFor="set-amount" className="form-label">Set Amount</label>
                                  <div className="input-group">
                                    <input type="number" className="form-control form-control-lg py-2" id="set-amount" placeholder="Amount" step="1" min={loanConfig?.minAmount} max={loanConfig?.maxAmount} value={amount} onChange={e => setAmount(e.target.value)}/>
                                    <span className="input-group-text">{loanConfig?.lendingDesk.erc20.symbol}</span>
                                  </div>
                              </div>
                            </div>
                            <p className="text-body-secondary">
                              Loan Overview
                            </p>
                            <div className="d-flex align-items-center mb-3">
                              <img src="/images/placeholder/images/image-1.png" className="img-fluid flex-shrink-0 me-3" width="32" alt="Image"/>
                              <h6 className="m-0">Pudgy Penguin #7338</h6>
                            </div>
                            <div className="my-2 d-flex align-items-center">
                              <span className="text-body-secondary">Duration</span>
                              <span className="fw-medium ms-auto">{duration} Days</span>
                            </div>
                            <div className="my-2 d-flex align-items-center">
                              <span className="text-body-secondary">Interest Rate <i className="fa-light fa-info-circle ms-1"></i></span>
                              <span className="fw-medium ms-auto">3%</span>
                            </div>
                            <div className="my-2 d-flex align-items-center">
                              <span className="text-body-secondary">Requested Amount</span>
                              <span className="fw-medium ms-auto">{amount} {loanConfig?.lendingDesk.erc20.symbol}</span>
                            </div>
                            <div className="my-2 d-flex align-items-center">
                              <span className="text-body-secondary">2% Loan Origination Fee <i className="fa-light fa-info-circle ms-1"></i></span>
                              <span className="fw-medium ms-auto">-180 {loanConfig?.lendingDesk.erc20.symbol}</span>
                            </div>
                            <div className="mt-3 pt-3 border-top d-flex align-items-center">
                              <span className="text-body-secondary">Gross Amount</span>
                              <span className="h3 ms-auto my-0 text-primary-emphasis">
                                8820 <span className="fw-medium">{loanConfig?.lendingDesk.erc20.symbol}</span>
                              </span>
                            </div>
                          </form>
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
