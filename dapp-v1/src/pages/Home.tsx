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
        <div className="col-sm-6 col-xl-4">
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body">
              <div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
                <i className="fa-solid fa-hand-holding-dollar h1 m-0"></i>
              </div>
              <div className="text-center mt-3">
                <h5>Borrow</h5>
                <p className="text-body-secondary">
                  Instant liquidity for your NFT as collateral
                </p>
                <NavLink to="/quick-loan">Borrow Now &rarr;</NavLink>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-4">
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body">
              <div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
                <i className="fa-solid fa-piggy-bank h1 m-0"></i>
              </div>
              <div className="text-center mt-3">
                <h5>Lend</h5>
                <p className="text-body-secondary">
                  Customize lending desks & issue loans
                </p>
                <NavLink to="/create-desk">Start Lending &rarr;</NavLink>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-4">
          <div className="card border-0 shadow rounded-4 h-100">
            <div className="card-body">
              <div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
                <i className="fa-solid fa-lock h1 m-0"></i>
              </div>
              <div className="text-center mt-3">
                <h5>Stake</h5>
                <p className="text-body-secondary">Stake NFTY and participate</p>
                <NavLink to="/stake">Start Staking &rarr;</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow rounded-4 mt-4 mt-xl-5">
        <div className="card-body py-4">
          <div className="row g-4 g-xl-5 justify-content-center">
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-hexagon-vertical-nft h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">{result.data?.protocolInfo?.nftCollectionsCount}</h3>
                  <p className="m-0 text-primary-emphasis">collections supported</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-paper-plane h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">{result.data?.protocolInfo?.loansCount}</h3>
                  <p className="m-0 text-primary-emphasis">loans issued</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-4">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-sack-dollar h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                    {result.data?.protocolInfo?.lendingDesksCount}
                  </h3>
                  <p className="m-0 text-primary-emphasis">lending desks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
