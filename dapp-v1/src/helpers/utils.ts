import { Network, Alchemy } from "alchemy-sdk";
import { formatUnits, parseUnits } from 'viem';

export const truncateAddress = (addr: string) =>
  addr.slice(0, 6) + "..." + addr.slice(-4);

type GetWalletNftsArgs = {
  wallet: string;
  nftCollection: string;
};

export type WalletNft = {
  tokenId: string;
  name: string | null;
};

export const getWalletNfts = async ({
  wallet,
  nftCollection,
}: GetWalletNftsArgs): Promise<WalletNft[]> => {
  switch (import.meta.env.VITE_CHAIN_NAME) {
    case "mumbai": {
      const alchemy = new Alchemy({
        apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
        network: Network.MATIC_MUMBAI,
      });
      const response = await alchemy.nft.getNftsForOwner(wallet, {
        contractAddresses: [nftCollection],
      });
      return response.ownedNfts.map((x) => ({
        tokenId: x.tokenId,
        name: x.name!,
      }));
    }

    case "local": {
      return Array(10)
        .fill(null)
        .map((_, index) => ({
          tokenId: index.toString(),
          name: null,
        }));
    }
  }

  return [];
};

// Human readable to wei
// https://viem.sh/docs/utilities/parseUnits.html: Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
export const toWei = (value: string, decimals: number):bigint => {
  return parseUnits(value, decimals)
}


// Wei to human readable
// https://viem.sh/docs/utilities/formatUnits.html: Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number.
export const fromWei = (value: bigint, decimals: number):string => {
  return formatUnits(value, decimals)
}