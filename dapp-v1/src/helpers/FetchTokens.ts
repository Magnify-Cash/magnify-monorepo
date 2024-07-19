import { formatAddress } from "./formatAddress";
import { getTokenListUrls } from "./tokenUrls";

interface IJsonData {
  tokens: IToken[];
}

export interface IToken {
  address: string;
  chainId: number;
  logoURI: string;
  name: string;
  symbol: string;
}

//Given an array of addresses, returns an array of token objects in order
const fetchTokenDetails = async (addresses: string[], chainId: number) => {
  let jsonData: IJsonData = { tokens: [] };
  try {
    const urls = getTokenListUrls(chainId, false, true) || [];

    // get list data
    const responses = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        return await response.json();
      }),
    );
    jsonData = { tokens: responses.flatMap((response) => response.tokens) };
  } catch (error: any) {
    console.log("Error fetching and parsing JSON:", error.message);
  }

  //Creating a Map for fast lookup. Here key = address of a token; value = a token object
  const TokenMap: Map<string, IToken> = new Map();
  for (const token of jsonData.tokens) {
    TokenMap.set(token.address.toLowerCase(), token);
  }
  const result = addresses.map(
    // Return object only with name and address property if token is not found
    // This can be the case if the token is a custom token
    (address) =>
      TokenMap.get(address.toLowerCase()) ||
      ({ name: formatAddress(address), address } as IToken),
  );

  return result;
};

export default fetchTokenDetails;

// Function to fetch tokens for a given collection
export const fetchTokensForCollection = async (nftCollection, chainId) => {
  const tokenIdArr = nftCollection?.loanConfigs?.map(
    (loanConfig) => loanConfig.lendingDesk.erc20.id
  );

  if (tokenIdArr?.length) {
    return await fetchTokenDetails(tokenIdArr, chainId);
  }

  return [];
};
