import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "urql";
import { useParams } from 'react-router-dom';
import { PopupTransaction } from "@/components";
import { ManageLendingDeskDocument } from "../../../.graphclient";

export const ManageLendingDesk = (props:any) => {
  	// GraphQL
  	const { id } = useParams();
	const [result] = useQuery({
		query: ManageLendingDeskDocument,
		variables: {
  			deskId: id
		},
  	});

	// Title
	var title = document.getElementById("base-title");
	useEffect(() => {
		if (title && result.data?.lendingDesk){
			title.innerHTML = `Manage Lending Desk ${result.data?.lendingDesk?.id}`;
		}
	}, [result])

	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
				{/* Demo Row */}
				<p>
					<i className="fa-solid fa-arrow-left me-1"></i>
					<NavLink to="/manage-desks">
						 Back to Manage Lending Desks...
					</NavLink>
				</p>
				<div className="card border-0 shadow rounded-4 mt-4 mt-xl-5">
					<div className="card-body py-4">
						<div className="row d-lg-flex align-items-center g-4 g-xl-5">
							<div className="col-12 d-flex justify-content-between">
								<h3 className="m-0">Lending Desk {result.data?.lendingDesk?.id}</h3>
								<div className="form-check form-switch h3">
								  <input className="form-check-input" type="checkbox" role="switch" checked={result.data?.lendingDesk?.status === 'Active'}/>
								</div>
							</div>
							<div className="col-lg-4">
								<div className="d-flex flex-column align-items-left">
									<div className="mt-3">
										<p className="m-0">Currency Type</p>
										<h5 className="m-0">{result.data?.lendingDesk?.erc20.symbol}</h5>
									</div>
								</div>
							</div>
							<div className="col-lg-4">
								<div className="d-flex flex-column align-items-left">
									<div className="mt-3">
										<p className="m-0">Available Liquidity</p>
										<h5 className="m-0">
											{result.data?.lendingDesk?.balance}&nbsp;
											{result.data?.lendingDesk?.erc20.symbol}
										</h5>
									</div>
								</div>
							</div>
							<div className="col-lg-4 d-flex flex-column">
								<PopupTransaction
								btnClass="btn btn-primary btn-lg mt-4"
								btnText="Add Funds"
								modalId="txModal"
								modalBtnText="Add Funds Now"
								modalFunc={() => console.log(1)}
								modalTitle="Add Funds"
								modalContent={<></>}
								/>
								<PopupTransaction
								btnClass="btn btn-primary btn-lg mt-4"
								btnText="Withdraw Funds"
								modalId="txModal2"
								modalBtnText="Withdraw Funds Now"
								modalFunc={() => console.log(1)}
								modalTitle="Withdraw Funds"
								modalContent={<></>}
								/>
							</div>
						</div>
					</div>
				</div>
				{/* End row */}
				<div className="row">
					<div className="col-lg-6">
						<div className="card border-0 shadow rounded-4 mt-4 mt-xl-5">
						<div className="card-body py-4">
							{result.data?.lendingDesk?.loanConfigs.map((config, index) => {
								return (
								  <div key={index}>
									<p>Collection {index+1}</p>
									<div className="d-flex align-items-center">
									  <img
										height="20"
										width="20"
									  />
									  <p className="m-0 ms-1">
										{config.id}
									  </p>
									</div>
									<p><strong>Offer:</strong> {config.minAmount} - {config.maxAmount} {result.data?.lendingDesk?.erc20.symbol}</p>
									<p><strong>Duration:</strong> {config.minDuration} - {config.maxDuration} Days</p>
									<p><strong>Interest:</strong> {config.minInterest} - {config.maxInterest} %</p>
								  </div>
								);
							  })}
							</div>
						</div>
					</div>
					<div className="col-lg-6">
						<div className="card border-0 shadow rounded-4 mt-4 mt-xl-5">
						<div className="card-body py-4">
							<p className="text-primary fw-bold">
								Collection Parameters
							</p>
						</div>
						</div>
					</div>
				</div>

				{/* End Container*/}
		</div>
	)
}
