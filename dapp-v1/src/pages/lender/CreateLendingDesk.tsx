import { useState } from "react";
import { PopupTokenList } from "@/components";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";

export const CreateLendingDesk = (props:any) => {
	// tokenlist state management
	const [token, _setToken] = useState<ITokenListItem|null>();
	const [nftCollection, _setNftCollection] = useState<INFTListItem|null>();
	const setToken = (e:string) => _setToken(JSON.parse(e));
	const setNftCollection = (e:string) => _setNftCollection(JSON.parse(e));

	// Lending Desk Config submit
	function handleConfigSubmit(e) {
		// Prevent the browser from reloading the page
		e.preventDefault();

		// Read the form data
		const form = e.target;
		const formData = new FormData(form);

		// Or you can work with it as a plain object:
		const formJson = Object.fromEntries(formData.entries());
		console.log(formJson);
	}

	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
		{/* Start Content */}
		<div className="row g-3 g-xl-5">
			<div className="col-xl-8">
				<div className="row g-4 g-xl-5">
					<div className="col-6">
						<div className="card border-0 shadow rounded-4 h-100">
							<div className="card-body">
								<div>
									<p className="text-primary fw-bold">Choose Currency</p>
									<div className="form-select w-100 btn btn-secondary" id="currency" data-bs-toggle="modal" data-bs-target="#tokenModal">
										{token
											? token.token.name
											: "Choose Currency..."
										}
									</div>
									<PopupTokenList
										token
										urls={[
											"https://tokens.coingecko.com/uniswap/all.json",
										]}
										id="tokenModal"
										onClick={setToken}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="row g-4 g-xl-5 mt-1">
					<div className="col-12">
						<div className="card border-0 shadow rounded-4 h-100">
							<div className="card-body">
								<form>
								<div>
									<p className="text-primary fw-bold">
										Choose Collection(s) & Paramaters
									</p>
									<div className="form-select w-100 btn btn-secondary" id="currency" data-bs-toggle="modal" data-bs-target="#nftModal">
										{nftCollection
											? nftCollection.nft.name
											: "Choose Currency..."
										}
									</div>
									<PopupTokenList
										nft
										urls={[
											"https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json"
										]}
										id="nftModal"
										onClick={setNftCollection}
									/>
								</div>
								<div className="row mt-4">
									<h6>Loan Value</h6>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Min Offer</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Currency</div>
									</div>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Max Offer</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Currency</div>
									</div>
								</div>
								<div className="row mt-4">
									<h6>Loan Duration</h6>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Min Duration</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Days</div>
									</div>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Max Duration</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Days</div>
									</div>
								</div>
								<div className="row mt-4">
									<h6>Loan Interest Rate</h6>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Min Interest Rate</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Percent (%)</div>
									</div>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Max Interest Rate</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Percent (%)</div>
									</div>
								</div>
								<div className="row">
								<button className="btn btn-primary ms-auto col-4"
								onClick={(e) => handleConfigSubmit(e)}>
									Add to Desk
								</button>
								</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-xl-4">
				<div className="card border-0 shadow rounded-4 h-100">
					<div className="card-body">
						<h6 className="mb-4">Lending Desk Details</h6>
						{token
							?
							<div>
								<p>Currency Type</p>
								<div className="d-flex align-items-center">
									<img src={token.token.logoURI} alt={`${token.token.name} Logo`} height="20" width="20"/>
									<p className="m-0 ms-1">{token.token.name}</p>
								</div>
								<hr/>
							</div>
							:
							<div>
								<img height="200" width="100%" src="/theme/images/thinking_guy.svg" alt="Thinking..."/>
								<p className="text-center">Start customizing to see details...</p>
							</div>
						}
					</div>
				</div>
				<div className="d-flex mb-2 mt-2">
					<button className="btn btn-primary btn-lg mt-2 mb-4 ms-auto">
						Finalize Lending Desk
					</button>
				</div>
			</div>
		</div>

		{/* End Content */}
		</div>
	)
}
