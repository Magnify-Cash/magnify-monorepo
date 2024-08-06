import { useToastContext } from "@/helpers/CreateToast";
import { formatAddress } from "@/helpers/formatAddress";
import { getTokenListUrls } from "@/helpers/ProtocolDefaults";
import { getBlockExplorerURL } from "@/helpers/ProtocolDefaults";
import type { NFTInfo } from "@magnify-cash/nft-lists";
import type { TokenInfo } from "@uniswap/token-lists";
import {
  type ButtonHTMLAttributes,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FixedSizeList } from "react-window";
import { isAddress } from "viem";
import { useChainId } from "wagmi";

/*
Component Props
*/
export interface BaseListProps {
  nft?: boolean;
  token?: boolean;
  modalId: string;
  restrictTo?: Array<string>;
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
  const explorer = getBlockExplorerURL(chainId);
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
          const response = await fetch(url, {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
          });
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

  // Helper function to check if a field includes the search query
  const includesQuery = (field: string) =>
    field.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredTokens = useMemo(() => {
    if (tokenLists.length > 0) {
      return tokenLists.filter(
        (item: ITokenListItem) =>
          (includesQuery(item.token.name) ||
            includesQuery(item.token.symbol) ||
            includesQuery(item.token.address)) &&
          (props.restrictTo === undefined ||
            props.restrictTo?.includes(item.token.address.toLowerCase())),
      );
    }
    return [];
  }, [tokenLists, searchQuery, props.restrictTo]);

  const filteredNfts = useMemo(() => {
    if (nftLists.length > 0) {
      return nftLists.filter(
        (item: INFTListItem) =>
          (includesQuery(item.nft.name) ||
            includesQuery(item.nft.symbol) ||
            includesQuery(item.nft.address)) &&
          (props.restrictTo === undefined ||
            props.restrictTo?.includes(item.nft.address.toLowerCase())),
      );
    }
    return [];
  }, [nftLists, searchQuery, props.restrictTo]);

  const filteredItemsCount = props.token ? filteredTokens.length : filteredNfts.length;

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
          <div className="modal-content" style={{ maxHeight: "80vh" }}>
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
              />
            </div>
            <div className="px-3 pt-3">
              {/* Search bar */}
              <input
                type="text"
                className="form-control form-control-lg py-2 flex-grow-1"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="modal-body">
              {/* List */}
              <div>
                {props.token && filteredItemsCount > 0 && (
                  <FixedSizeList
                    height={400}
                    itemCount={filteredItemsCount}
                    itemSize={64}
                    width="100%"
                  >
                    {({ index, style }) => {
                      const item = filteredTokens[index];
                      return (
                        <div style={style}>
                          <SelectButton
                            key={item.token.address}
                            clickFunction={onClickCallback}
                            data={item}
                            className="btn d-flex align-items-center justify-content-start w-100 p-2 border-0 rounded-0 focus-ring"
                          >
                            <img
                              className="d-block w-auto me-2 rounded"
                              src={item.token.logoURI}
                              alt={`${item.token.name} Logo`}
                              height="32px"
                              width="32px"
                            />
                            <div className="text-start w-100">
                              <div>{item.token.name}</div>
                              <div className="text-body-secondary fw-normal d-flex">
                                <small>{item.token.symbol}</small>
                                <small className="ms-3">
                                  <a
                                    href={`${explorer}/token/${item.token.address}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {`${item.token.address.slice(
                                      0,
                                      6,
                                    )}...${item.token.address.slice(-6)}`}
                                  </a>
                                </small>
                              </div>
                            </div>
                          </SelectButton>
                        </div>
                      );
                    }}
                  </FixedSizeList>
                )}

                {props.nft && filteredItemsCount > 0 && (
                  <FixedSizeList
                    height={400}
                    itemCount={filteredItemsCount}
                    itemSize={64}
                    width="100%"
                  >
                    {({ index, style }) => {
                      const item = filteredNfts[index];
                      return (
                        <div style={style}>
                          <SelectButton
                            key={item.nft.address}
                            clickFunction={onClickCallback}
                            data={item}
                            className="btn d-flex align-items-center justify-content-start w-100 p-2 border-0 rounded-0 focus-ring"
                          >
                            <img
                              className="d-block w-auto me-2 rounded"
                              src={item.nft.logoURI}
                              alt={`${item.nft.name} Logo`}
                              height="32px"
                              width="32px"
                            />
                            <div className="text-start">
                              <div>{item.nft.name}</div>
                              <div className="text-body-secondary fw-normal d-flex">
                                <small>{item.nft.symbol}</small>
                                <small className="ms-3">
                                  <a
                                    href={`${explorer}/token/${item.nft.address}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {`${item.nft.address.slice(
                                      0,
                                      6,
                                    )}...${item.nft.address.slice(-6)}`}
                                  </a>
                                </small>
                              </div>
                            </div>
                          </SelectButton>
                        </div>
                      );
                    }}
                  </FixedSizeList>
                )}
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
          </div>
          {/* End List */}
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
