import { ConnectKitButton } from "connectkit";

export function Wallet() {
  return (
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
          <button
            onClick={show}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-wallet me-5"></i>
            {isConnected && <span>{truncatedAddress}</span>}
            {!isConnected && <span>Connect</span>}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
