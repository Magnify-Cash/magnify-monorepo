import { PopupTransaction } from "./PopupTransaction";

interface ILoanCardProps {
	type: string;
}

export const LoanCard = (props:ILoanCardProps) => {
	return (
		<div className="col-sm-6 col-xl-4">
			<div className="card border-0 shadow rounded-4 h-100">
				<div className="card-body">
					<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle overflow-hidden">
						<img src="/images/placeholder/doodles.png" alt="test" height="100%" width="100%"/>
					</div>
					<div className="text-center mt-3">
						<h5>[Collection Name] #[NFT ID]</h5>
						<div className="row g-4">
							<div className="col-6 bg-info">
							<p>Amount Borrowed</p>
							<p>[x] [Currency]</p>
							</div>
							<div className="col-6 bg-success">
							<p>Payoff Amount</p>
							<p>[x] [Currency]</p>
							</div>
							<div className="col-12">
								[x] Days Left
								<div className="progress my-2">
								  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} style={{width: "75%"}}/>
								</div>
							</div>
						</div>
						{props.type =="borrower" &&
						<PopupTransaction
						btnClass="btn btn-primary btn-lg mt-2 mb-4 ms-auto"
						btnText="Finalize Lending Desk"
						modalId="txModal"
						modalBtnText="Launch Lending Desk"
						modalFunc={() => console.log('hi')}
						modalTitle="Confirm Lending Desk"
						modalContent={<div></div>}
						/>
						}
					</div>
				</div>
			</div>
		</div>
	)
}