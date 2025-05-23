import type React from "react";
import { useEffect } from "react";
import { useAccount } from "wagmi";

interface PopupTransactionProps {
  loading?: boolean; // Loading state
  disabled?: boolean; // Whether or not the button is disabled
  divClass?: string; // Wrapper div className
  btnClass: string; // Modal button trigger classname
  btnText: string | React.ReactNode; // Modal button trigger text
  btnOnClick?: () => void; // Modal button trigger onClick function
  onClose?: () => void; // Modal close function
  modalId: string; // ID of the modal
  modalContent: React.ReactNode; // Modal content
  modalTitle: string; // Title of the modal
  modalFooter?: React.ReactNode; // Modal footer
}

const customStyles = {
  "--bs-modal-width": "500px",
};

export const PopupTransaction: React.FC<PopupTransactionProps> = (props) => {
  const { isConnected } = useAccount();

  let snippet: JSX.Element;

  if (isConnected === false) {
    snippet = (
      <div className="text-body-secondary  mb-3 p-3 border border-danger rounded-pill w-100 d-block mt-3 bg-transparent text-center">
        Please Connect Wallet to Continue
      </div>
    );
  } else if (props.loading) {
    snippet = (
      <button className={props.btnClass} disabled={true}>
        Loading...
      </button>
    );
  } else {
    snippet = (
      <button
        className={props.btnClass}
        disabled={props.loading || props.disabled}
        data-bs-toggle="modal"
        data-bs-target={`#${props.modalId}`}
        onClick={props.btnOnClick}
      >
        {props.btnText}
      </button>
    );
  }

  useEffect(() => {
    const modal = document.getElementById(props.modalId);
    const handleHidden = () => {
      if (props.onClose) {
        props.onClose();
      }
    };
    if (modal) {
      modal.addEventListener("hidden.bs.modal", handleHidden);
    }
    return () => {
      if (modal) {
        modal.removeEventListener("hidden.bs.modal", handleHidden);
      }
    };
  }, [props.modalId, props.onClose]);

  return (
    <div className={props.divClass}>
      {snippet}
      <div className="modal fade" id={props.modalId} tabIndex={-1} aria-hidden="true">
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={customStyles as React.CSSProperties}
        >
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h1 className="modal-title fs-4 fw-medium">{props.modalTitle}</h1>
              <button
                id="closeButton"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">{props.modalContent}</div>
            {props.modalFooter}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupTransaction;
