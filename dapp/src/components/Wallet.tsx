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
            className="btn btn-primary ms-10 ws-100 w-sm-auto text-truncate"
          >
            <i className="fa-solid fa-plus me-5"></i>
            <span>{isConnected ? truncatedAddress : "Connect Wallet"}</span>
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
