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
            {isConnected && <span>{truncatedAddress}</span>}
            {!isConnected && <span>Connect</span>}
            <i className="fa-solid fa-wallet mx-2"></i>
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
