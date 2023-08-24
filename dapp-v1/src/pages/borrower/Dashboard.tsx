import { useState } from "react";
import { PopupTransaction, LoanCard } from "@/components";


export const Dashboard = (props:any) => {
	const [payBackAmount, setPayBackAmount] = useState("0");

	// modal submit
	function handleModalSubmit(loanID:number){
		console.log("loanID", loanID)
		console.log('payBackAmount', payBackAmount)
	}

	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
			<div className="d-lg-flex align-items-center">
				<ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
				  <li className="nav-item" role="presentation">
					<button className="nav-link active" id="pills-active-tab" data-bs-toggle="pill" data-bs-target="#pills-active" type="button" role="tab" aria-controls="pills-active" aria-selected="true">Active Loans</button>
				  </li>
				  <li className="nav-item" role="presentation">
					<button className="nav-link" id="pills-completed-tab" data-bs-toggle="pill" data-bs-target="#pills-completed" type="button" role="tab" aria-controls="pills-completed" aria-selected="false">Completed Loans</button>
				  </li>
				  <li className="nav-item" role="presentation">
					  <button className="nav-link" id="pills-defaulted-tab" data-bs-toggle="pill" data-bs-target="#pills-defaulted" type="button" role="tab" aria-controls="pills-defaulted" aria-selected="false">Defaulted Loans</button>
					</li>
				</ul>

			</div>

			<div className="tab-content" id="pills-tabContent">
				{/* active Row */}
			    <div className="tab-pane fade show active" id="pills-active" role="tabpanel" aria-labelledby="pills-active-tab">
				<div className="row g-4 g-xl-5">
					<LoanCard
					popupTx={
						<PopupTransaction
						btnClass="btn btn-primary btn-lg mt-4"
						btnText="Pay Back"
						modalId="txModal"
						modalBtnText="Pay Now"
						modalFunc={() => handleModalSubmit(1)}
						modalTitle="Pay Back Loan"
						modalContent={
							<div>
								<small>Loan Details</small>
								<p>Collection Name] #[NFT ID]</p>
								<div className="row g-4">
									<div className="col-6 bg-secondary">
										<h6>[x][currency]</h6>
										<small>original borrow</small>
									</div>
									<div className="col-6 bg-secondary">
										<h6>[x] %</h6>
										<small>interest date</small>
									</div>
									<div className="col-6 bg-secondary">
										<h6>[x] days / [x] days</h6>
										<small>loan duration</small>
									</div>
									<div className="col-6 bg-secondary">
										<h6>[x][currency]</h6>
										<small>amount due on expiry date</small>
									</div>
									<div className="col-12 bg-success">
										<h6>[x][currency]</h6>
										<small>current payoff amount</small>
									</div>
								</div>
								<hr/>
								<p className="text-start">Enter Amount</p>
								<div className="input-group">
									<input value={payBackAmount} onChange={e => setPayBackAmount(e.target.value)} type="number" className="me-2"/>
									<span>[Currency]</span>
								</div>
							</div>
							}
						/>
					}
					loanInfo={null}
					/>
				</div>
				</div>
				{/* End Active Row */}

				{/* completed Row */}
			    <div className="tab-pane fade" id="pills-completed" role="tabpanel" aria-labelledby="pills-completed-tab">
			  	<div className="row g-4 g-xl-5">
					  <LoanCard
					  loanInfo={null}
					  />
			  	</div>
				</div>
				{/* End completed Row */}

				{/* defaulted Row */}
			    <div className="tab-pane fade" id="pills-defaulted" role="tabpanel" aria-labelledby="pills-defaulted-tab">
				<div className="row g-4 g-xl-5">
					  <LoanCard
					  loanInfo={null}
					  />
			  	</div>
				</div>
				{/* End defaulted Row */}


			</div>

		</div>
	)
}
