import { useAccount } from 'wagmi'


/*
Component Props
*/
export interface PopupTransactionProps {
	loading?: boolean; // loading state
  	error?: any | null; // error state
	disabled?:boolean;
	divClass?: string;
	btnClass: string; // modal btn trigger classname
	btnText: string | React.ReactNode; // modal btn trigger text
	modalId: string; // id of modal
	modalBtnText: string; // btn text of modal
	modalContent: React.ReactNode; // modal content
	modalFunc:Function; // transaction function used in modal onclick
	modalTitle: string; // title of modal
}


export const PopupTransaction = (props:PopupTransactionProps) => {
	const { isConnected } = useAccount();
	let snippet = (
		<button
		  className={props.btnClass}
		  disabled={props.loading || !!props.error || props.disabled}
		  data-bs-toggle="modal" data-bs-target={`#${props.modalId}`}
		>
			{props.btnText}
		</button>
	  );
	if (isConnected === false) {
		snippet = (
		  <button className={props.btnClass} disabled={true}>
			Connect Wallet
		  </button>
		);
	  }
	  if (props.error) {
		snippet = (
		  <button className={props.btnClass} disabled={true}>
			{props.error.reason}
		  </button>
		);
	  }
	  if (props.loading) {
		snippet = (
		  <button className={props.btnClass} disabled={true}>
			Loading...
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
			  <button className="btn btn-primary" onClick={() => props.modalFunc()}>
			  {props.modalBtnText}
			  </button>
			  </div>
			</div>
		  </div>
		</div>
		</div>
	)
}