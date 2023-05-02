import { useAccount } from 'wagmi'


export const Home = () => {
  const { address, isConnecting, isDisconnected } = useAccount();

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="content mb-0">
          <h1 className="text-strong fw-700 display-6 mt-0">
            <i className="fa-light fa-chart-line text-primary me-5"></i>
            Stats
          </h1>
          <p className="text-muted mb-0">
            NFTY Finance protocol-level and user stats.
          </p>
        </div>
        {/* Header end */}

        {/* Content start */}
        <div className="row">
          <div className="col-xl-6">
            <div className="card hs-xl-300">
              <h5 className="card-title fw-700 text-strong">Overview</h5>
              <br />
              <table className="table table-no-outer-padding">
                <tbody>
                  <tr>
                    <th>Total Liquidity</th>
                    <td className="text-end">$241,512.21</td>
                  </tr>
                  <tr>
                    <th>Liquidity in Loans</th>
                    <td className="text-end">$13,221.51</td>
                  </tr>
                  <tr>
                    <th>Number of Shops</th>
                    <td className="text-end">521</td>
                  </tr>
                  <tr>
                    <th>Number of Loans</th>
                    <td className="text-end">7214</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {!address
            ? (
              <div className="col-xl-6">
                <div className="card hs-xl-300">
                  <h5 className="card-title fw-700 text-strong">
                    Connect Your Wallet
                  </h5>
                  <p className="text-muted">
                    Connect your wallet to get started on borrowing lending and staking with NFTY Finance.
                  </p>
                  <div className="text-center mt-30">
                    <button className="btn btn-primary">
                      <i className="fa-solid fa-plus me-5"></i>
                      Connect Wallet
                    </button>
                  </div>
                </div>
              </div>
            )
            : (
              <div className="col-xl-6">
                <div className="card hs-xl-300">
                  <h5 className="card-title fw-700 text-strong">
                    <i className="fa-light fa-user me-5 text-primary"></i>
                    My Stats
                  </h5>
                  <br />
                  <table className="table table-no-outer-padding">
                    <tbody>
                      <tr>
                        <th>Total Liquidity</th>
                        <td className="text-end">$51,921.64</td>
                      </tr>
                      <tr>
                        <th>Liquidity in Loans</th>
                        <td className="text-end">$7,821.97</td>
                      </tr>
                      <tr>
                        <th>Number of Shops</th>
                        <td className="text-end">76</td>
                      </tr>
                      <tr>
                        <th>Number of Loans</th>
                        <td className="text-end">182</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
        </div>
        <div className="row">
          <div className="col-xl-6">
            <div className="card hs-xl-250">
              <h5 className="card-title fw-700 text-strong">Start Borrowing</h5>
              <p className="text-muted">
                Get started as a borrower and get loans against your NFTs.
              </p>
              <div className="text-center mt-30">
                <button className="btn">
                  Start Borrowing
                  <i className="fa-solid fa-arrow-right ms-5"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card hs-xl-250">
              <h5 className="card-title fw-700 text-strong">Start Lending</h5>
              <p className="text-muted">
                Get started as a lender to create shops and issue loans.
              </p>
              <div className="text-center mt-30">
                <button className="btn">
                  Start Lending
                  <i className="fa-solid fa-arrow-right ms-5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
