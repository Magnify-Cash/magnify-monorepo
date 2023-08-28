import { useState, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { NFTInfo } from "@nftylabs/nft-lists";
import { TokenInfo } from "@uniswap/token-lists";

/*
Component Props
*/
export interface BaseListProps {
  nft?: boolean;
  token?: boolean;
  modalId: string;
  urls: Array<string>;
  onClick?: Function;
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
  keywords: Array<string>;
  logoURI: string;
  name: string;
  timestamp: number;
  version: object;
}
export interface ITokenListItem {
  parent: IParent;
  token: TokenInfo;
}
export interface INFTListItem {
  parent: IParent;
  nft: NFTInfo;
}

/*
PopupTokenList Component
*/
export const PopupTokenList = (props: PopupTokenListProps) => {
  // Handle TokenList Logic
  const [searchQuery, setSearchQuery] = useState("");
  const [tokenLists, setTokenLists] = useState(Array<ITokenListItem>);
  const [nftLists, setNftLists] = useState(Array<INFTListItem>);

  async function fetchListData() {
    try {
      // get list data
      let combinedLists;
      const responses = await Promise.all(
        props.urls.map(async (url) => {
          const response = await fetch(url);
          return response.json();
        })
      );
      const jsonData = responses.map((response) => response);
      if (props.nft) {
        combinedLists = jsonData.flatMap((parentObj) => {
          return parentObj.nfts.map((nft: NFTInfo) => ({
            provider: {
              keywords: parentObj.keywords,
              logoURI: parentObj.logoURI,
              name: parentObj.name,
              timestamp: parentObj.timestamp,
              version: parentObj.version,
            },
            nft,
          }));
        });
        combinedLists.sort((a: INFTListItem, b: INFTListItem) => {
          return a.nft.name.localeCompare(b.nft.name);
        });
      }
      if (props.token) {
        combinedLists = jsonData.flatMap((parentObj) => {
          return parentObj.tokens.map((token: TokenInfo) => ({
            provider: {
              keywords: parentObj.keywords,
              logoURI: parentObj.logoURI,
              name: parentObj.name,
              timestamp: parentObj.timestamp,
              version: parentObj.version,
            },
            token,
          }));
        });
        combinedLists.sort((a: ITokenListItem, b: ITokenListItem) => {
          return a.token.name.localeCompare(b.token.name);
        });
      }

      // Sort & update list data state
      props.token && setTokenLists(combinedLists);
      props.nft && setNftLists(combinedLists);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  /*
	Fetch list data
	*/
  useEffect(() => {
    // If production environment, fetch list data
    if (import.meta.env.PROD) {
      fetchListData();
      return;
    }

    // If local environment, use hardcoded list
    const fetchLocalTokens = async () => {
      const response = await import("../../../deployments.json");
      const data = response.default;

      const tokenLists = [
        {
          token: {
            address: data.usdc.address,
            chainId: 31337,
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
            name: "USD Coin",
            symbol: "USDC",
          },
        },
        {
          token: {
            address: data.dai.address,
            chainId: 31337,
            decimals: 18,
            logoURI:
              "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
            name: "Dai Stablecoin",
            symbol: "DAI",
          },
        },
      ];
      const nftLists = [
        {
          nft: {
            address: data.doodles.address,
            chainId: 31337,
            logoURI:
              "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ",
            name: "Doodles",
            symbol: "DOODLES",
          },
        },
        {
          nft: {
            address: data.punks.address,
            chainId: 31337,
            logoURI:
              "https://i.seadn.io/gcs/files/498c0d117d7f1c95993804b7712721c7.png",
            name: "PolygonPunks",
            symbol: "ρ",
          },
        },
      ];

      // @ts-expect-error
      props.token && setTokenLists(tokenLists);
      // @ts-expect-error
      props.nft && setNftLists(nftLists);
    };

    if (import.meta.env.DEV) {
      fetchLocalTokens();
    }

    props.token &&
      setTokenLists([
        {
          parent: {
            keywords: ["nftylabs", "nftylabs"],
            logoURI:
              "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json",
            name: "NFTY Labs",
            timestamp: 1627987200,
            version: {
              major: 1,
              minor: 0,
              patch: 0,
            },
          },
          token: {
            address: "0x0d4c98901563ca730332e841edb7f8d5c2e9c6d2",
            chainId: 1,
            decimals: 18,
            logoURI:
              "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json",
            name: "NFTY",
            symbol: "NFTY",
          },
        },
      ]);
  }, []);

  /*
	Handle Data Filtering
	*/
  const filteredTokens = useMemo(() => {
    if (tokenLists.length > 0) {
      return tokenLists.filter(
        (item: ITokenListItem) =>
          item.token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.token.address.includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [tokenLists, searchQuery]);

  const filteredNfts = useMemo(() => {
    if (nftLists.length > 0) {
      return nftLists.filter(
        (item: INFTListItem) =>
          item.nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nft.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nft.address.includes(searchQuery.toLowerCase())
      );
    }
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
  });

  /*
	On Click Callback
	*/
  function onClickCallback(e) {
    props.onClick && props.onClick(e.target.value);

    // hide modal
    var el = document.getElementById(props.modalId);
    if (el) {
      var modal = window.bootstrap.Modal.getInstance(el);
      modal && modal.hide();
    }

    // set hidden input
    if (props.nft) {
      let inpt = document.getElementById("hiddenInputNft") as HTMLInputElement;
      inpt.value = e.target.value;
    }
    if (props.token) {
      let inpt = document.getElementById(
        "hiddenInputToken"
      ) as HTMLInputElement;
      inpt.value = e.target.value;
    }
  }

  /*
	Return
	*/
  return (
    <>
      {/* ERC20 Modal */}
      <div
        className="modal"
        id={props.modalId}
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-center">
                {props.token && "Select Token"}
                {props.nft && "Select NFT Collection"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Search bar */}
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* List */}
              <div
                ref={parentRef}
                style={{
                  height: `400px`,
                  overflow: "auto", // Make it scroll!
                }}
              >
                {/* The large inner element to hold all of the items */}
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {/* Only the visible items in the virtualizer, manually positioned to be in view */}
                  {props.token &&
                    rowVirtualizer.getVirtualItems().map((virtualItem) => (
                      <button
                        key={
                          virtualItem.index +
                          filteredTokens[virtualItem.index].token.address
                        }
                        onClick={(e) => onClickCallback(e)}
                        value={JSON.stringify(
                          filteredTokens[virtualItem.index]
                        )}
                        className="btn"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <img
                          src={filteredTokens[virtualItem.index].token.logoURI}
                          alt={`${
                            filteredTokens[virtualItem.index].token.name
                          } Logo`}
                          height="100%"
                        />
                        {filteredTokens[virtualItem.index].token.name}
                      </button>
                    ))}
                  {props.nft &&
                    rowVirtualizer.getVirtualItems().map((virtualItem) => (
                      <button
                        key={
                          virtualItem.index +
                          filteredNfts[virtualItem.index].nft.address
                        }
                        onClick={(e) => onClickCallback(e)}
                        value={JSON.stringify(filteredNfts[virtualItem.index])}
                        className="btn"
                        type="button"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <img
                          src={filteredNfts[virtualItem.index].nft.logoURI}
                          alt={`${
                            filteredNfts[virtualItem.index].nft.name
                          } Logo`}
                          height="100%"
                        />
                        {filteredNfts[virtualItem.index].nft.name}
                      </button>
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
      {props.token && (
        <input id="hiddenInputToken" name="hiddenInputToken" type="hidden" />
      )}
      {props.nft && (
        <input id="hiddenInputNft" name="hiddenInputNft" type="hidden" />
      )}
    </>
  );
};
