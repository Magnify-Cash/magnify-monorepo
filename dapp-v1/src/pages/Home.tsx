export const Home = (props:any) => {
	return (
		<div className="mt-4 mb-3">
			<div className="row">
				<div className="col-lg-4 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body d-flex flex-column align-items-center justify-content-center">
							<i className="fas fa-piggy-bank text-primary-emphasis display-1"></i>
							<h6 className="m-3">Borrow</h6>
							<p>Lorem ipsum...</p>
							<a href="#">Call to action...</a>
						</div>
					</div>
				</div>
				<div className="col-lg-4 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body d-flex flex-column align-items-center justify-content-center">
							<i className="fas fa-piggy-bank text-primary-emphasis display-1"></i>
							<h6 className="m-3">Lend</h6>
							<p>Lorem ipsum...</p>
							<a href="#">Call to action...</a>
						</div>
					</div>
				</div>
				<div className="col-lg-4 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body d-flex flex-column align-items-center justify-content-center">
							<i className="fas fa-piggy-bank text-primary-emphasis display-1"></i>
							<h6 className="m-3">Stake</h6>
							<p>Lorem ipsum...</p>
							<a href="#">Call to action...</a>
						</div>
					</div>
				</div>
			</div>
			<div className="row mt-3">
				<div className="col-12 d-lg-flex flex-lg-column align-self-lg-stretch">
					<div className="card shadow border-0 rounded-4 shadow-sm overflow-hidden flex-grow-1">
						<div className="card-body row">
							<div className="col-3">test</div>
							<div className="col-3">test</div>
							<div className="col-3">test</div>
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
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Test</td>
							<td>Test</td>
							<td>Test</td>
							<td>Test</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}