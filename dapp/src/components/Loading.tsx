export const Loading = () => (
  <div className="card">
    <div className="row">
      <div className="col-lg-8 py-20 py-lg-50 mx-auto">
        <h3 className="text-strong fw-700 fs-4 mt-0">Loading...</h3>
        <p className="text-muted">Please wait while we load this page.</p>
        <div className="progress hs-25">
          <div
            className="progress-bar progress-bar-animated w-100"
            role="progressbar"
          ></div>
        </div>
      </div>
    </div>
  </div>
);
