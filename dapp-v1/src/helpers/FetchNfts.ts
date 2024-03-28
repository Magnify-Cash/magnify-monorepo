import { formatAddress } from "./formatAddress";
import { getTokenListUrls } from "./tokenUrls";

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
const fetchNFTDetails = async (addresses: string[], chainId: number) => {
  let jsonData: IJsonData = { nfts: [] };
  try {
    const urls = getTokenListUrls(chainId, true, false) || [];

    // get list data
    const responses = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        return await response.json();
      }),
    );
    jsonData = { nfts: responses.flatMap((response) => response.nfts) };
  } catch (error) {
    console.error("Error fetching nft data", error);
  }

  //Creating a Map for fast lookup. Here key = address of an nft; value = an nft object
  const NFTMap: Map<string, INft> = new Map();
  for (const nft of jsonData.nfts) {
    NFTMap.set(nft.address.toLowerCase(), nft);
  }
  const result = addresses.map(
    // Return object only with name and address property if nft is not found
    // This can be the case if the nft is a custom nft
    (address) =>
      NFTMap.get(address.toLowerCase()) ||
      ({ name: formatAddress(address), address } as INft),
  );

  return result;
};

export default fetchNFTDetails;
