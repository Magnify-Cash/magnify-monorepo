import { Network, Alchemy } from "alchemy-sdk";

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
