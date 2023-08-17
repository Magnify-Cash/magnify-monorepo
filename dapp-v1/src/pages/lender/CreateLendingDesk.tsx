import { useState } from "react";
import { PopupTokenList, PopupTransaction } from "@/components";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";

interface IConfigForm {
hidden_input_token?:ITokenListItem
hidden_input_nft: INFTListItem
max_duration: string
max_interest: string
max_offer: string
min_duration: string
min_interest: string
min_offer: string
}

export const CreateLendingDesk = (props:any) => {
	// tokenlist state management
	const [token, _setToken] = useState<ITokenListItem|null>();
	const [nftCollection, _setNftCollection] = useState<INFTListItem|null>();
	const [deskConfigs, setDeskConfigs] = useState<Array<IConfigForm>>([]);
	const [deskFundingAmount, setDeskFundingAmount] = useState("");

	const setToken = (e:string) => _setToken(JSON.parse(e));
	const setNftCollection = (e:string) => _setNftCollection(JSON.parse(e));

	// lending desk config submit
	function handleConfigSubmit(e:React.MouseEvent<HTMLButtonElement>) {
	  e.preventDefault();
	  const form = document.getElementById("configForm") as HTMLFormElement;
	  const isValid = form.checkValidity();
	  if (!isValid) {
		form.reportValidity();
		return;
	  }
	  const formData = new FormData(form);
	  const formJson:IConfigForm = {} as IConfigForm;
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
	  setDeskConfigs([...deskConfigs, formJson]);
	}


	// modal submit
	function handleModalSubmit(){
		console.log('token', token)
		console.log('deskConfigs', deskConfigs)
		console.log('deskFundingAmount', deskFundingAmount)
		console.log('wagmi function with above data.....')
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
									<div className="form-select w-100 btn btn-secondary" data-bs-toggle="modal" data-bs-target="#tokenModal">
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
							</div>
						</div>
					</div>
				</div>
				<div className="row g-4 g-xl-5 mt-1">
					<div className="col-12">
						<div className="card border-0 shadow rounded-4 h-100">
							<div className="card-body">
								<form id="configForm">
								<div>
									<p className="text-primary fw-bold">
										Choose Collection(s) & Paramaters
									</p>
									<div className="form-select w-100 btn btn-secondary" data-bs-toggle="modal" data-bs-target="#nftModal">
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
								<div className="row mt-4">
									<h6>Loan Value</h6>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Min Offer</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input min="0" name="min_offer" type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Currency</div>
									</div>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Max Offer</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input min="0" name="max_offer" type="number" className="form-control w-50"/>
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
											<input min="0" name="min_duration" type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Days</div>
									</div>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Max Duration</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input min="0" name="max_duration" type="number" className="form-control w-50"/>
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
											<input min="0" name="min_interest" type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Percent (%)</div>
									</div>
									<div className="col-6 border border-primary rounded">
										<p className="text-center">Max Interest Rate</p>
										<div className="d-flex justify-content-around align-items-center mb-2">
											<span className="btn btn-secondary">-</span>
											<input min="0" name="max_interest" type="number" className="form-control w-50"/>
											<span className="btn btn-secondary">+</span>
										</div>
										<div className="d-flex justify-content-center">Percent (%)</div>
									</div>
								</div>
								<div className="row">
								<button disabled={!nftCollection} className="btn btn-primary ms-auto col-4"
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
								{deskConfigs.map((config, index) => {
									console.log(config)
									return (
										<div key={index}>
										<p>Collection {index}</p>
										<div className="d-flex align-items-center">
											<img src={config.hidden_input_nft.nft?.logoURI} alt={`${config.hidden_input_nft.nft.name} Logo`} height="20" width="20"/>
											<p className="m-0 ms-1">{config.hidden_input_nft.nft.name}</p>
										</div>
										</div>
									)
								})}
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
					<PopupTransaction
						btnClass="btn btn-primary btn-lg mt-2 mb-4 ms-auto"
						btnText="Finalize Lending Desk"
						modalId="txModal"
						modalBtnText="Launch Lending Desk"
						modalFunc={() => handleModalSubmit()}
						modalTitle="Confirm Lending Desk"
						modalContent={
							<div>
								<p>Loan Details</p>
								<div className="d-flex flex-column">
									<div className="mb-2">
										<small className="m-0">Currency Type</small>
										<div className="d-flex">
											<img src={token?.token.logoURI} alt={`${token?.token.name} Logo`} height="20" width="20"/>
											<p className="m-0 ms-1">{token?.token.name}</p>
										</div>
									</div>
									{deskConfigs.map((config, index) => {
										return (
											<div key={index} className="col-12 my-2">
											<small className="m-0">Collection {index + 1}</small>
											<div className="d-flex align-items-center">
												<img src={config?.hidden_input_nft.nft?.logoURI} alt={`${config?.hidden_input_nft.nft.name} Logo`} height="20" width="20"/>
												<p className="m-0 ms-1">{config?.hidden_input_nft.nft.name}</p>
											</div>
											</div>
										)
									})}
								</div>
								<div className="input-group">
								<input value={deskFundingAmount} onChange={e => setDeskFundingAmount(e.target.value)} type="number" className="me-2"/>
								<span>Funding Amount</span>
								</div>
							</div>
						}
					/>
				</div>
			</div>
		</div>

		{/* End Content */}
		</div>
	)
}
