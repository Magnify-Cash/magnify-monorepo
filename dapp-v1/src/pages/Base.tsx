import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, Wallet } from "@/components";
import { toggleSidebar } from "@/helpers/SidebarToggle";
import { ConnectKitProvider } from 'connectkit';

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
        <div
          className="page-wrapper with-sidebar"
          data-hm-sidebar-type="overlayed-md-down"
        >
          {/* Sticky alerts start */}
          <div className="sticky-alerts"></div>
          {/* Sticky alerts end */}

          {/* Sidebar start */}
          <Sidebar />
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          {/* Sidebar end */}

          {/* Content wrapper start */}
          <div className="content-wrapper min-vh-100 d-flex flex-column">
            {/* Navbar start */}
            <div>
              <nav className="hs-75 d-flex align-items-center px-content">
                {/* Menu toggle start */}
                <button
                  className="btn btn-sm btn-square rounded-circle d-md-none"
                  onClick={toggleSidebar}
                >
                  <i className="fa-regular fa-bars"></i>
                  <span className="visually-hidden">Toggle sidebar</span>
                </button>
                {/* Menu toggle end */}

                {/* Brand start */}
                <div className="ws-50 ms-20 d-md-none">
                  <img
                    src="/images/icon.svg"
                    alt="icon"
                    className="d-block w-100"
                  />
                </div>
                <div className="d-md-block d-none">
                  <h1>Base</h1>
                </div>

                {/* Brand end */}

                {/* Dark mode toggle start */}
                <button
                  className="btn btn-sm btn-square rounded-circle ms-auto"
                  onClick={() => {
                    if (currentTheme === "light") {
                      document.documentElement.classList.add("dark-mode");
                      setCurrentTheme("dark");
                      localStorage.setItem("storedTheme", "dark");
                    } else {
                      document.documentElement.classList.remove("dark-mode");
                      setCurrentTheme("light");
                      localStorage.setItem("storedTheme", "light");
                    }
                  }}
                >
                  <i className="fa-solid fa-moon"></i>
                  <span className="visually-hidden">Toggle dark mode</span>
                </button>
                {/* Dark mode toggle end */}

                {/* Connect wallet button start */}
                <Wallet />
                {/* Connect wallet button end */}

              </nav>
            </div>
            <hr className="w-100 mt-20"/>
            {/* Navbar end */}

            {/* Main content start */}
            {/* Content start (React router outlet component) */}
            <Outlet />
            {/* Content end (React router outlet component) */}
            {/* Main content end */}
          </div>
          {/* Content wrapper end */}
        </div>
    </ConnectKitProvider>
  );
};
