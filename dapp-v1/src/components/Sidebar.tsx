import { NavLink } from "react-router-dom";

export const Sidebar = () => {
  const activeClass = "sidebar-link d-flex align-items-center active";
  const inactiveClass = "sidebar-link d-flex align-items-center";

  return (
    <nav className="sidebar min-vh-100 d-flex flex-column">
      <div className="sidebar-menu mt-0">
        {/* Sidebar brand start */}
        <NavLink className="sidebar-brand m-0 hs-75 px-30">
          <img
            src="/images/logo.svg"
            className="mx-auto pe-none hidden-dm w-100 h-100"
            alt="Logo"
          />
          <img
            src="/images/logo_white.svg"
            className="mx-auto pe-none hidden-lm w-100 h-100"
            alt="Logo"
          />
        </NavLink>

        {/* Home start */}
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-home"></i>
          </span>
          Home
        </NavLink>
        {/* Home End */}


        {/* Borrow start */}
        <div className="sidebar-title text-primary mt-20">Borrow</div>
        <NavLink
          to="dashboard"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-grid-2"></i>
          </span>
          Dashboard
        </NavLink>
        <NavLink
          to="quickloan"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-bolt"></i>
          </span>
          Quick Loan
        </NavLink>
        <NavLink
          to="/borrow/explore-collections"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-folders"></i>
          </span>
          Browse Collections
        </NavLink>
        {/* Borrow End */}

        {/* Lend Start */}
        <div className="sidebar-title text-primary mt-20">Lend</div>
        <NavLink
          to="lend/create-shop"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-hexagon-plus"></i>
          </span>
          Create Liquidity Shop
        </NavLink>
        <NavLink
          to="lend/manage-shops"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-hexagon-vertical-nft"></i>
          </span>
          Manage Liquidity Shops
        </NavLink>
        <NavLink
          to="lend/dashboard"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-square-list"></i>
          </span>
          Lending Dashboard
        </NavLink>
        {/* Lend End */}

        {/* Support Start */}
        <div className="sidebar-title text-primary mt-20">Support</div>
        <NavLink
          to="get"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-square-list"></i>
          </span>
          Get NFTY
        </NavLink>
        <NavLink
          to="get"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-square-list"></i>
          </span>
          Get NFTY
        </NavLink>
        <NavLink
          to="get"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-square-list"></i>
          </span>
          Get NFTY
        </NavLink>

        {/* Support End */}

        {/* Support Start */}
        <div className="sidebar-title text-primary mt-20">$NFTY Token</div>
        <NavLink
          to="get"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-square-list"></i>
          </span>
          Get NFTY
        </NavLink>
        <NavLink
          to="stake"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-square-list"></i>
          </span>
          Stake NFTY
        </NavLink>
        {/* Support End */}

        {/* Sidebar links end */}
      </div>
    </nav>
  );
};
