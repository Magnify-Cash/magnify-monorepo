import { Link, useParams } from "react-router-dom";
import { useQuery } from "urql";
import { ExploreShopsDocument } from "../../../.graphclient";
import { Loading } from "@/components/Loading";
import { ethers } from "ethers";

type Shop = {
  nftCollectionImage?: string;
  name: string;
  id: number;
  owner: string;
  interestA: number;
  interestB: number;
  interestC: number;
  balance: number;
  decimals: number;
};

const colorToIDMap = (id: number) => {
  const colors = [
    "shop-header-pink",
    "shop-header-purple",
    "shop-header-green",
    "shop-header-yellow",
    "shop-header-red",
    "shop-header-blue",
    "shop-header-orange",
    "shop-header-teal",
    "shop-header-mint",
    "shop-header-indigo",
  ];
  return colors[id % 10];
};

const ShopCard = ({
  nftCollectionImage,
  id,
  name,
  owner,
  interestA,
  interestB,
  interestC,
  balance,
  decimals,
}: Shop) => {
  return (
    <div className="col-sm-6 col-md-8 offset-md-2 col-lg-6 offset-lg-0 col-xl-4">
      <Link
        to={`/borrow/request-loan/${id}`}
        className="card card-link p-0 overflow-hidden border-0"
      >
        <div
          className={`${colorToIDMap(
            id
          )} hs-75 p-10 d-flex justify-content-start align-items-end overflow-hidden`}
        >
          <strong className="shop-name py-5 px-10 lh-sm rounded-3 fs-base-p2">
            {name}
          </strong>
        </div>
        <div className="p-15">
          <div className="d-flex align-items-center">
            <div className="ws-50 hs-50 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 rounded-circle bg-gray-very-light-lm bg-dark-gray-very-dim-dm">
              <img
                src={nftCollectionImage}
                alt="image"
                className="d-block w-auto h-100"
              />
            </div>
            <div className="ps-10 text-truncate">
              <div className="fw-bold text-strong text-truncate">{name}</div>
              <div className="text-muted fs-base-n2 text-truncate">
                By {owner}
              </div>
            </div>
          </div>
          <div className="text-truncate text-muted fs-base-n2 mt-15">
            Interest Rates
          </div>
          <div className="text-truncate text-warning-dim-lm text-warning-light-dm fw-bold">
            <i className="fa-regular fa-badge-percent me-5"></i>
            {Math.min(interestA, interestB, interestC)} -{" "}
            {Math.max(interestA, interestB, interestC)}%
          </div>
          <div className="text-truncate text-muted fs-base-n2 mt-15">
            Available Liquidity
          </div>
          <div className="text-truncate text-success fw-bold">
            <i className="fa-regular fa-piggy-bank me-5"></i>
            {ethers.utils.formatUnits(balance, decimals)}
          </div>
        </div>

        <div className="show-on-hover position-absolute z-1 w-100 start-0 bottom-0 bg-primary text-on-primary text-center py-15 fw-bold">
          Borrow Now
        </div>
      </Link>
    </div>
  );
};

export const ExploreShops = () => {
  const { address } = useParams();
  const [result] = useQuery({
    query: ExploreShopsDocument,
    variables: {
      // @ts-ignore
      nftCollectionAddress: address,
    },
  });

  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="content mb-0 text-base">
          <Link
            to="/borrow/explore-collections"
            className="link-reset text-decoration-none fw-bold d-flex align-items-center"
          >
            <i className="fa-solid fa-circle-arrow-left fs-base-p4 text-primary me-10"></i>
            Back to Explore
          </Link>
        </div>
        <div className="card mt-15">
          <div className="row">
            <div className="col-md-auto flex-shrink-0 align-self-center">
              <div className="ws-100 hs-100 rounded-circle mx-auto d-flex align-items-center justify-content-center overflow-hidden">
                <img
                  src={`/images/nft-collections/${result?.data?.nftCollection?.symbol}.png`}
                  alt="image"
                  className="d-block w-auto h-100"
                />
              </div>
            </div>
            <div className="col-md align-self-center text-center text-md-start pt-20 pt-md-0 ps-md-20">
              <h1 className="text-strong fw-700 display-6 m-0">
                <span className="text-primary">
                  {result?.data?.nftCollection?.name}
                </span>{" "}
                Liquidity Shops
              </h1>
              <p className="text-muted mt-5 mb-0">
                Find the Liquidity Shop best suited for you.
              </p>
            </div>
          </div>
        </div>
        <div className="row row-eq-spacing-lg mb-0">
          <div className="col-lg-8">
            <div className="content">
              <h5 className="text-strong fw-700 fsr-6 m-0">Total</h5>
              <div className="mt-5">
                <strong className="text-primary">
                  <i className="fa-regular fa-shop"></i>{" "}
                  {result.data?.nftCollection?.liquidityShops.length}
                </strong>
                <span className="text-muted"> Shops</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 align-self-center">
            <div className="position-relative">
              <input
                type="text"
                name="search-shops"
                id="search-shops"
                className="form-control rounded-pill ps-40"
                placeholder="Search Shops"
              />
              <label
                htmlFor="search-shops"
                className="position-absolute top-50 start-0 translate-y-middle text-primary mx-10"
              >
                <i className="fa-regular fa-search"></i>
              </label>
            </div>
          </div>
        </div>
        {/* Header end */}

        {/* Content start */}
        <div className="row g-content m-0">
          {result.data?.nftCollection?.liquidityShops
            ?.sort((a, b) => b.balance - a.balance)
            ?.map((item) => (
              <ShopCard
                key={item.id}
                {...{
                  ...item,
                  id: parseInt(item.id),
                  decimals: item.erc20.decimals,
                }}
              />
            ))}
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
