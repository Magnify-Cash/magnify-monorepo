import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance, useChainId } from "wagmi";
import logo from "@/logo.jpeg";
import { MintTokens } from "@/components/MintTokens";
import { MintNfts } from "@/components/MintNfts";
import { config } from "@/config";

export function App() {
  const { address, isConnected } = useAccount();
  const { data } = useBalance({ address: address });

  const chainId = useChainId();
  const chainConfig = config[chainId];
  if (!chainConfig) throw new Error("Invalid config");

  return (
    <div
      className="d-flex flex-column min-vh-100 mx-auto mw-100"
      style={{ width: "600px", backgroundColor: "#fff" }}
    >
      {/* testnet banner start */}
      <div className="alert alert-info-outline fade show" role="alert">
        <span className="alert-text">Claim Testnet ETH here:</span>
        <div className="row">
          <div className="col">
            <a target="_blank" href="https://www.alchemy.com/faucets/base-sepolia">
              Alchemy Faucet
            </a>
            <br/>
            <a target="_blank" href="https://faucet.quicknode.com/base/sepolia">
              Quicknode Faucet
            </a>
          </div>
        </div>
      </div>
      {/* testnet banner start */}
      <div className="py-3 px-3 px-sm-5 pt-sm-5">
        <img
          src={logo}
          width="200"
          className="d-block"
          alt="Magnify Cash Finance Logo"
        />
      </div>
      <div className="py-3 px-3 px-sm-5">
        <div className="border-bottom pb-4">
          <br />
          <h1 className="mb-0 fsr-5 fw-bold">Magnify.Cash Testnet Faucet</h1>
          <p className="mt-3 text-muted">
            Welcome to the <strong>Magnify.Cash</strong> Testnet Faucet.
          </p>
          <ConnectKitButton />
        </div>
        {isConnected && data && data?.decimals <= 0 ? (
          <div>
            <p>Please fund your wallet with {chainConfig.ethName} to continue.</p>
            <ul>
              <li>
                <a href={chainConfig.ethFaucetUrl}>{chainConfig.ethName} Faucet</a>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <MintTokens />
            <MintNfts />
          </div>
        )}
      </div>
      <div className="mt-auto text-muted py-3 px-3 px-sm-5 border-top text-end">
        &copy; 2024, magnify.cash, All Rights Reserved
      </div>
    </div>
  );
}
