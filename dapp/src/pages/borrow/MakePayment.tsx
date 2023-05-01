export const MakePayment = () => {
  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            {/* Content start */}
            <div className="card">
              <h1 className="text-strong fw-700 display-6 mt-5 mb-0">
                Make a Payment
              </h1>
              <p className="text-muted mt-5">
                Please fill out the following form to make a payment.
              </p>
              <form>
                {/* Loan name start */}
                <div className="form-group">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6 align-self-center">
                      <label className="form-label m-0" htmlFor="loan_name">
                        Loan Name
                      </label>
                    </div>
                    <div className="col-lg-6">
                      <select
                        className="form-select form-select-lg"
                        id="loan_name"
                      >
                        <option value="" disabled>
                          Select Loan
                        </option>
                        <option value="Loan Name A" selected>
                          Loan Name A
                        </option>
                        <option value="Loan Name B">Loan Name B</option>
                        <option value="Loan Name C">Loan Name C</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="my-30">
                  <div className="ws-200 hs-200 rounded-circle overflow-hidden mx-auto d-flex align-items-center justify-content-center">
                    <img
                      src="/images/placeholder/loan.png"
                      alt="image"
                      className="d-block w-auto h-100"
                    />
                  </div>
                  <div className="fw-bold text-primary text-center mt-10">
                    [Loan Name A]
                  </div>
                </div>
                {/* Loan name end */}

                {/* Loan details start */}
                <label className="form-label mt-30">Loan Details</label>
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-calendar me-5 text-secondary-lm text-secondary-light-dm"></i>{" "}
                    Due Date
                  </div>
                  <div className="col-lg-6 text-lg-end">June 15, 2022</div>
                </div>
                <hr />
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-piggy-bank me-5 text-success"></i>{" "}
                    Total Loan
                  </div>
                  <div className="col-lg-6 text-lg-end">$25,000</div>
                </div>
                <hr />
                <div className="row my-10">
                  <div className="col-lg-6 text-muted">
                    <i className="fa-regular fa-hand-holding-dollar me-5 text-warning-dim-lm text-warning-light-dm"></i>{" "}
                    Outstanding Balance
                  </div>
                  <div className="col-lg-6 text-lg-end">$23,965</div>
                </div>
                <hr />
                {/* Loan details end */}

                {/* Deposit amount start */}
                <div className="form-group mt-30">
                  <div className="form-row row-eq-spacing-lg">
                    <div className="col-lg-6">
                      <label className="form-label" htmlFor="deposit_amount">
                        Deposit Amount
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        name="deposit_amount"
                        id="deposit_amount"
                        className="form-control form-control-alt form-control-lg form-number"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Selected Coin</label>
                      <div className="form-control form-control-alt form-control-lg d-flex align-items-center">
                        <img
                          src="/images/usdc.svg"
                          className="w-auto hs-25 d-block me-5"
                        />
                        USDC
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-muted mt-10">
                    NOTES: Minimum payment size is $500
                  </div>
                </div>
                {/* Deposit amount end */}

                {/* Confirmation start */}
                <div className="form-group mt-30">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                  >
                    Deposit Amount
                  </button>
                </div>
                {/* Confirmation end */}
              </form>
            </div>
            {/* Content end */}
          </div>
        </div>
      </div>
    </div>
  );
};
