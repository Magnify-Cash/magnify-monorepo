import { useState, useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import axios from 'axios';

/*
Component Props
*/
export interface IBaseTokenList {
	nft?:boolean
	token?:boolean
	id:string
	urls:Array<string>
	onClick?:Function
}
export interface INFTTokenList extends IBaseTokenList {
  nft: boolean;
  token?: never;
}
export interface ITokenTokenList extends IBaseTokenList {
  nft?: never;
  token: boolean;
}
type ITokenList = INFTTokenList | ITokenTokenList;

/*
TokenList Props - Fungible
*/
export interface IProvider {
	keywords: Array<string>
	logoURI: string
	name: string
	timestamp: number,
	version: object
}

export interface IToken {
	address: string
	chainId: number
	decimals: number
	logoURI: string
	name: string
	symbol: string
}
export interface ITokenListItem {
	parent: IProvider
	token: IToken
}

/*
TokenList Props - NonFungible
*/
export interface INFT {
	address: string
	chainId: number
	decimals: number
	logoURI: string
	name: string
	symbol: string
}
export interface INFTListItem {
	parent: IProvider
	nft: INFT
}

export const PopupTokenList = (props:ITokenList) => {
	/*
	Handle TokenList Logic
	*/
	const [searchQuery, setSearchQuery] = useState('');
	const [tokenLists, setTokenLists] = useState(Array<ITokenListItem>);

	// Token (ERC-20) Fetch
	async function fetchTokenData() {
	  try {
		// get responses
		const responses = await Promise.all(props.urls.map(url => axios.get(url)));
		const jsonData = responses.map(response => response.data);
		// format responses
		const combinedArray = jsonData.flatMap(parentObj => {
		  return parentObj.tokens.map((token:IToken) => ({
			provider: {
			  keywords: parentObj.keywords,
			  logoURI: parentObj.logoURI,
			  name: parentObj.name,
			  timestamp: parentObj.timestamp,
			  version: parentObj.version
			},
			token
		  }));
		})
		.sort((a, b) => {
			return a.token.name.localeCompare(b.token.name)
		});
		setTokenLists(combinedArray);
	} catch (error) {
			console.error('Error fetching data:', error);
		  }
	}

	// Fetch data
	useEffect(() => {
		props.nft && fetchTokenData();
		props.token && fetchTokenData();
	}, []);

	const filteredData = useMemo(() => {
		// Filter data based on searchQuery
		return tokenLists.filter((item:ITokenListItem) =>
		  item.token.name.toLowerCase().includes(searchQuery.toLowerCase())
		  ||
		  item.token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
		  ||
		  item.token.address.includes(searchQuery.toLowerCase())
		);
	  }, [tokenLists, searchQuery]);

	/*
	Handle TokenList virtualization
	*/
	const parentRef = useRef<HTMLInputElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: filteredData.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 50,
	})

	/*
	On Click Callback
	*/
	function onClickCallback(e){
		props.onClick && props.onClick(e.target.value)

		// hide modal
		var el = document.getElementById(props.id)
		if (el){
			var modal = window.bootstrap.Modal.getInstance(el)
			modal && modal.hide();
		}
	}

	return (
		<>
		{/* ERC20 Modal */}
		<div className="modal" id={props.id} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
		  <div className="modal-dialog modal-dialog-centered">
			<div className="modal-content">
			  <div className="modal-header">
				<h5 className="modal-title text-center">
				{props.token && "Select Token"}
				{props.nft && "Select NFT Collection"}
				</h5>
				<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			  </div>
			  <div className="modal-body">
				{/* Search bar */}
				<input
				  type="text"
				  className="form-control"
				  placeholder="Search..."
				  value={searchQuery}
				  onChange={e => setSearchQuery(e.target.value)}
				/>

				{/* List */}
				<div
					ref={parentRef}
					style={{
					  height: `400px`,
					  overflow: 'auto', // Make it scroll!
					}}
				  >
					{/* The large inner element to hold all of the items */}
					<div
					  style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					  }}
					>
					  {/* Only the visible items in the virtualizer, manually positioned to be in view */}
					  {rowVirtualizer.getVirtualItems().map((virtualItem) => (
						<button
						  key={virtualItem.index + filteredData[virtualItem.index].token.address}
						  onClick={(e) => onClickCallback(e)}
						  value={JSON.stringify(filteredData[virtualItem.index])}
						  className="btn"
						  style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: `${virtualItem.size}px`,
							transform: `translateY(${virtualItem.start}px)`,
						  }}
						>
						<img src={filteredData[virtualItem.index].token.logoURI} alt={`${filteredData[virtualItem.index].token.name} Logo`}/>
						  {filteredData[virtualItem.index].token.name}
						</button >
					  ))}
					</div>
				  </div>
				{/* End List */}
			  </div>
			</div>
		  </div>
		</div>
		{/* End NFT modal */}
		</>
	)
}

// TODO
/*
1. Add uniswap typing where relevant
*/