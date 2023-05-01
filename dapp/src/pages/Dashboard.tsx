export const Dashboard = () => {
  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="content">
          <h1 className="text-strong fw-700 display-6 mt-0">Dashboard</h1>
          <p className="text-muted mb-0">
            Welcome to your NFTY Finance dashboard. Please use the links in the
            sidebar to navigate to the page you want.
          </p>
        </div>
        {/* Header end */}

        {/* Content start */}
        <div className="card">
          <div className="d-flex align-items-center mb-10">
            <h1 className="text-strong fw-700 fsr-4 m-0">My Profile</h1>
            <div className="ps-10 flex-shrink-0">
              <button className="btn btn-square btn-rounded">
                <i className="fa-regular fa-edit"></i>
                <span className="visually-hidden">Edit</span>
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-auto pe-20 flex-shrink-0 mt-10">
              <div>Username</div>
              <div className="ws-200 mw-100 hs-200 mt-10 border rounded-3 overflow-hidden d-flex align-items-center justify-content-center bg-gray-very-light-lm bg-darkgray-very-dim-dm">
                <img
                  src="https://placehold.co/400/lightgray/black"
                  className="w-auto h-100 d-block"
                  alt="Display image"
                />
              </div>
              <div className="mt-20">
                Amount of Borrows: <span className="text-muted">210</span>
              </div>
              <div className="mt-5">
                Amount of Lends: <span className="text-muted">97</span>
              </div>
              <div className="mt-5">
                Times Defaulted: <span className="text-muted">0</span>
              </div>
            </div>
            <div className="col-lg mt-10">
              <div className="row">
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/doodles-square.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/mayc.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/doodles-square.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/mayc.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/doodles-square.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/mayc.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
                <div className="col-6 col-xl-4 px-10 py-5 hs-150 d-flex align-items-center justify-content-center overflow-hidden border border-5 border-blend">
                  <img
                    src="images/placeholder/doodles-square.png"
                    alt="image"
                    className="d-block w-auto h-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
