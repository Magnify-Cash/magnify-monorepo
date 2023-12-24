import { fetchLocalTokens } from "./LocalData";

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
const fetchTokenDetails = async (addresses: string[]) => {
  const url = "https://tokens.coingecko.com/uniswap/all.json";
  let jsonData: IJsonData = { tokens: [] };
  if (import.meta.env.DEV) {
    jsonData = await fetchLocalTokens();
  } else {
    try {
      const response = await fetch(url);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(
          `Network response was not ok, status: ${response.status}`
        );
      }
      jsonData = await response.json();
    } catch (error: any) {
      console.log("Error fetching and parsing JSON:", error.message);
    }
  }

  //Creating a Map for fast lookup. Here key = address of a token; value = a token object
  const TokenMap: Map<string, IToken> = new Map();

  jsonData.tokens.forEach((token) =>
    TokenMap.set(token.address.toLowerCase(), token)
  );

  const result = addresses.map(
    (address) => TokenMap.get(address.toLowerCase()) || ({} as IToken) // Return empty object if token not found
  );

  return result;
};

export default fetchTokenDetails;

// Function to fetch tokens for a given collection
export const fetchTokensForCollection = async (nftCollection) => {
  const tokenIdArr = nftCollection.loanConfigs.map(
    (loanConfig) => loanConfig.lendingDesk.erc20.id
  );

  if (tokenIdArr?.length) {
    return await fetchTokenDetails(tokenIdArr);
  }

  return [];
};
