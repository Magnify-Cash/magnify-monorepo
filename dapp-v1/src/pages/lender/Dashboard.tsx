import { LoanCard, PopupTransaction } from "@/components";

const LoanCardParent = () => (
  <div>
    <h5>Lending Desk [x]</h5>
    <div className="col-12">
      <div className="card border-0 shadow rounded-4 h-100">
        <div className="card-body">
          <div className="d-lg-flex">
            <div className="col-sm-6 col-xl-3">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-hexagon-vertical-nft h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">[x]</h3>
                  <p className="m-0 text-primary-emphasis">loans</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-square-dollar h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">[currency]</h3>
                  <p className="m-0 text-primary-emphasis">currency</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-sack-dollar h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                    [amount] <small className="fw-normal">[currency]</small>
                  </h3>
                  <p className="m-0 text-primary-emphasis">borrowed</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3">
              <div className="d-flex align-items-center">
                <div className="specific-w-50 specific-h-50 d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle flex-shrink-0">
                  <i className="fa-solid fa-sack-dollar h2 m-0"></i>
                </div>
                <div className="ps-3">
                  <h3 className="m-0">
                    [amount] <small className="fw-normal">[currency]</small>
                  </h3>
                  <p className="m-0 text-primary-emphasis">balance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Dashboard = (props: any) => {
  // modal submit
  function handleModalSubmit(loanID: number) {
    console.log("loanID", loanID);
  }

  return (
    <div className="container-md px-3 px-sm-4 px-xl-5">
      <div className="d-lg-flex align-items-center">
        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="pills-active-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-active"
              type="button"
              role="tab"
              aria-controls="pills-active"
              aria-selected="true"
            >
              Active Loans
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-pending-default-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-pending-default"
              type="button"
              role="tab"
              aria-controls="pills-pending-default"
              aria-selected="false"
            >
              Pending Default
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-completed-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-completed"
              type="button"
              role="tab"
              aria-controls="pills-completed"
              aria-selected="false"
            >
              Completed Loans
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-defaulted-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-defaulted"
              type="button"
              role="tab"
              aria-controls="pills-defaulted"
              aria-selected="false"
            >
              Defaulted Loans
            </button>
          </li>
        </ul>
      </div>

      <div className="tab-content" id="pills-tabContent">
        {/* Active Row */}
        <div
          className="tab-pane fade show active"
          id="pills-active"
          role="tabpanel"
          aria-labelledby="pills-active-tab"
        >
          <div className="row g-4 g-xl-5">
            <LoanCardParent />
            <LoanCard loanInfo={null} />
          </div>
        </div>
        {/* End Active Row */}

        {/* Pending Default Row */}
        <div
          className="tab-pane fade"
          id="pills-pending-default"
          role="tabpanel"
          aria-labelledby="pills-pending-default-tab"
        >
          <div className="row g-4 g-xl-5">
            <LoanCardParent />
            <LoanCard
              popupTx={
                <PopupTransaction
                  btnClass="btn btn-primary btn-lg mt-4"
                  btnText="Liquidate Loan"
                  modalId="txModal"
                  modalBtnText="Liquidate Now"
                  modalTitle="Liquidate Loan"
                  modalContent={
                    <div>
                      <small>Loan Details</small>
                      <h6>Collection Name] #[NFT ID]</h6>
                      <div className="row g-4">
                        <div className="col-6 bg-secondary">test</div>
                        <div className="col-6 bg-secondary">test</div>
                        <div className="col-6 bg-secondary">test</div>
                        <div className="col-6 bg-secondary">test</div>
                        <div className="col-12 bg-success">test</div>
                      </div>
                      <hr />
                      <button type="button" className="btn btn-primary" onClick={() => handleModalSubmit(1)}>
                      Button Text
                      </button>
                    </div>
                  }
                />
              }
              loanInfo={null}
            />
          </div>
        </div>
        {/* End Pending Default Row */}

        {/* Defaulted Row */}
        <div
          className="tab-pane fade"
          id="pills-defaulted"
          role="tabpanel"
          aria-labelledby="pills-defaulted-tab"
        >
          <div className="row g-4 g-xl-5">
            <LoanCardParent />
            <LoanCard loanInfo={null} />
          </div>
        </div>
        {/* End Defaulted Row */}

        {/* Completed Row */}
        <div
          className="tab-pane fade"
          id="pills-completed"
          role="tabpanel"
          aria-labelledby="pills-completed-tab"
        >
          <div className="row g-4 g-xl-5">
            <LoanCardParent />
            <LoanCard loanInfo={null} />
          </div>
        </div>
        {/* End Completed Row */}
      </div>
    </div>
  );
};
