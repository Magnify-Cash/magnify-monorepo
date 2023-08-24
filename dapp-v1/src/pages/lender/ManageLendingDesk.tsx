import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { PopupTransaction } from "@/components";

export const ManageLendingDesk = (props:any) => {
	var title = document.getElementById("base-title");

	useEffect(() => {
		console.log('hii')
		console.log(title)
		if (title){
			title.innerHTML = `Manage Lending Desk [x]`;
		}
	}, [title])

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
							<div className="col-12">
								<h3 className="m-0">Lending Desk X</h3>
							</div>
							<div className="col-lg-4">
								<div className="d-flex flex-column align-items-left">
									<div className="mt-3">
										<p className="m-0">Currency Type</p>
										<h5 className="m-0">[currency]</h5>
									</div>
								</div>
							</div>
							<div className="col-lg-4">
								<div className="d-flex flex-column align-items-left">
									<div className="mt-3">
										<p className="m-0">Available Liquidity</p>
										<h5 className="m-0">[available]/[total] [currency]</h5>
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
							<p className="text-primary fw-bold">
								Collections
							</p>
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
