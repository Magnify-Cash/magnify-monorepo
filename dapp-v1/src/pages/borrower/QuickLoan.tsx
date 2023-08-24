import { useState } from "react";
import { PopupTokenList, PopupTransaction} from "@/components";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";

interface IQuickLoanForm {
loan_duration: string
loan_amount: string
loan_nft: any
}

export const QuickLoan = (props:any) => {
	// tokenlist state management
	const [token, _setToken] = useState<ITokenListItem|null>();
	const [nftCollection, _setNftCollection] = useState<INFTListItem|null>();
	const setToken = (e:string) => _setToken(JSON.parse(e));
	const setNftCollection = (e:string) => _setNftCollection(JSON.parse(e));

	// modal submit
	function handleModalSubmit(){
		const form = document.getElementById("quickLoanForm") as HTMLFormElement;
		const isValid = form.checkValidity();
		if (!isValid) {
		form.reportValidity();
		return;
		}
		const formData = new FormData(form);
		const formJson:IQuickLoanForm = {} as IQuickLoanForm;
		formData.forEach((value, key) => {
			if (key === 'hidden_input_nft' || key === 'hidden_input_token') {
			  try {
				formJson[key] = JSON.parse(value as string);
			  } catch (error) {
				console.error(`Error parsing JSON for key '${key}':`, error);
			  }
			} else {
			  formJson[key] = value;
			}
		  });
		console.log({
			'token': token,
			'nftCollection': nftCollection,
			'form data': formJson
		})
		console.log('wagmi function with above data.....')
	}

	return (
		<div className="container-md px-3 px-sm-4 px-xl-5">
			{/* Start Container */}
			<div className="row g-5">
				<div className="col-lg-4">
					<div className="card border-0 bg-primary shadow rounded-4">
						<div className="card-body">
							Choose NFT
						</div>
					</div>
					<div className="card border-0 shadow rounded-4 h-100">
						<div className="card-body">
							<div className="form-select w-100 btn btn-secondary" id="currency" data-bs-toggle="modal" data-bs-target="#nftModal">
								{nftCollection
									? <div className="d-flex align-items-center">
										<img src={nftCollection.nft.logoURI} alt={`${nftCollection.nft.name} Logo`} height="20" width="20"/>
										<p className="m-0 ms-1">{nftCollection.nft.name}</p>
									</div>
									: "Choose NFT Collection..."
								}
							</div>
							<PopupTokenList
								nft
								urls={[
									"https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json"
								]}
								modalId="nftModal"
								onClick={setNftCollection}
							/>
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					<div className="card border-0 bg-primary shadow rounded-4">
						<div className="card-body">
							Choose Currency
						</div>
					</div>
					<div className="card border-0 shadow rounded-4 h-100">
						<div className="card-body">
							{nftCollection
								?
								<div>
									<div className="form-select w-100 btn btn-secondary" id="currency" data-bs-toggle="modal" data-bs-target="#tokenModal">
										{token
											?
											<div className="d-flex align-items-center">
												<img src={token.token.logoURI} alt={`${token.token.name} Logo`} height="20" width="20"/>
												<p className="m-0 ms-1">{token.token.name}</p>
											</div>
											: "Choose Currency..."
										}
									</div>
									<PopupTokenList
										token
										urls={[
											"https://tokens.coingecko.com/uniswap/all.json",
										]}
										modalId="tokenModal"
										onClick={setToken}
									/>
								</div>
								:
								<div>
								<img height="200" width="100%" src="/theme/images/thinking_guy.svg" alt="Thinking..."/>
								<p className="text-center">Select an NFT collection to see currencies...</p>
								</div>
							}
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					<div className="card border-0 bg-primary shadow rounded-4">
						<div className="card-body">
							Select Offer
						</div>
					</div>
					<div className="card border-0 shadow rounded-4 h-100">
						<div className="card-body">
							<img height="200" width="100%" src="/theme/images/thinking_guy.svg" alt="Thinking..."/>
							<p className="text-center">Select currency & NFT to see offers...</p>
						</div>
					</div>
				</div>
				<PopupTransaction
					divClass="col-12 d-flex"
					btnClass="btn btn-primary btn-lg mt-2 mb-4 ms-auto"
					btnText="Get Loan"
					modalId="txModal"
					modalBtnText="Get Loan"
					modalFunc={(e) => handleModalSubmit()}
					modalTitle="Request Loan"
					modalContent={
						<div>
							<form id="quickLoanForm">
							<small>Loan Details</small>
							<div className="row g-4">
								<div className="col-6 bg-secondary">
									<h6>[collection]</h6>
									<small>NFT Collection</small>
								</div>
								<div className="col-6 bg-secondary">
									<h6>[x]-[x] [currency]</h6>
									<small>min/max offer</small>
								</div>
								<div className="col-6 bg-secondary">
									<h6>[x]-[x] [days]</h6>
									<small>min/max duration</small>
								</div>
								<div className="col-6 bg-secondary">
									<h6>[x]-[x] %</h6>
									<small>min/max interest</small>
								</div>
								<div className="col-12">
									<small>Select NFT</small>
									<div>
										<input name="loan_nft"/>
									</div>
								</div>
								<div className="col-12">
									<small>Select Duration</small>
									<div>
										<input name="loan_duration"/>
									</div>
								</div>
								<div className="col-12">
									<small>Select Amount</small>
									<div>
										<input name="loan_amount"/>
									</div>
								</div>
							</div>
							<hr/>
							<div className="col-12">
								<small>Loan Overview</small>
								<div>
									<p>[NFT #ID]</p>
									<ul>
										<li>Duration:</li>
										<li>Interest Rate:</li>
										<li>Requested Amount:</li>
										<li>2% Loan Origination Fee:</li>
									</ul>
								</div>
							</div>
							<hr/>
							<div className="col-12 d-flex justify-content-between">
								<p>Gross Amount</p>
								<h2 className="text-primary">[amount]</h2>
							</div>
							</form>
						</div>
					}
				/>
			</div>

			{/* End Container*/}
		</div>
	)
}
