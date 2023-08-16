import { useState, useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import axios from 'axios';
import { NFTInfo } from '@nftylabs/nft-lists';
import { TokenInfo } from '@uniswap/token-lists';

/*
Component Props
*/
export interface BaseListProps {
	nft?:boolean
	token?:boolean
	id:string
	urls:Array<string>
	onClick?:Function
}
export interface NFTListProps extends BaseListProps {
  nft: boolean;
  token?: never;
}
export interface TokenListProps extends BaseListProps {
  nft?: never;
  token: boolean;
}
type PopupTokenListProps = NFTListProps | TokenListProps;

/*
TokenList Props
*/
export interface IParent {
	keywords: Array<string>
	logoURI: string
	name: string
	timestamp: number,
	version: object
}
export interface ITokenListItem {
	parent: IParent
	token: TokenInfo
}
export interface INFTListItem {
	parent: IParent
	nft: NFTInfo
}


/*
PopupTokenList Component
*/
export const PopupTokenList = (props:PopupTokenListProps) => {
	/*
	Handle TokenList Logic
	*/
	const [searchQuery, setSearchQuery] = useState('');
	const [tokenLists, setTokenLists] = useState(Array<ITokenListItem>);
	const [nftLists, setNftLists] = useState(Array<INFTListItem>);

	async function fetchListData() {
	  try {
		// get list data
		let combinedLists;
		const responses = await Promise.all(props.urls.map(url => axios.get(url)));
		const jsonData = responses.map(response => response.data);
		if (props.nft){
			combinedLists = jsonData.flatMap((parentObj) => {
			  return parentObj.nfts.map((nft:NFTInfo) => ({
				provider: {
				  keywords: parentObj.keywords,
				  logoURI: parentObj.logoURI,
				  name: parentObj.name,
				  timestamp: parentObj.timestamp,
				  version: parentObj.version
				},
				nft
			  }));
			})
			combinedLists.sort((a:INFTListItem, b:INFTListItem) => {
				return a.nft.name.localeCompare(b.nft.name)
			});
		}
		if (props.token){
			combinedLists = jsonData.flatMap((parentObj) => {
		  		return parentObj.tokens.map((token:TokenInfo) => ({
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
			combinedLists.sort((a:ITokenListItem, b:ITokenListItem) => {
				return a.token.name.localeCompare(b.token.name)
			});
		}

		// Sort & update list data state
		props.token && setTokenLists(combinedLists);
		props.nft && setNftLists(combinedLists);
	} catch (error) {
		console.error('Error fetching data:', error);
	  }
	}

	/*
	Fetch list data
	*/
	useEffect(() => {
		fetchListData();
	}, []);

	/*
	Handle Data Filtering
	*/
	const filteredTokens = useMemo(() => {
		if (tokenLists.length > 0){
			return tokenLists.filter((item:ITokenListItem) =>
	  		item.token.name.toLowerCase().includes(searchQuery.toLowerCase())
	  		||
	  		item.token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
	  		||
	  		item.token.address.includes(searchQuery.toLowerCase())
		)}
		return [];
	  }, [tokenLists, searchQuery]);

	const filteredNfts = useMemo(() => {
		if (nftLists.length > 0){
			return nftLists.filter((item:INFTListItem) =>
			  item.nft.name.toLowerCase().includes(searchQuery.toLowerCase())
			  ||
			  item.nft.symbol.toLowerCase().includes(searchQuery.toLowerCase())
			  ||
			  item.nft.address.includes(searchQuery.toLowerCase())
		)}
		return [];
	  }, [nftLists, searchQuery]);

	/*
	Handle TokenList virtualization
	*/
	const parentRef = useRef<HTMLInputElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: props.token ? filteredTokens.length : filteredNfts.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 50,
	})

	/*
	On Click Callback
	*/
	function onClickCallback(e){
		props.onClick && props.onClick(e.target.value);

		// hide modal
		var el = document.getElementById(props.id)
		if (el){
			var modal = window.bootstrap.Modal.getInstance(el);
			modal && modal.hide();
		}

		// set hidden input
		if (props.nft){
			let inpt = (document.getElementById("hidden_input_nft") as HTMLInputElement);
			inpt.value = e.target.value;
		}
		if (props.token){
			let inpt = (document.getElementById("hidden_input_token") as HTMLInputElement);
			inpt.value = e.target.value;
		}
	}

	/*
	Return
	*/
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
					  {props.token && rowVirtualizer.getVirtualItems().map((virtualItem) => (
						<button
						  key={virtualItem.index + filteredTokens[virtualItem.index].token.address}
						  onClick={(e) => onClickCallback(e)}
						  value={JSON.stringify(filteredTokens[virtualItem.index])}
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
						<img src={filteredTokens[virtualItem.index].token.logoURI} alt={`${filteredTokens[virtualItem.index].token.name} Logo`}/>
						  {filteredTokens[virtualItem.index].token.name}
						</button >
					  ))}
					  {props.nft && rowVirtualizer.getVirtualItems().map((virtualItem) => (
						  <button
							key={virtualItem.index + filteredNfts[virtualItem.index].nft.address}
							onClick={(e) => onClickCallback(e)}
							value={JSON.stringify(filteredNfts[virtualItem.index])}
							className="btn"
							type="button"
							style={{
							  position: 'absolute',
							  top: 0,
							  left: 0,
							  width: '100%',
							  height: `${virtualItem.size}px`,
							  transform: `translateY(${virtualItem.start}px)`,
							}}
						  >
						  <img src={filteredNfts[virtualItem.index].nft.logoURI} alt={`${filteredNfts[virtualItem.index].nft.name} Logo`}/>
							{filteredNfts[virtualItem.index].nft.name}
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

		{/* Hidden form inputs */}
		{props.token && <input id="hidden_input_token" name="hidden_input_token" type="hidden" />}
		{props.nft && <input id="hidden_input_nft" name="hidden_input_nft" type="hidden" />}
		</>
	)
}