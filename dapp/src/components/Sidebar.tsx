import { Link, NavLink } from "react-router-dom";

export const Sidebar = () => {
  const activeClass = "sidebar-link d-flex align-items-center active";
  const inactiveClass = "sidebar-link d-flex align-items-center";

  return (
    <nav className="sidebar min-vh-100 d-flex flex-column">
      <div className="sidebar-menu mt-0">
        {/* Sidebar brand start */}
        <Link to="/" className="sidebar-brand m-0 hs-75 mb-20">
          <img
            src="/images/logo.svg"
            className="mx-auto pe-none hidden-dm"
            alt="Logo"
          />
          <img
            src="/images/logo_white.svg"
            className="mx-auto pe-none hidden-lm"
            alt="Logo"
          />
        </Link>
        {/* Sidebar brand end */}

        {/* Sidebar links start */}
        {/*
        <NavLink
          to="dashboard"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-house-blank"></i>
          </span>
          Dashboard
        </NavLink>
		*/}

        <div className="sidebar-title text-primary mt-20">Borrow</div>
        <NavLink
          to="/borrow/explore-collections"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-folders"></i>
          </span>
          Browse Collections
        </NavLink>
        <NavLink
          to="/borrow/dashboard"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <span className="ws-25 flex-shrink-0 fs-base-p2 me-10">
            <i className="fa-light fa-chart-line"></i>
          </span>
          Borrowing Dashboard
        </NavLink>
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
        {/* Sidebar links end */}
      </div>
      <div className="dropdown-content mt-auto fs-base-n2">
        <div className="d-flex align-items-center pb-10">
          <a href="#" className="btn btn-sm w-50 me-5 px-5">
            <i className="fa-light fa-external-link me-5"></i>
            Stake NFTY
          </a>
          <a href="#" className="btn btn-sm w-50 ms-5 px-5">
            <i className="fa-light fa-external-link me-5"></i>
            Get NFTY
          </a>
        </div>
      </div>
    </nav>
  );
};
