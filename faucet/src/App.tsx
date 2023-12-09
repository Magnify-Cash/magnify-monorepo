import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance } from "wagmi";
import logo from "@/logo.svg";
import { MintTokens } from "@/components/MintTokens";
import { MintNfts } from "@/components/MintNfts";
import { config } from "@/config";

export function App() {
  const { address, isConnected } = useAccount();
  const { data } = useBalance({ address: address });

  return (
    <div
      className="d-flex flex-column min-vh-100 mx-auto mw-100"
      style={{ width: "600px", backgroundColor: "#fff" }}
    >
      {/* testnet banner start */}
      <div className="alert alert-info-outline fade show" role="alert">
        <span className="alert-text">Claim Seplolia testnet ETH here: </span>
        <div className="row">
          <div className="col">
            <a target="_blank" href="https://sepoliafaucet.com">
              Testnet Faucet
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
          alt="NFTY Finance Logo"
        />
      </div>
      <div className="py-3 px-3 px-sm-5">
        <div className="border-bottom pb-4">
          <br />
          <h1 className="mb-0 fsr-5 fw-bold">NFTY Testnet Faucet</h1>
          <p className="mt-3 text-muted">
            Welcome to the <strong>NFTY Finance</strong> Testnet Faucet.
          </p>
          <ConnectKitButton />
        </div>
        {isConnected && data && data?.decimals <= 0 ? (
          <div>
            <p>Please fund your wallet with {config?.ethName} to continue.</p>
            <ul>
              <li>
                <a href={config?.ethFaucetUrl}>{config?.ethName} Faucet</a>
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
        &copy; 2022, nfty.finance, All Rights Reserved
      </div>
    </div>
  );
}
