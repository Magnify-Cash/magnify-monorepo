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
            className="btn btn-primary ms-10 ws-100"
          >
            <i className="fa-solid fa-plus me-5"></i>
            {isConnected && <span>{truncatedAddress}</span>}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
