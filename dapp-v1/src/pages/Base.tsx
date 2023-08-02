import { useState } from "react";
import { useOutlet, Outlet } from "react-router-dom";
import { ConnectKitProvider } from "connectkit";
import { Wallet } from "@/components";
import { NavLink } from "react-router-dom";

function findTitleProps(obj) {
  const titles = [];

  if (obj.props && obj.props.title) {
    return obj.props.title
  }

  if (obj.props && obj.props.children) {
    if (Array.isArray(obj.props.children)) {
      for (const child of obj.props.children) {
        return findTitleProps(child);
      }
    } else {
      return findTitleProps(obj.props.children);
    }
  }

  return titles;
}


export const Base = () => {
  // theme
  const activeClass = "btn d-flex align-items-center w-100 mt-2 text-start focus-ring fw-normal active";
  const inactiveClass = "btn d-flex align-items-center w-100 mt-2 text-start focus-ring fw-normal";
  const obj = useOutlet();
  const title = findTitleProps(obj);
  return (
    <ConnectKitProvider>
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
                  {/* Home */}
                  <NavLink
                    to="/"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-home"></i>
                    </span>
                    Home
                  </NavLink>

                  {/* Borrow */}
                  <div className="text-body-secondary text-uppercase mt-4">
                    <small>Borrow</small>
                  </div>
                  <NavLink
                    to="dashboard"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-grid-2"></i>
                    </span>
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="quickloan"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-bolt"></i>
                    </span>
                    Quick Loan
                  </NavLink>
                  <NavLink
                    to="explore"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-folders"></i>
                    </span>
                    Browse Collections
                  </NavLink>

                  {/* Lend */}
                  <div className="text-body-secondary text-uppercase mt-4">
                    <small>Lend</small>
                  </div>
                 <NavLink
                   to="dashboard"
                   className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                 >
                   <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                     <i className="fa-light fa-grid-2"></i>
                   </span>
                   Dashboard
                 </NavLink>
                 <NavLink
                   to="quickloan"
                   className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                 >
                   <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                     <i className="fa-light fa-circle-plus"></i>
                   </span>
                   Create Lending Desk
                 </NavLink>
                 <NavLink
                   to="manage_desks"
                   className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                 >
                   <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                     <i className="fa-light fa-bank"></i>
                   </span>
                   Manage Lending Desks
                 </NavLink>

                  {/* Support */}
                  <div className="text-body-secondary text-uppercase mt-4">
                    <small>Support</small>
                  </div>
                  <NavLink
                    to="help"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-question"></i>
                    </span>
                    Help
                  </NavLink>
                  <NavLink
                    to="docs"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-square-list"></i>
                    </span>
                    Docs
                  </NavLink>
                  <NavLink
                    to="community"
                    className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-city"></i>
                    </span>
                    Community
                  </NavLink>

                  {/* NFTY Token */}
                  <div className="text-body-secondary text-uppercase mt-4">
                    <small>$NFTY Token</small>
                  </div>
                    <NavLink
                      to="token"
                      className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                    >
                      <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                        <i className="fa-light fa-store"></i>
                      </span>
                      Get NFTY
                    </NavLink>
                    <NavLink
                      to="stake"
                      className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                    >
                      <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                        <i className="fa-light fa-tent"></i>
                      </span>
                      Stake NFTY
                    </NavLink>
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
                  <h4 className="mb-0 me-3 d-none d-md-block text-truncate">
                      {title}
                  </h4>
                  <div className="ms-auto">
                      <Wallet/>
                  </div>
              </div>
              <div className="container px-3 px-sm-4 mt-3 d-md-none">
                  <h6>
                      {title}
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
