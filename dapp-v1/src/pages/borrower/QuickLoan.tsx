import { PopupTokenList } from "@/components";

export const QuickLoan = (props:any) => {
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
								Choose NFT Collection...
							</div>
							<PopupTokenList nft id="nftModal" urls={[]} />
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
							<img height="200" width="100%" src="/theme/images/thinking_guy.svg" alt="Thinking..."/>
							<p className="text-center">Select an NFT collection to see currencies...</p>
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
			</div>

			{/* End Container*/}
		</div>
	)
}
