//@ts-nocheck
//TODO: Figure out 'mode' typing for ConnectKitProvider
import { useEffect, useState } from "react";
import { useOutlet, Outlet } from "react-router-dom";
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { NavLink } from "react-router-dom";

function findTitleProps(obj:any):string {
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

  return '';
}

function getCookie(cname:string) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
	let c = ca[i];
	while (c.charAt(0) == ' ') {
	  c = c.substring(1);
	}
	if (c.indexOf(name) == 0) {
	  return c.substring(name.length, c.length);
	}
  }
  return "";
}

function closeSidebar(){
  const offcanvas = bootstrap.Offcanvas.getInstance('#sidebar')
  offcanvas.hide();
}



export const Base = () => {
  // theme
  const activeClass = "nav-link d-flex align-items-center active";
  const inactiveClass = "nav-link d-flex align-items-center";
  const obj = useOutlet();
  const title = findTitleProps(obj);
  const [ mode, setMode ] = useState('light');

  function toggleDarkMode(){
      window.toggleDarkMode();
	  const cookie = getCookie("colorMode");
	  if (cookie == "light"){
	  	setMode("light");
	  } else {
	  	setMode("dark");
	  }
  }

  return (
      <ConnectKitProvider mode={mode}>
        {/* Sidebar start */}
        <nav id="sidebar" className="sidebar shadow border-0 offcanvas-start offcanvas-lg" tabIndex={-1}>
          <div className="offcanvas-header">
            <a className="sidebar-brand d-flex align-items-center me-auto" href="#">
                  <img src="/theme/icon.svg" alt="Logo" width="28" height="28" className="d-block flex-shrink-0 me-2"/>
                  <strong>nfty.finance</strong>
                </a>
          </div>
          <div className="offcanvas-body">
            <NavLink
            to="/"
            onClick={()=> closeSidebar()}
            className="btn btn-link d-block w-100 text-start bg-primary-subtle"
            >
            <i className="fa-light fa-home me-1"></i>
            Home
            </NavLink>

            {/* Borrow */}
            <ul className="sidebar-nav mt-3">
              <li>
                <h6 className="sidebar-header fw-normal text-body-secondary opacity-75">
                Borrow
                </h6>
              </li>
              <li className="nav-item">
                <NavLink
                to="borrower-dashboard"
                onClick={()=> closeSidebar()}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                  <i className="fa-light fa-grid-2"></i>
                </span>
                Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                to="quick-loan"
                onClick={()=> closeSidebar()}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                  <i className="fa-light fa-bolt"></i>
                </span>
                Get Quick Loan
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                to="explore"
                onClick={()=> closeSidebar()}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                  <i className="fa-light fa-folders"></i>
                </span>
                Browse Collections
                </NavLink>
              </li>
            </ul>
            {/* End Borrow */}

            {/* Lend */}
            <ul className="sidebar-nav mt-3">
            <li>
              <h6 className="sidebar-header fw-normal text-body-secondary opacity-75">
              Lend
              </h6>
            </li>
            <li className="nav-item">
              <NavLink
              to="lender-dashboard"
              onClick={()=> closeSidebar()}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
              <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
               <i className="fa-light fa-grid-2"></i>
              </span>
              Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
              to="create-desk"
              onClick={()=> closeSidebar()}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
              <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
               <i className="fa-light fa-circle-plus"></i>
              </span>
              Create Lending Desk
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
              to="manage-desks"
              onClick={()=> closeSidebar()}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
              <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
               <i className="fa-light fa-bank"></i>
              </span>
              Manage Lending Desks
              </NavLink>
            </li>
            </ul>
            {/* Borrow */}

            {/* Support */}
            <ul className="sidebar-nav mt-3">
            <li>
              <h6 className="sidebar-header fw-normal text-body-secondary opacity-75">
              Support
              </h6>
            </li>
            <li className="nav-item">
              <NavLink
              to="help"
              onClick={()=> closeSidebar()}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
              <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                <i className="fa-light fa-question"></i>
              </span>
              Help
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
              to="docs"
              onClick={()=> closeSidebar()}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
              <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                <i className="fa-light fa-square-list"></i>
              </span>
              Docs
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
              to="community"
              onClick={()=> closeSidebar()}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
              <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                <i className="fa-light fa-city"></i>
              </span>
              Community
              </NavLink>
            </li>
            </ul>
            {/* End Support */}

            {/* NFTY Token */}
            <ul className="sidebar-nav mt-3">
              <li>
                <h6 className="sidebar-header fw-normal text-body-secondary opacity-75">
                $NFTY Token
                </h6>
              </li>
              <li className="nav-item">
                <NavLink
                  to="token"
                  onClick={()=> closeSidebar()}
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                  <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                  <i className="fa-light fa-store"></i>
                  </span>
                  Get NFTY
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="stake"
                  onClick={()=> closeSidebar()}
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                >
                  <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                  <i className="fa-light fa-tent"></i>
                  </span>
                  Stake NFTY
                </NavLink>
              </li>
            </ul>
            {/* End Token */}
          </div>
        </nav>
        {/* Sidebar end */}

        {/* Navbar start */}
        <div className="border-bottom py-3">
          <div className="container-md px-3 px-sm-4 px-xl-5 py-1 d-md-flex align-items-center">
            <h3 className="m-0 text-center text-md-start">{title}</h3>
            <div className="ps-md-3 ms-auto mt-3 mt-md-0 text-center d-md-flex">
              <button type="button" className="btn btn-secondary rounded-pill me-2 d-lg-none" aria-label="Toggle sidebar" data-bs-toggle="offcanvas" data-bs-target="#sidebar">
                <i className="fa-solid fa-bars"></i>
              </button>
              <button type="button" className="btn btn-secondary rounded-pill me-2" aria-label="Toggle dark mode" onClick={() => toggleDarkMode()}
                  style={{ width: '37px' }}>
                  <i className="fa-solid fa-moon"></i>
              </button>
              {/*
              <button type="button" className="btn btn-secondary rounded-pill me-2" aria-label="Notifications">
                <i className="fa-solid fa-bell"></i>
              </button>*/}
              <ConnectKitButton.Custom>
              {({
                isConnected,
                isConnecting,
                truncatedAddress,
                show,
                hide,
                address,
                ensName,
              }) => {
                return (
                <>
                <button
                  onClick={show}
                  className="btn btn-md btn-primary d-none d-md-block"
                >
                  {isConnected && <small>{truncatedAddress}</small>}
                  {!isConnected && <small>Connect</small>}
                  <i className="fa-solid fa-wallet mx-2"></i>
                </button>
                <button
                  onClick={show}
                  className="btn btn-sm btn-primary d-md-none"
                >
                  <i className="fa-solid fa-wallet mx-2"></i>
                </button>
                </>
                );
              }}
              </ConnectKitButton.Custom>
            </div>
          </div>
        </div>
        {/* Navbar end */}

        {/* Content start */}
        <main className="mt-4 mt-xl-5">
            <Outlet/>
        </main>
        {/* Content end */}

        </ConnectKitProvider>
  );
};
