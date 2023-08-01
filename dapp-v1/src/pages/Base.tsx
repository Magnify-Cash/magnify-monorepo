import { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { createClient, Provider } from "urql";
import { graphExchange } from "@graphprotocol/client-urql";
import { useNetwork } from "wagmi";
import { Sidebar, Wallet } from "@/components";
import { toggleSidebar } from "@/helpers/SidebarToggle";
import { getProtocolGraphUrl } from "@/helpers/ProtocolDefaults";
import * as GraphClient from "../../.graphclient";
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

                {/* Notifications start */}
                {/*
                <div className="dropdown with-arrow ms-10">
                  <button
                    className="btn btn-sm btn-square rounded-circle"
                    data-hm-toggle="dropdown"
                    id="notifications-dropdown-toggle"
                    aria-expanded="false"
                  >
                    <i className="fa-regular fa-bell"></i>
                    <span className="visually-hidden">Notifications</span>
                  </button>
                  <div
                    className="dropdown-menu dropdown-menu-center ws-250"
                    aria-labelledby="notifications-dropdown-toggle"
                  >
                    <div className="dropdown-content text-center">
                      <div className="text-primary">
                        <i className="fa-light fa-folder-open"></i>
                      </div>
                      <div className="mt-10 text-muted">
                        No new notifications.
                      </div>
                    </div>
                  </div>
                </div>*/}
                {/* Notifications end */}

                {/* Connect wallet button start */}
                <Wallet />
                {/* Connect wallet button end */}
              </nav>
            </div>
            <hr className="w-100"/>
            {/* Navbar end */}

            {/* Main content start */}
            {/* Content start (React router outlet component) */}
            <Outlet />
            {/* Content end (React router outlet component) */}
            {/* Main content end */}

            {/* Footer start */}
            <div className="content text-center text-muted mt-auto mb-15 pt-50 fs-base-n2">
              <a
                href="#"
                className="d-inline-block link-reset text-decoration-none mx-10 my-5"
              >
                Terms & Conditions
              </a>
              <a
                href="#"
                className="d-inline-block link-reset text-decoration-none mx-10 my-5"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="d-inline-block link-reset text-decoration-none mx-10 my-5"
              >
                About NFTY
              </a>
              <a
                href="#"
                className="d-inline-block link-reset text-decoration-none mx-10 my-5"
              >
                FAQs
              </a>
            </div>
            {/* Footer end */}
          </div>
          {/* Content wrapper end */}
        </div>
    </ConnectKitProvider>
  );
};
