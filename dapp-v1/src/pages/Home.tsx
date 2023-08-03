export const Home = (props:any) => {
	return (
		<div className="mt-4 mb-3">
			<div className="row g-3">
				<div className="col-lg-4 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body d-flex flex-column align-items-center justify-content-center">
							<i className="fas fa-hand-holding-dollar text-primary-emphasis display-1"></i>
							<h6 className="m-3">Borrow</h6>
							<small className="text-center mb-3">Earn instant liquidity using your NFT as collateral</small>
							<a href="#">Borrow now</a>
						</div>
					</div>
				</div>
				<div className="col-lg-4 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body d-flex flex-column align-items-center justify-content-center">
							<i className="fas fa-piggy-bank text-primary-emphasis display-1"></i>
							<h6 className="m-3">Lend</h6>
							<small className="text-center mb-3">Customize lending desks & issue loans</small>
							<a href="#">Lend now</a>
						</div>
					</div>
				</div>
				<div className="col-lg-4 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body d-flex flex-column align-items-center justify-content-center">
							<i className="fas fa-tent text-primary-emphasis display-1"></i>
							<h6 className="m-3">Stake</h6>
							<small className="text-center mb-3">Stake $NFTY for protocol insurance and governance</small>
							<a href="#">Stake $NFTY</a>
						</div>
					</div>
				</div>
			</div>
			<div className="row my-5">
				<div className="col-12 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body row d-lg-flex justify-content-around g-3">
							<div className="col-lg-3 d-lg-flex align-items-center">
								<i className="fas fa-hexagon-vertical-nft text-primary-emphasis display-5"></i>
								<div className="flex-lg-column align-items-center">
									<p className="m-0 h3">XX</p>
									<p className="m-0">number of Collections</p>
								</div>
							</div>
							<div className="col-lg-3 d-lg-flex align-items-center">
								<i className="fas fa-vault text-primary-emphasis display-5"></i>
								<div className="flex-lg-column align-items-center">
									<p className="m-0 h3">XX</p>
									<p className="m-0">total value locked (TVL)</p>
								</div>
							</div>
							<div className="col-lg-3 d-lg-flex align-items-center">
								<i className="fas fa-sack-dollar text-primary-emphasis display-5"></i>
								<div className="flex-lg-column align-items-center">
									<p className="m-0 h3">XX</p>
									<p className="m-0">total loans</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="table-responsive">
				<table className="table" id="stats-table">
					<thead className="bg-primary-subtle text-primary-emphasis">
						<tr>
							<th>Collection</th>
							<th>Currencies</th>
							<th>Desks</th>
							<th>Utilization</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Test</td>
							<td>Test</td>
							<td>Test</td>
							<td>Test</td>
							<td>
								<button className="btn btn-primary rounded-pill px-4 py-2">
								Find a loan
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}