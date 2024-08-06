import { TermsOfService } from "@/components/TermsOfService";
import type { ToastProps } from "@/components/ToastComponent";
import { CreateToast } from "@/helpers/CreateToast";
import { getProtocolGraphUrl } from "@/helpers/ProtocolDefaults";
import { ConnectKitButton, ConnectKitProvider } from "connectkit";
import { type ReactElement, cloneElement, createContext, useState } from "react";
import { Outlet, useOutlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
import { useChainId } from "wagmi";
declare let bootstrap: any;

type ToastContextType = {
  addToast: (
    title: string,
    message: string | ReactElement,
    type: ToastProps["variant"],
    hide?: boolean,
  ) => number;
  closeToast: (indexOfToast: number) => void;
};
function findTitleProps(obj: any): string {
  if (obj.props?.title) {
    return obj.props.title;
  }

  if (obj.props?.children) {
    if (Array.isArray(obj.props.children)) {
      for (const child of obj.props.children) {
        return findTitleProps(child);
      }
    } else {
      return findTitleProps(obj.props.children);
    }
  }

  return "";
}

function getCookie(cname: string) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function closeSidebar() {
  const offcanvas = bootstrap.Offcanvas.getInstance("#sidebar");
  offcanvas?.hide();
}

//Creating Toast Context to be used by all components to send toast messages
export const ToastContext = createContext<ToastContextType | null>(null);

export const Base = () => {
  // title
  const obj = useOutlet();
  const title = findTitleProps(obj);

  //toasts state contains all the toasts that are currently both visible or hidden
  const [toasts, setToasts] = useState<ReactElement[]>([]);

  // Function to add a new toast
  const addToast: ToastContextType["addToast"] = (title, message, type) => {
    const key = Math.random().toString(36).substring(2, 11); // Generate a random key
    const newToast = CreateToast(title, message, type, toasts.length + 1, key);
    setToasts((prevToasts) => [...prevToasts, newToast]);
    return newToast.props.index;
  };

  // Function to close a toast
  const closeToast: ToastContextType["closeToast"] = (indexOfToast) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast && toast.props.index === indexOfToast
          ? cloneElement(toast, { hide: true })
          : toast,
      ),
    );
  };

  // theme
  const activeClass =
    "nav-link px-2 py-1 lh-lg rounded d-flex align-items-center active text-bg-primary fw-bold antialiased";
  const inactiveClass = "nav-link px-2 py-1 lh-lg rounded d-flex align-items-center";

  // graphQL
  const chainId = useChainId();
  const client = new Client({
    url: getProtocolGraphUrl(chainId),
    exchanges: [cacheExchange, fetchExchange],
  });

  return (
    <ToastContext.Provider value={{ addToast, closeToast }}>
      <ConnectKitProvider>
        <Provider value={client}>
          {/* Sidebar start */}
          <nav
            id="sidebar"
            className="sidebar bg-primary-subtle border-primary-subtle offcanvas-start offcanvas-lg"
            tabIndex={-1}
          >
            <div className="offcanvas-header">
              <NavLink
                to="/"
                className="sidebar-brand d-flex align-items-center me-auto"
              >
                <img
                  src="/theme/magnify-cash-logo.jpeg"
                  alt="Logo"
                  width="28"
                  height="28"
                  className="d-block rounded flex-shrink-0 me-2"
                />
                <strong className="antialiased">Magnify Cash</strong>
              </NavLink>
              <button
                type="button"
                className="btn-close d-lg-none"
                data-bs-dismiss="offcanvas"
                data-bs-target="#sidebar"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body">
              {/* Borrow */}
              <ul className="sidebar-nav">
                <li>
                  <h6 className="sidebar-header fw-bold">Borrower</h6>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="borrower-dashboard"
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-grid-2" />
                    </span>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="quick-loan"
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-bolt" />
                    </span>
                    Get Quick Loan
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="explore"
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-folders" />
                    </span>
                    Browse Collections
                  </NavLink>
                </li>
              </ul>
              {/* End Borrow */}

              {/* Lend */}
              <ul className="sidebar-nav mt-3">
                <li>
                  <h6 className="sidebar-header fw-bold">Lender</h6>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="lender-dashboard"
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-grid-2" />
                    </span>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="create-desk"
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-circle-plus" />
                    </span>
                    Create Lending Desk
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="manage-desks"
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-bank" />
                    </span>
                    Manage Lending Desks
                  </NavLink>
                </li>
              </ul>
              {/* End Lend */}

              {/* Support */}
              <ul className="sidebar-nav mt-3">
                <li>
                  <h6 className="sidebar-header fw-bold">Support</h6>
                </li>
                {/* <li className="nav-item">
                <NavLink
                  to="help"
                  onClick={() => closeSidebar()}
                  className={({ isActive }) =>
                    isActive ? activeClass : inactiveClass
                  }
                >
                  <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                    <i className="fa-light fa-question"></i>
                  </span>
                  Help
                </NavLink>
              </li> */}
                <li className="nav-item">
                  <NavLink
                    to="https://magnify.gitbook.io/magnify.cash/"
                    target="_blank" // Opens the link in a new tab
                    rel="noopener noreferrer" // Recommended for security
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-square-list" />
                    </span>
                    Docs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="https://discord.gg/magnifycash"
                    target="_blank" // Opens the link in a new tab
                    rel="noopener noreferrer" // Recommended for security
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-city" />
                    </span>
                    Community
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="https://faucet.magnify.cash"
                    target="_blank" // Opens the link in a new tab
                    rel="noopener noreferrer" // Recommended for security
                    onClick={() => closeSidebar()}
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <span className="ws-25 flex-shrink-0 fs-base-p2 me-2">
                      <i className="fa-light fa-faucet" />
                    </span>
                    Testnet Faucet
                  </NavLink>
                </li>
              </ul>
              {/* End Support */}
            </div>
          </nav>
          {/* Sidebar end */}

          <div className="content-wrapper min-vh-100">
            {/* Navbar start */}
            <div
              className="alert bg-primary bg-opacity-10 alert-dismissible fade show rounded-0"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <i className="fa-light fa-bell-ring me-3"></i>
                <div>
                  Alert: What's New — Enhanced UI and responsiveness, fixed stats for
                  borrowers and lenders.{" "}
                  <a
                    target="_blank"
                    href="https://blog.magnify.cash/june-6th-release-notes/"
                    rel="noreferrer"
                  >
                    Read more here<i className="fa-light fa-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="py-2 py-lg-3">
              <div className="container-md px-3 px-sm-4 px-xl-5 py-1 d-lg-flex align-items-center">
                <div className="ps-lg-3 ms-auto mb-3 mb-lg-0 d-flex order-lg-last">
                  <div className="btn-group me-3 d-lg-none">
                    <button
                      type="button"
                      className="btn btn-link"
                      aria-label="Toggle sidebar"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#sidebar"
                    >
                      <i className="fa-solid fa-bars" />
                    </button>
                  </div>
                  <NavLink to="/" className="d-lg-none me-auto">
                    <img
                      src="/theme/magnify-cash-logo.jpeg"
                      alt="Logo"
                      width="28"
                      height="28"
                    />
                  </NavLink>
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
                          <div>
                            <button
                              onClick={show}
                              className="btn btn-md btn-primary d-sm-none"
                            >
                              {!isConnected && <small>Connect</small>}
                              <i className="fa-solid fa-wallet ms-2" />
                            </button>
                            <button
                              onClick={show}
                              className="btn btn-md btn-primary d-none d-sm-inline"
                            >
                              {isConnected && <small>{truncatedAddress}</small>}
                              {!isConnected && <small>Connect</small>}
                              <i className="fa-solid fa-wallet ms-2" />
                            </button>
                          </div>
                        </>
                      );
                    }}
                  </ConnectKitButton.Custom>
                </div>
                <h3
                  id="base-title"
                  className="m-0 text-center text-lg-start order-lg-first"
                >
                  {title}
                </h3>
              </div>
            </div>
            {/* Navbar end */}

            {/* Content start */}
            <main className="mt-4 mt-xl-5">
              <Outlet />
            </main>
            {/* Content end */}
          </div>

          {/* Toasts start */}
          <div
            id="toast-container"
            className="toast-container position-fixed top-0 end-0 p-3"
          >
            {toasts.map((toast) => cloneElement(toast, { key: toast.key }))}
          </div>
          {/* Toasts end */}

          {/* Terms of service */}
          <TermsOfService />
          {/* End terms of service */}
        </Provider>
      </ConnectKitProvider>
    </ToastContext.Provider>
  );
};
