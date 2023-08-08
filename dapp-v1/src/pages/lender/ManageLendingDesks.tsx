import { NavLink } from "react-router-dom";

const LendingDeskCard = () => (
	<div className="card border-0 shadow rounded-4 mt-4 mt-xl-5">
		<div className="card-body py-4">
			<div className="row g-4 g-xl-5">
				<div className="col-12">
					<h3 className="m-0">Lending Desk X</h3>
				</div>
				<div className="col-lg-3">
					<div className="d-flex flex-column align-items-left">
						<div className="mt-3">
							<p className="m-0">Currency Type</p>
							<p className="m-0">VALUE</p>
						</div>
						<div className="mt-3">
							<p className="m-0">Collections</p>
							<p className="m-0">VALUE</p>
						</div>
						<div className="mt-3">
							<p className="m-0">Available Liquidity</p>
							<p className="m-0">VALUE</p>
						</div>
					</div>
				</div>
				<div className="col-lg-3">
					<div className="d-flex flex-column align-items-left">
						<div className="mt-3">
							<p className="m-0">Active Loans</p>
							<p className="m-0">VALUE</p>
						</div>
						<div className="mt-3">
							<p className="m-0">Defaulted Loans</p>
							<p className="m-0">VALUE</p>
						</div>
						<div className="mt-3">
							<p className="m-0">Completed Loans</p>
							<p className="m-0">VALUE</p>
						</div>
					</div>
				</div>
				<div className="col-lg-3">
					<div className="d-flex flex-column align-items-left">
						<div className="mt-3">
							<p className="m-0">Net Liquidity Issued</p>
							<p className="m-0">VALUE</p>
						</div>
						<div className="mt-3">
							<p className="m-0">Net Profit/Revenue</p>
							<p className="m-0">VALUE</p>
						</div>
						<div className="mt-3">
							<p className="m-0">Desk Score</p>
							<p className="m-0">VALUE</p>
						</div>
					</div>
				</div>
				<div className="col-lg-3">
					<button className="col-lg-12">Edit</button>
					<button className="col-lg-12">Withdraw</button>
					<button className="col-lg-12">Deposit</button>
					<button className="col-lg-12">Freeze</button>
				</div>
			</div>
		</div>
	</div>
)

export const ManageLendingDesks = (props:any) => {
	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
			<div className="d-lg-flex align-items-center">
				<ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
				  <li className="nav-item" role="presentation">
					<button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">Active Desks</button>
				  </li>
				  <li className="nav-item" role="presentation">
					<button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Inactive Desks</button>
				  </li>
				</ul>
				<NavLink to="/create-desk" className="btn btn-primary ms-auto">
					Create Lending Desk
				</NavLink>
			</div>

			<div className="tab-content" id="pills-tabContent">
				{/* Active Row */}
			  	<div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
				  <LendingDeskCard/>
				</div>
				{/* End Active Row */}

				{/* Inactive Row */}
			  	<div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
					<LendingDeskCard/>
				</div>
				{/* End Inactive Row */}
			</div>

		</div>
	)
}
