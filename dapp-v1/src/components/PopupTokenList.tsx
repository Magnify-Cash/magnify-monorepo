import { useToastContext } from "@/helpers/CreateToast";
import { formatAddress } from "@/helpers/formatAddress";
import { getTokenListUrls } from "@/helpers/tokenUrls";
import type { NFTInfo } from "@nftylabs/nft-lists";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { TokenInfo } from "@uniswap/token-lists";
import {
  type ButtonHTMLAttributes,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isAddress } from "viem";
import { useChainId } from "wagmi";

/*
Component Props
*/
export interface BaseListProps {
  nft?: boolean;
  token?: boolean;
  modalId: string;
  urls: Array<string>;
}
export interface NFTListProps extends BaseListProps {
  nft: boolean;
  token?: never;
  onClick?: Dispatch<SetStateAction<INFTListItem | null | undefined>>;
}
export interface TokenListProps extends BaseListProps {
  nft?: never;
  token: boolean;
  onClick?: Dispatch<SetStateAction<ITokenListItem | null | undefined>>;
}
type PopupTokenListProps = NFTListProps | TokenListProps;

interface CustomSelectButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  data?: any;
  children?: ReactNode;
  clickFunction?: (data: any) => void;
}

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
  parent?: IParent;
  nft: NFTInfo;
}

/*
PopupTokenList Component
*/
export const PopupTokenList = (props: PopupTokenListProps) => {
  const chainId = useChainId();
  const { addToast, closeToast } = useToastContext();

  // Handle TokenList Logic
  const [searchQuery, setSearchQuery] = useState("");
  const [tokenLists, setTokenLists] = useState(Array<ITokenListItem>);
  const [nftLists, setNftLists] = useState(Array<INFTListItem>);

  async function fetchListData() {
    const urls = getTokenListUrls(chainId, props.nft, props.token) || [];
    try {
      // get list data
      const responses = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          return response.json();
        }),
      );
      const jsonData = responses.map((response) => response);
      if (props.nft) {
        const combinedLists = jsonData.flatMap((parentObj) => {
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
        setNftLists(combinedLists);
      }
      if (props.token) {
        const combinedLists = jsonData.flatMap((parentObj) => {
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
        setTokenLists(combinedLists);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  /*
	Fetch list data
	*/
  useEffect(() => {
    fetchListData();
  }, [chainId]);

  /*
	Handle Data Filtering
	*/

  // Helper function to check if a field includes the search query
  const includesQuery = (field: string) =>
    field.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredTokens = useMemo(() => {
    if (tokenLists.length > 0) {
      return tokenLists.filter(
        (item: ITokenListItem) =>
          includesQuery(item.token.name) ||
          includesQuery(item.token.symbol) ||
          includesQuery(item.token.address),
      );
    }
    return [];
  }, [tokenLists, searchQuery]);

  const filteredNfts = useMemo(() => {
    if (nftLists.length > 0) {
      return nftLists.filter(
        (item: INFTListItem) =>
          includesQuery(item.nft.name) ||
          includesQuery(item.nft.symbol) ||
          includesQuery(item.nft.address),
      );
    }
    return [];
  }, [nftLists, searchQuery]);

  /*
	Handle TokenList virtualization
	*/
  const parentRef = useRef<HTMLInputElement>(null);
  const filteredItemsCount = props.token ? filteredTokens.length : filteredNfts.length;
  const rowVirtualizer = useVirtualizer({
    count: filteredItemsCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  /*
	On Click Callback
	*/
  function onClickCallback(data) {
    props.onClick?.(data);

    // hide modal
    const el = document.getElementById(props.modalId);
    if (el) {
      window.bootstrap.Modal.getInstance(el)?.hide();
    }
  }

  /*
	handle custom token selection
	*/
  function handleCustomTokenSelection(data: string) {
    // validate address
    if (!isAddress(data)) {
      addToast("Invalid address", "Please enter a valid address", "error");
      return;
    }
    if (props.nft) {
      const selectedCustomNFT = {
        nft: {
          name: formatAddress(data),
          address: data,
          chainId,
          logoURI: "https://via.placeholder.com/150",
          symbol: "Custom NFT",
        },
      } as any;

      props.onClick?.(selectedCustomNFT);
    }
    if (props.token) {
      const selectedCustomToken = {
        token: {
          name: formatAddress(data),
          address: data,
          chainId,
          decimals: 18,
          logoURI: "https://via.placeholder.com/150",
          symbol: "CUSTOM",
        },
      } as any;
      props.onClick?.(selectedCustomToken);
    }

    // hide modal
    const el = document.getElementById(props.modalId);
    if (el) {
      window.bootstrap.Modal.getInstance(el)?.hide();
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
              <h5 className="modal-title text-center fs-4 fw-medium">
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
                className="form-control form-control-lg py-2 flex-grow-1"
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
                <div className="mt-2">
                  {/* Only the visible items in the virtualizer, manually positioned to be in view */}
                  {props.token &&
                    rowVirtualizer.getVirtualItems().map((virtualItem) => (
                      <SelectButton
                        key={
                          virtualItem.index +
                          filteredTokens[virtualItem.index].token.address
                        }
                        clickFunction={onClickCallback}
                        data={filteredTokens[virtualItem.index]}
                        className="btn d-flex align-items-center justify-content-start w-100 p-2 border-0 rounded-0 focus-ring"
                      >
                        <img
                          className="d-block w-auto me-2 rounded"
                          src={filteredTokens[virtualItem.index].token.logoURI}
                          alt={`${filteredTokens[virtualItem.index].token.name} Logo`}
                          height="48px"
                        />
                        <div className="text-start">
                          <div>{filteredTokens[virtualItem.index].token.name}</div>
                          <div className="text-body-secondary fw-normal">
                            <small>
                              {filteredTokens[virtualItem.index].token.symbol}
                            </small>
                          </div>
                        </div>
                      </SelectButton>
                    ))}
                  {props.nft &&
                    rowVirtualizer.getVirtualItems().map((virtualItem) => (
                      <SelectButton
                        key={
                          virtualItem.index +
                          filteredNfts[virtualItem.index].nft.address
                        }
                        clickFunction={onClickCallback}
                        data={filteredNfts[virtualItem.index]}
                        className="btn d-flex align-items-center justify-content-start w-100 p-2 border-0 rounded-0 focus-ring"
                        type="button"
                      >
                        <img
                          className="d-block w-auto me-2 rounded"
                          src={filteredNfts[virtualItem.index].nft.logoURI}
                          alt={`${filteredNfts[virtualItem.index].nft.name} Logo`}
                          height="48px"
                        />
                        <div className="text-start">
                          <div>{filteredNfts[virtualItem.index].nft.name}</div>
                          <div className="text-body-secondary fw-normal">
                            <small>{filteredNfts[virtualItem.index].nft.symbol}</small>
                          </div>
                        </div>
                      </SelectButton>
                    ))}
                  {!filteredItemsCount && (
                    <CustomTokenSelectionButton
                      data={searchQuery}
                      clickFunction={handleCustomTokenSelection}
                      className="btn d-flex align-items-center justify-content-start w-100 p-2 border-0 rounded-0 focus-ring"
                      type="button"
                    >
                      <div className="text-start">
                        <div>
                          {props.nft
                            ? "Use Custom NFT"
                            : props.token
                              ? "Use Custom Token"
                              : null}
                        </div>
                        <div className="text-body-secondary fw-normal">
                          <small>{searchQuery}</small>
                        </div>
                      </div>
                    </CustomTokenSelectionButton>
                  )}
                </div>
              </div>
              {/* End List */}
            </div>
          </div>
        </div>
      </div>
      {/* End NFT modal */}
    </>
  );
};

//SelectButton is used for selecting a token or an nft from a dropdown list of tokens and nfts.
//It returns a button whose onClick function is set as clickFunction(data).
//ClickFunction and data are props for SelectButton component which can be supplied as needed.

const SelectButton: React.FC<CustomSelectButton> = ({
  data,
  children,
  clickFunction,
  ...buttonProps
}) => {
  return (
    <button onClick={() => clickFunction?.(data)} {...buttonProps}>
      {children}
    </button>
  );
};

//CustomTokenSelectionButton is used for selecting a custom token or an nft which is not present in the dropdown list of tokens and nfts.

const CustomTokenSelectionButton = ({
  data,
  children,
  clickFunction,
  ...buttonProps
}) => {
  return (
    <button onClick={() => clickFunction?.(data)} {...buttonProps}>
      {children}
    </button>
  );
};
