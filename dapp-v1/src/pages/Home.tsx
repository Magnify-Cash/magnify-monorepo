import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { HomeDocument } from "../../.graphclient";

export const Home = (props) => {
  // GraphQL
  const [result] = useQuery({
    query: HomeDocument,
  });

  return (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      <div className="row g-4 g-xl-5 justify-content-center">
        <div className="col-md-6">
          <div className="card rounded-4 h-100 bg-primary-subtle border-primary-subtle">
            <div className="card-body">
              <div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary-emphasis rounded-4">
                <i className="fa-solid fa-hand-holding-dollar h1 m-0" />
              </div>
              <div className="text-center mt-3">
                <div className="h4">Borrow</div>
                <p style={{ fontSize: "16px" }}>
                  Instant liquidity for your NFT as collateral
                </p>
                <NavLink to="/quick-loan">
                  Borrow Now<i className="fa-light fa-arrow-right ms-1"></i>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card rounded-4 h-100 bg-primary-subtle border-primary-subtle">
            <div className="card-body">
              <div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary-emphasis rounded-4">
                <i className="fa-solid fa-piggy-bank h1 m-0" />
              </div>
              <div className="text-center mt-3">
                <div className="h4">Lend</div>
                <p style={{ fontSize: "16px" }}>
                  Customize lending desks & issue loans
                </p>
                <NavLink to="/create-desk">
                  Start Lending<i className="fa-light fa-arrow-right ms-1"></i>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card rounded-4 mt-4 mt-xl-5 bg-primary-subtle border-primary-subtle">
        <div className="card-body py-4">
          <div className="row g-4 g-xl-5">
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary-emphasis rounded-4 flex-shrink-0">
                  <i className="fa-solid fa-hexagon-vertical-nft h3 m-0" />
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                    {result.data?.protocolInfo?.nftCollectionsCount}
                  </h3>
                  <p className="m-0">collections supported</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary-emphasis rounded-4 flex-shrink-0">
                  <i className="fa-solid fa-paper-plane h3 m-0" />
                </div>
                <div className="ps-3">
                  <h3 className="m-0">{result.data?.protocolInfo?.loansCount}</h3>
                  <p className="m-0">loans issued</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary-emphasis rounded-4 flex-shrink-0">
                  <i className="fa-solid fa-sack-dollar h3 m-0" />
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                    {result.data?.protocolInfo?.lendingDesksCount}
                  </h3>
                  <p className="m-0">lending desks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
