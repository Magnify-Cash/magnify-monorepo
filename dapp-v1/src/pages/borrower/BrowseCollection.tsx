import { NavLink } from "react-router-dom";

export const BrowseCollection = (props) => {
	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
				<p>
					<i className="fa-solid fa-arrow-left me-1"></i>
					<NavLink to="/explore">
						Explore Collections
					</NavLink>
				</p>
				{/* Demo Row Card */}
				<div className="row g-4 g-xl-5 justify-content-center">
					<div className="col-sm-6 col-xl-4">
						<div className="card border-0 shadow rounded-4">
							<div className="card-body d-flex">
								<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
									<i className="fa-solid fa-hexagon-vertical-nft h1 m-0"></i>
								</div>
								<div className="mt-3">
									<h5>[x]</h5>
									<p className="text-body-secondary">
										Number of Collections
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="col-sm-6 col-xl-4">
						<div className="card border-0 shadow rounded-4">
							<div className="card-body d-flex">
								<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
									<i className="fa-solid fa-lock h1 m-0"></i>
								</div>
								<div className="mt-3">
									<h5>[x]</h5>
									<p className="text-body-secondary">
										Total Value Locked
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="col-sm-6 col-xl-4">
						<div className="card border-0 shadow rounded-4">
							<div className="card-body d-flex">
								<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
									<i className="fa-solid fa-sack-dollar h1 m-0"></i>
								</div>
								<div className="mt-3">
									<h5>[x]</h5>
									<p className="text-body-secondary">
										Total Available Liquidity
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* End demo card */}

				{/* Demo table */}
				<div className="card border-0 shadow rounded-4 my-4 my-xl-5 overflow-hidden">
					<div className="table-responsive">
						<table className="table m-0 text-nowrap">
							<thead>
								<tr>
									<th className="py-3 bg-primary-subtle text-primary-emphasis ps-3">Collection</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis">Currency</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis">Desks</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">TAL (USD)</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis pe-3" colSpan={2}>Utilization</th>
								</tr>
							</thead>
							<tbody>
								<tr className="align-middle">
									<td className="py-3 ps-3">Pudgy Penguins</td>
									<td className="py-3 align-center">USD, Tether, etc.</td>
									<td className="py-3">3</td>
									<td className="py-3">$60,000</td>
									<td className="py-3">67%</td>
									<td className="py-3 pe-3">
										<NavLink to="/explore/123" className="btn btn-primary rounded-pill">Find a Loan</NavLink>
									</td>
								</tr>
								<tr className="align-middle">
									<td className="py-3 ps-3">Pudgy Penguins</td>
									<td className="py-3 align-center">USD, Tether, etc.</td>
									<td className="py-3">3</td>
									<td className="py-3">$60,000</td>
									<td className="py-3">67%</td>
									<td className="py-3 pe-3">
										<NavLink to="/explore/123" className="btn btn-primary rounded-pill">Find a Loan</NavLink>
									</td>
								</tr>
								<tr className="align-middle">
									<td className="py-3 ps-3">Pudgy Penguins</td>
									<td className="py-3 align-center">USD, Tether, etc.</td>
									<td className="py-3">3</td>
									<td className="py-3">$60,000</td>
									<td className="py-3">67%</td>
									<td className="py-3 pe-3">
										<NavLink to="/explore/123" className="btn btn-primary rounded-pill">Find a Loan</NavLink>
									</td>
								</tr>
								<tr className="align-middle">
									<td className="py-3 ps-3">Pudgy Penguins</td>
									<td className="py-3 align-center">USD, Tether, etc.</td>
									<td className="py-3">3</td>
									<td className="py-3">$60,000</td>
									<td className="py-3">67%</td>
									<td className="py-3 pe-3">
										<NavLink to="/explore/123" className="btn btn-primary rounded-pill">Find a Loan</NavLink>
									</td>
								</tr>
								<tr className="align-middle">
									<td className="py-3 ps-3">Pudgy Penguins</td>
									<td className="py-3 align-center">USD, Tether, etc.</td>
									<td className="py-3">3</td>
									<td className="py-3">$60,000</td>
									<td className="py-3">67%</td>
									<td className="py-3 pe-3">
										<NavLink to="/explore/123" className="btn btn-primary rounded-pill">Find a Loan</NavLink>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				{/* End Table */}

				{/* End Container*/}
		</div>
	)
}

BrowseCollection.defaultProps = {
  titleElement: <div>hello</div>,
  // ...
};