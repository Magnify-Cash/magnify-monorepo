import { useQuery } from "urql";
import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import { ManageShopsDocument } from "../../../.graphclient";
import { Loading, Web3Button } from "@/components";
import {
  usePrepareNftyLendingLiquidityShopCashOut,
  useNftyLendingLiquidityShopCashOut,
  usePrepareNftyLendingAddLiquidityToShop,
  useNftyLendingAddLiquidityToShop,
  usePrepareNftyLendingFreezeLiquidityShop,
  useNftyLendingFreezeLiquidityShop,
  usePrepareNftyLendingUnfreezeLiquidityShop,
  useNftyLendingUnfreezeLiquidityShop,
} from "../../../../wagmi-generated";
import { getProtocolChain } from "@/helpers/ProtocolDefaults";
import { toast } from "@/helpers/Toast";

type Shop = {
  name: string;
  id: number;
  balance: number;
  nftCollectionName: string;
  status: string;
  erc20Decimals: number;
};

const ShopRow = ({
  id,
  name,
  balance,
  nftCollectionName,
  status,
  erc20Decimals,
}: Shop) => {
  // wagmi hooks **************************************************************************
  const { chain } = useNetwork();

  // Cash Out Hook ************************************************************************
  const { config: cashOutConfig, error: cashOutError } =
    usePrepareNftyLendingLiquidityShopCashOut({
      chainId: getProtocolChain(chain?.id),
      args: [
        BigNumber.from(id), // shop ID
      ],
    });
  const { write: cashOutWrite, isLoading: cashOutLoading } =
    useNftyLendingLiquidityShopCashOut({
      ...cashOutConfig,
      onSettled(data, error) {
        toast({
          title: "Cash Out Liquidity Shop",
          content: error ? error?.message : data?.hash,
          alertType: error ? "alert-danger" : "alert-success",
        });
      },
    });

  // Replenish Balance Hook ***************************************************************
  const [replenishAmount, setReplenishAmount] = useState("0");
  const { config: replenishConfig, error: replenishError } =
    usePrepareNftyLendingAddLiquidityToShop({
      chainId: getProtocolChain(chain?.id),
      args: [
        BigNumber.from(id), // shop ID
        replenishAmount
          ? ethers.utils.parseUnits(replenishAmount, erc20Decimals)
          : BigNumber.from(0), // Liquidity to add
      ],
    });
  const { write: replenishWrite, isLoading: replenishLoading } =
    useNftyLendingAddLiquidityToShop({
      ...replenishConfig,
      onSettled(data, error) {
        toast({
          title: "Add Liquidity to Shop",
          content: error ? error?.message : data?.hash,
          alertType: error ? "alert-danger" : "alert-success",
        });
      },
    });

  // Freeze/Unfreeze Hook *****************************************************************
  const { config: freezeConfig, error: freezeError } =
    usePrepareNftyLendingFreezeLiquidityShop({
      chainId: getProtocolChain(chain?.id),
      args: [
        BigNumber.from(id), // shop ID
      ],
    });
  const { write: freezeWrite, isLoading: freezeLoading } =
    useNftyLendingFreezeLiquidityShop({
      ...freezeConfig,
      onSettled(data, error) {
        toast({
          title: "Freeze Liquidity Shop",
          content: error ? error?.message : data?.hash,
          alertType: error ? "alert-danger" : "alert-success",
        });
      },
    });
  const { config: unfreezeConfig, error: unfreezeError } =
    usePrepareNftyLendingUnfreezeLiquidityShop({
      chainId: getProtocolChain(chain?.id),
      args: [
        BigNumber.from(id), // shop ID
      ],
    });
  const { write: unfreezeWrite, isLoading: unfreezeLoading } =
    useNftyLendingUnfreezeLiquidityShop({
      ...unfreezeConfig,
      onSettled(data, error) {
        toast({
          title: "Unfreeze Liquidity Shop",
          content: error ? error?.message : data?.hash,
          alertType: error ? "alert-danger" : "alert-success",
        });
      },
    });

  // Return *******************************************************************************
  return (
    <div className="row border-bottom">
      <div className="col-6 col-md-3 col-lg-2 align-self-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Shop Name
          </div>
          <div>{name}</div>
        </div>
      </div>
      <div className="col-6 col-md-3 col-lg-2 align-self-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            NFT Collection
          </div>
          <div>{nftCollectionName}</div>
        </div>
      </div>
      <div className="col-6 col-md-3 col-lg-2 align-self-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Initially Deposited
          </div>
          <div className="text-truncate">
            {ethers.utils.formatUnits(balance, erc20Decimals)}
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3 col-lg-2 align-self-center">
        <div className="p-10 text-lg-center">
          <div className="text-muted fs-base-n2 d-lg-none lh-sm mb-5">
            Remaining Balance
          </div>
          <div className="text-truncate">
            {ethers.utils.formatUnits(balance, erc20Decimals)}
          </div>
        </div>
      </div>
      <div className="col-lg-4 align-self-center">
        <div className="p-10 text-center">
          <div className="dropdown with-arrow">
            <button
              className="btn btn-sm rounded-pill"
              data-hm-toggle="dropdown"
              id="actions-dropdown-toggle"
              aria-expanded="false"
            >
              <i className="fa-light fa-cog"></i>
              Actions
            </button>
            <div
              className="dropdown-menu dropdown-menu-center ws-250"
              aria-labelledby="actions-dropdown-toggle"
            >
              {status === "FROZEN" ? (
                <Web3Button
                  error={unfreezeError}
                  loading={unfreezeLoading}
                  className="btn dropdown-item"
                  onClick={() => unfreezeWrite?.()}
                >
                  <i className="fa-light fa-cube text-secondary-lm text-secondary-light-dm me-5"></i>
                  Unfreeze Shop
                </Web3Button>
              ) : (
                <Web3Button
                  error={freezeError}
                  loading={freezeLoading}
                  className="btn dropdown-item"
                  onClick={() => freezeWrite?.()}
                >
                  <i className="fa-light fa-cube text-secondary-lm text-secondary-light-dm me-5"></i>
                  Freeze Shop
                </Web3Button>
              )}
              <div className="dropdown-divider"></div>
              <Web3Button
                error={cashOutError}
                loading={cashOutLoading}
                className="btn dropdown-item"
                onClick={() => cashOutWrite?.()}
              >
                <i className="fa-solid fa-check text-success-lm text-success-light-dm me-5"></i>
                Cash Out
              </Web3Button>
              <div className="dropdown-divider"></div>
              <div className="dropdown-divider"></div>
              <h6 className="dropdown-header">
                <i className="fa-light fa-seedling text-warning-dim-lm text-warning-light-dm me-5"></i>
                Replenish Balance
              </h6>
              <div className="dropdown-content">
                <form>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter Balance"
                      value={replenishAmount}
                      min={0}
                      onChange={(e) => setReplenishAmount(e.target.value)}
                    />
                    <Web3Button
                      error={replenishError}
                      loading={replenishLoading}
                      className="btn btn-warning"
                      onClick={() => replenishWrite?.()}
                    >
                      <i className="fa-solid fa-check"></i>
                      <span className="visually-hidden">Submit</span>
                    </Web3Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ManageShops = () => {
  // wagmi hooks **************************************************************************
  const { address } = useAccount();

  // GraphQL and data *********************************************************************
  const [result] = useQuery({
    query: ManageShopsDocument,
    variables: { walletAddress: address },
  });

  // Return *******************************************************************************
  if (result.fetching) return <Loading />;

  return (
    <div className="container-xl">
      <div className="px-xxl-50">
        {/* Header start */}
        <div className="content">
          <h1 className="text-strong fw-700 display-6 mt-0">
            Manage Liquidity Shops
          </h1>
          <p className="text-muted mb-0">
            Manage your Liquidity Shops. Please click on the actions button to
            see your options.
          </p>
        </div>
        {/* Header end */}

        {/* Content start */}
        <div className="card p-0">
          <div className="p-10 text-muted text-center border-bottom border-dotted border-top-0 border-start-0 border-end-0">
            LIQUIDITY SHOP DETAILS
          </div>

          {/* Table header start */}
          <div className="row border-bottom fs-base-n2 d-none d-lg-flex">
            <div className="col-6 col-md-3 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Shop Name</div>
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">NFT Collection</div>
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Initially Deposited</div>
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Remaining Balance</div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="p-10 text-lg-center">
                <div className="text-muted">Actions</div>
              </div>
            </div>
          </div>
          {/* Table header end */}

          {result.data?.liquidityShops.map((shop) => (
            <ShopRow
              key={shop.id}
              {...{
                ...shop,
                nftCollectionName: shop.nftCollection.name,
                id: parseInt(shop.id),
                erc20Decimals: shop.erc20.decimals,
              }}
            />
          ))}

          <div className="p-10 text-muted text-center">
            Total {result.data?.liquidityShops.length || 0} Shops
          </div>
        </div>
        {/* Content end */}
      </div>
    </div>
  );
};
