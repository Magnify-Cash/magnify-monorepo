export const RequestLoanSuccess = () => {
  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            {/* Content start */}
            <div className="card">
              <div className="text-center display-3 text-success">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <h1 className="text-strong fw-700 fsr-1 text-center">
                Loan Request Submitted
              </h1>
              <p className="text-muted mb-0 text-center">
                Your loan request has been sent for approval by{" "}
                <strong>NFTY Finance</strong>. Please check your account for
                updates.
              </p>
              <div className="ws-150 hs-150 rounded-circle overflow-hidden mx-auto my-30 d-flex align-items-center justify-content-center">
                <img
                  src="/images/placeholder/doodles-square.png"
                  alt="image"
                  className="d-block w-auto h-100"
                />
              </div>
              <div className="text-center pb-20 border-bottom border-2 border-primary fw-bold">
                Loan Request Summary
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">Total Interest</div>
                <div className="col-lg-6 text-lg-end">$1836 USDC</div>
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">
                  Total Loan Origination Fee
                </div>
                <div className="col-lg-6 text-lg-end">$408 USDC</div>
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">Total Loan Amount</div>
                <div className="col-lg-6 text-lg-end">$40,800 USDC</div>
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">Due Date</div>
                <div className="col-lg-6 text-lg-end">June 15, 2022</div>
              </div>
              <div className="mt-30">
                <a href="#" className="btn btn-primary btn-lg btn-block">
                  View Account
                </a>
              </div>
            </div>
            {/* Content end */}
          </div>
        </div>
      </div>
    </div>
  );
};
