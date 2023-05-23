import { Link } from "react-router-dom";
import { useQuery } from "urql";
import { ExploreCollectionsDocument } from "../../../.graphclient";
import { Loading } from "@/components/Loading";

type NftCollection = {
  name: string;
  symbol: string;
  id: string;
  numLiquidityShops: number;
};

const CollectionCard = ({ item }: { item: NftCollection }) => {
  return (
    <div className="col-sm-6 col-md-8 offset-md-2 col-lg-6 offset-lg-0 col-xl-4">
      <Link
        to={`/borrow/explore-collections/${item.id}`}
        className="card card-link p-0 overflow-hidden border-0"
      >
        <div className="hs-250 hs-sm-300 hs-md-250 d-flex justify-content-center overflow-hidden">
          <img
            src={`/images/nft-collections/${item.symbol}.png`}
            alt="image"
            className="d-block w-auto h-100 mt-20 mb-20"
          />
        </div>
        <div className="p-15">
          <div className="text-truncate text-strong fs-base-p2 fw-bold">
            {item.name}
          </div>
          <div className="text-truncate text-muted fs-base-n2 mt-15">
            Number of shops
          </div>
          <div className="text-truncate text-primary fs-base-n2 fw-bold">
            <i className="fa-regular fa-shop me-5"></i>
            {item.numLiquidityShops}
          </div>
        </div>
        <div className="show-on-hover position-absolute z-1 w-100 start-0 bottom-0 bg-primary text-on-primary text-center py-15 fw-bold">
          View Shops
        </div>
      </Link>
    </div>
  );
};
export const ExploreCollections = () => {
  const [result] = useQuery({ query: ExploreCollectionsDocument });

  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="row row-eq-spacing-lg mb-0">
          <div className="col-lg-8">
            <div className="content">
              <h1 className="text-strong fw-700 display-6 mt-0">
                Explore Collections
              </h1>
              <p className="text-muted mb-0">
                Find the NFT Collection you’d like to borrow against.
              </p>
            </div>
          </div>
          <div className="col-lg-4 align-self-center">
            <div className="position-relative">
              <input
                type="text"
                name="search-collections"
                id="search-collections"
                className="form-control rounded-pill ps-40"
                placeholder="Search Collections"
              />
              <label
                htmlFor="search-collections"
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
          {result.data?.nftCollections.map((item) => (
            <CollectionCard
              key={item.id}
              item={{ ...item, numLiquidityShops: item.liquidityShops.length }}
            />
          ))}
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
