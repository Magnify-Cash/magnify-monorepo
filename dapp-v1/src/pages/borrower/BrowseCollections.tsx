import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { BrowseCollectionsDocument } from "../../../.graphclient";


export const BrowseCollections = (props:any) => {
	// GraphQL
	const [result] = useQuery({
		query: BrowseCollectionsDocument
	  });

	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">

				{/* Demo Row Card */}
				<div className="row g-4 g-xl-5 justify-content-center">
					<div className="col-sm-6 col-xl-4">
						<div className="card border-0 shadow rounded-4">
							<div className="card-body d-flex">
								<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
									<i className="fa-solid fa-hexagon-vertical-nft h1 m-0"></i>
								</div>
								<div className="mt-3">
									<h5>{result.data?.nftCollections.length}</h5>
									<p className="text-body-secondary">
										Collections Supported
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="col-sm-6 col-xl-4">
						<div className="card border-0 shadow rounded-4">
							<div className="card-body d-flex">
								<div className="specific-w-100 specific-h-100 mx-auto d-flex align-items-center justify-content-center bg-primary-subtle text-primary-emphasis rounded-circle">
									<i className="fa-solid fa-infinity h1 m-0"></i>
								</div>
								<div className="mt-3">
									<h5>{result.data?.erc20S.length}</h5>
									<p className="text-body-secondary">
										Currencies Supported
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
									<th className="py-3 bg-primary-subtle text-primary-emphasis">Currencies</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis">Desks</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">
									</th>
								</tr>
							</thead>
							<tbody>
								{result.data?.nftCollections.map((nftCollection) => {
								const currencies: string[] = nftCollection.loanConfigs.map(
									(x) => x.lendingDesk.erc20.symbol
							  	);
								return (
									<tr className="align-middle">
										<td className="py-3 ps-3">{nftCollection.id}</td>
										<td className="py-3 align-center">{currencies.join(", ")}</td>
										<td className="py-3">{nftCollection.loanConfigs.length}</td>
										<td className="py-3 pe-3">
											<NavLink to={`/explore/${nftCollection.id}`} className="btn btn-primary rounded-pill">Find a Loan</NavLink>
										</td>
									</tr>
								)})}
							</tbody>
						</table>
					</div>
				</div>
				{/* End Table */}

				{/* End Container*/}
		</div>
	)
}
