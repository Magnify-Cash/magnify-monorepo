import { fetchLocalNfts } from "./Localdata";

interface IJsonData {
  nfts: INft[];
}

export interface INft {
  address: string;
  chainId: number;
  logoURI: string;
  name: string;
  symbol: string;
}

//Given an array of addresses, returns an array of nft objects in order
const fetchNFTDetails = async (addresses: string[]) => {
  const url =
    "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json";
  let jsonData: IJsonData = { nfts: [] };

  if (import.meta.env.DEV) {
    jsonData = await fetchLocalNfts();
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

  //Creating a Map for fast lookup. Here key = address of an nft; value = an nft object
  const NFTMap: Map<string, INft> = new Map();

  jsonData.nfts.forEach((nft) => NFTMap.set(nft.address.toLowerCase(), nft));

  const result = addresses.map(
    (address) => NFTMap.get(address.toLowerCase()) || ({} as INft) // Return empty object if nft not found
  );

  return result;
};

export default fetchNFTDetails;
