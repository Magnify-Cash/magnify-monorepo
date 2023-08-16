import { useState } from "react";
import { PopupTokenList } from "@/components";
import { ITokenListItem } from "@/components/PopupTokenList";
import { INFTListItem } from "@/components/PopupTokenList";

export const QuickLoan = (props:any) => {
	// tokenlist state management
	const [token, _setToken] = useState<ITokenListItem|null>();
	const [nftCollection, _setNftCollection] = useState<INFTListItem|null>();
	const setToken = (e:string) => _setToken(JSON.parse(e));
	const setNftCollection = (e:string) => _setNftCollection(JSON.parse(e));

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
									? nftCollection.nft.name
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
											? token.token.name
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
			</div>

			{/* End Container*/}
		</div>
	)
}
