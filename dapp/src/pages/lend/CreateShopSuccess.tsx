import { useLocation, Link } from "react-router-dom";
import { useTransaction } from "wagmi";
import { useNetwork } from "wagmi";
import { CreateShopForm } from "./CreateShop";
import { useQuery } from "urql";
import { CreateShopSuccessDocument } from "../../../.graphclient";
import { Loading } from "@/components";

type State = {
  shopInfo: CreateShopForm;
  createShopTx: `0x{string}`;
};

export const CreateShopSuccess = () => {
  const state = useLocation()?.state as State;

  const [result] = useQuery({
    query: CreateShopSuccessDocument,
    variables: {
      erc20Id: state.shopInfo.erc20,
      nftCollectionId: state.shopInfo.nftCollection,
    },
  });

  // wagmi hooks
  const { data } = useTransaction({
    hash: state.createShopTx,
  });
  const { chain } = useNetwork();

  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        <div className="row">
          <div className="col-lg-11 col-xl-9 mx-auto">
            <div className="card">
              <div className="text-center display-3 text-success">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <h1 className="text-strong fw-700 fsr-1 text-center">
                Liquidity Shop Created
              </h1>
              <p className="text-muted mb-0 text-center">
                Your Liquidity Shop has been created. To manage your Liquidity
                Shop, please navigate to your dashboard.
              </p>
              <div className="my-30">
                <Link
                  to="/borrow/request-loan/"
                  className="btn btn-primary btn-lg btn-block"
                >
                  View Shop
                </Link>
              </div>
              <div className="text-center pb-20 border-bottom border-2 border-primary fw-bold">
                Liquidity Shop Summary
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">NFT Collection</div>
                <div className="col-lg-6 text-lg-end">
                  {result.data?.nftCollection?.symbol} (
                  {result.data?.nftCollection?.name})
                </div>
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">Amount Deposited</div>
                <div className="col-lg-6 text-lg-end">
                  {state.shopInfo.shopAmount} {result.data?.erc20?.symbol}
                </div>
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">Approval Type</div>
                <div className="col-lg-6 text-lg-end">Manual</div>
              </div>
              <div className="row mt-20">
                <div className="col-lg-6 text-muted">Receipt</div>
                <div className="col-lg-6 text-lg-end">
                  <a
                    target="_blank"
                    href={`${chain?.blockExplorers?.default.url}/tx/${data?.hash}`}
                  >
                    Block Explorer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
