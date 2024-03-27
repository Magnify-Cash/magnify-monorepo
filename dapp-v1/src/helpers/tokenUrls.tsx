const nftListUrlsMap = {
  1: ["https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json"]
};

const tokenListUrlsMap = {
  1: ["https://tokens.coingecko.com/ethereum/all.json"],
  8453: ["https://tokens.coingecko.com/base/all.json"],
}

export function getTokenListUrls(
  chainId: number,
  isNft: boolean | undefined,
  isToken: boolean | undefined
): string[] | undefined {
  if (isNft) {
    return nftListUrlsMap[chainId];
  }
  if (isToken) {
    return tokenListUrlsMap[chainId];
  }
}
