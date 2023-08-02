import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ConnectKitProvider } from "connectkit";
import { Wallet } from "@/components";

function getCurrentTheme(): string {
  let currentTheme: string = "light";
  if (localStorage.getItem("storedTheme") === "dark") {
    document.documentElement.classList.add("dark-mode");
    currentTheme = "dark";
  }
  return currentTheme;
}


export const Base = () => {
  // theme
  const [currentTheme, setCurrentTheme] = useState<any>(getCurrentTheme());

  return (
    <ConnectKitProvider mode={currentTheme}>
          {/* Sidebar start */}
          <div className="offcanvas-xl offcanvas-start" tabIndex={-1} id="sidebar">
              <div className="offcanvas-header d-flex align-items-center justify-content-start" style={{ height: '68px' }}>
                  <img src="/images/logo.svg" alt="SocialPass Logo" className="d-block me-auto w-75" />
                  <button type="button" className="btn btn-link rounded-pill px-0" aria-label="Toggle dark mode" onClick={() => window.toggleDarkMode()}
                      style={{ width: '37px' }}>
                      <i className="fa-solid fa-moon"></i>
                  </button>
                  <button type="button" className="btn-close d-xl-none ms-2" data-bs-dismiss="offcanvas"
                      aria-label="Close" data-bs-target="#sidebar"></button>
              </div>
              <div className="offcanvas-body p-3 flex-column">
                  {/* Other sidebar content... */}
              </div>
          </div>
          {/* Sidebar end */}

          {/* Navbar start */}
          <div className="border-bottom border-secondary border-opacity-25 py-2 py-md-3">
              <div className="container px-3 px-sm-4 d-flex align-items-center h-100">
                  <button className="btn btn-link px-0 d-xl-none me-3" type="button" data-bs-toggle="offcanvas"
                      data-bs-target="#sidebar" aria-label="Toggle sidebar" style={{ width: '37px' }}>
                      <i className="fa-solid fa-bars"></i>
                  </button>
                  <img src="/images/logo.svg" alt="SocialPass Logo"
                      className="d-block d-xl-none me-3 w-50" />
                  <h5 className="mb-0 me-3 d-none d-md-block text-truncate">
                      Page Title
                  </h5>
                  <div className="ms-auto">
                      <Wallet/>
                  </div>
              </div>
              <div className="container px-3 px-sm-4 mt-3 d-md-none">
                  <h6>
                      Page Title for Small Screens
                  </h6>
              </div>
          </div>
          {/* Navbar end */}

          {/* Content start */}
          <div className="container px-3 px-sm-4 d-flex flex-column content-container">
              <Outlet/>
          </div>
          {/* Content end */}

    </ConnectKitProvider>
  );
};
