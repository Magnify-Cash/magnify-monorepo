import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { ExploreCollectionsDocument } from "../../../.graphclient";


export const BrowseCollections = (props:any) => {
	// GraphQL
	const [result] = useQuery({
		query: ExploreCollectionsDocument
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
									<th className="py-3 bg-primary-subtle text-primary-emphasis">Currency</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis">Desks</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis pe-3">TAL (USD)</th>
									<th className="py-3 bg-primary-subtle text-primary-emphasis pe-3" colSpan={2}>Utilization</th>
								</tr>
							</thead>
							<tbody>
								{result.data?.nftCollections.map((collection) =>
								<tr className="align-middle">
									<td className="py-3 ps-3">{collection.id}</td>
									<td className="py-3 align-center">[currencies]</td>
									<td className="py-3">{collection.loanConfigs.length}</td>
									<td className="py-3">[TAL]</td>
									<td className="py-3">[utilization]</td>
									<td className="py-3 pe-3">
										<NavLink to="/explore/123" className="btn btn-primary rounded-pill">Find a Loan</NavLink>
									</td>
								</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
				{/* End Table */}

				{/* End Container*/}
		</div>
	)
}
