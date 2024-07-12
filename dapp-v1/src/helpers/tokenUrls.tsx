const nftListUrlsMap = {
  1: [
    "https://raw.githubusercontent.com/magnify-cash/nft-lists/master/test/schema/bigexample.nftlist.json?token=GHSAT0AAAAAACFG2BS3CVGA2FTJWHAHSUBQZURQOOA",
  ],
  8453: [],
  84532: import.meta.env.DEV
    ? ["http://localhost:5173/tokenlists/nftsBaseSepolia.json"]
    : ["https://early.magnify.cash/tokenlists/nftsBaseSepolia.json"],
  31337: ["http://localhost:5173/tokenlists/nfts.json"],
};

const tokenListUrlsMap = {
  1: ["https://tokens.coingecko.com/ethereum/all.json"],
  8453: ["https://tokens.coingecko.com/base/all.json"],
  84532: import.meta.env.DEV
    ? ["http://localhost:5173/tokenlists/tokensBaseSepolia.json"]
    : ["https://early.magnify.cash/tokenlists/tokensBaseSepolia.json"],
  31337: ["http://localhost:5173/tokenlists/tokens.json"],
};

export function getTokenListUrls(
  chainId: number,
  isNft: boolean | undefined,
  isToken: boolean | undefined,
): string[] | undefined {
  if (isNft) {
    return nftListUrlsMap[chainId];
  }
  if (isToken) {
    return tokenListUrlsMap[chainId];
  }
}
