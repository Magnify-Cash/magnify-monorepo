import React from 'react';
import { useAccount } from 'wagmi';

interface PopupTransactionProps {
  loading?: boolean; // Loading state
  disabled?: boolean; // Whether or not the button is disabled
  divClass?: string; // Wrapper div class
  btnClass: string; // Modal button trigger classname
  btnText: string | React.ReactNode; // Modal button trigger text
  modalId: string; // ID of the modal
  modalBtnText: string; // Button text of the modal
  modalContent: React.ReactNode; // Modal content
  modalFunc: () => void; // Transaction function used in modal onclick
  modalTitle: string; // Title of the modal
}

const PopupTransaction: React.FC<PopupTransactionProps> = (props) => {
  const { isConnected } = useAccount();

  let snippet: JSX.Element;

  if (isConnected === false) {
	snippet = (
	  <button className={props.btnClass} disabled={true}>
		Connect Wallet
	  </button>
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
	  >
		{props.btnText}
	  </button>
	);
  }

  return (
	<div className={props.divClass}>
	  {snippet}
	  <div className="modal modal-md" id={props.modalId} tabIndex={-1} aria-labelledby="test" aria-hidden="true">
		<div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
		  <div className="modal-content">
			<div className="modal-header">
			  <h5 className="modal-title text-center">
				{props.modalTitle}
			  </h5>
			  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div className="modal-body">
			  {props.modalContent}
			  <button className="btn btn-primary" onClick={props.modalFunc}>
				{props.modalBtnText}
			  </button>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  );
};

export default PopupTransaction;
