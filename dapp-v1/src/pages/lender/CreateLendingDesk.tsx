export const CreateLendingDesk = (props:any) => {
	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
		{/* Start Content */}
		<div className="row g-3 g-xl-4">
			<div className="col-md-9">
				<div className="row g-4 g-xl-5">
					<div className="col-12">
						<div className="card border-0 shadow rounded-4 h-100">
							<div className="card-body row">
								<div className="col-8">
									<p className="text-primary">Choose Currency</p>
									<select className="w-100" name="currency" id="currency">
										<option value="Option">Option</option>
										<option value="Option">Option</option>
										<option value="Option">Option</option>
										<option value="Option">Option</option>
										<option value="Option">Option</option>
									</select>
								</div>
								<div className="text-priamry col-4">
									<p>Top currencies</p>
									<button>USDC</button>
									<button>USDC</button>
									<button>USDC</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="row g-4 g-xl-5 mt-2">
					<div className="col-12">
						<div className="card border-0 shadow rounded-4 h-100">
							<div className="card-body">
								<div>
									<p className="text-primary">Choose Collection(s) & Paramaters</p>
									<select className="w-100" name="currency" id="currency">
										<option value="Option">Option</option>
										<option value="Option">Option</option>
										<option value="Option">Option</option>
										<option value="Option">Option</option>
										<option value="Option">Option</option>
									</select>
								</div>
								<div className="row">
									<p className="mt-2 mb-0">Loan Value</p>
									<div className="col-6">Min Offer</div>
									<div className="col-6">Max Offer</div>
								</div>
								<div className="row">
									<p className="mt-2 mb-0">Loan Duration</p>
									<div className="col-6">Min Duration</div>
									<div className="col-6">Max Duration</div>
								</div>
								<div className="row">
									<p className="mt-2 mb-0">Loan Interest Rate</p>
									<div className="col-6">Min Interest Rate</div>
									<div className="col-6">Max Interest Rate</div>
								</div>
								<button className="btn btn-primary ms-auto">
									Add to Desk
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-md-3">
				<div className="card border-0 shadow rounded-4 h-100">
					<div className="card-body">
						<img width="100%" src="/images/theme/thinking_guy.svg" alt="Thinking..."/>
					</div>
				</div>
				<button className="btn btn-primary mt-2">
					Finalize Lending Desk
				</button>
			</div>
		</div>


		{/* End Content */}
		</div>
	)
}
