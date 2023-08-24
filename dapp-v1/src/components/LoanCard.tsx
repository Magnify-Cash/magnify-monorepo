import { PopupTransaction } from "./PopupTransaction";

interface ILoanCardProps {
	type: string;
}



export const LoanCard = (props:ILoanCardProps) => {
	return (
		<div className="col-sm-6 col-xl-4">
			<style>
				{`
				  .progress {margin-bottom:0;}
				  .start {float:left;}
				  .end {float:right; text-align:right;}
				`}
			  </style>

			<div className="card border-0 shadow rounded-4 h-100">
				<div className="card-body">
					<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle overflow-hidden">
						<img className="object-fit-cover" src="/images/placeholder/doodles.png" alt="test" height="100%"/>
					</div>
					<div className="text-center mt-3">
						<h5>[Collection Name] #[NFT ID]</h5>
						<div className="row g-4">
							<div className="col-6 bg-info">
								<i className="fa-regular fa-hand-holding-dollar h1 me-1"></i>
								<p>[x] [Currency]</p>
								<small>borrowed</small>
							</div>
							<div className="col-6 bg-success">
								<i className="fa-regular fa-calendar h1 me-1"></i>
								<p>[x] [Currency]</p>
								<small>payoff amount</small>
							</div>
							<div className="col-12">
								<h5 className="text-start">[x] Days Left</h5>
								<div className="progress my-2">
								  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} style={{width: "75%"}}/>
								</div>
								<div className="start">
									<p className="text-start m-0">[x date]</p>
									<small>loan issued</small>
								</div>
							    <div className="end">
									<p className="text-end m-0">[x date]</p>
									<small>due date</small>
								</div>
							</div>
						</div>
						{props.type =="borrower" &&
						<PopupTransaction
						btnClass="btn btn-primary btn-lg mt-5"
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