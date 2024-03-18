const nftListUrlsMap = new Map<number, string[]>([
  [
    11155111,
    [
      "https://raw.githubusercontent.com/NFTYLabs/nft-lists/master/test/schema/bigexample.nftlist.json",
    ],
  ],
  [2, ["http://example.com/url3", "http://example.com/url4"]],
  // Add more entries as needed
]);

const tokenListUrlsMap = new Map<number, string[]>([
  [11155111, ["https://tokens.coingecko.com/uniswap/all.json"]],
  [2, ["http://example.com/url3", "http://example.com/url4"]],
  // Add more entries as needed
]);

export function getTokenListUrls(
  chainId: number,
  isNft: boolean | undefined,
  isToken: boolean | undefined
): string[] | undefined {
  if (isNft) {
    return nftListUrlsMap.get(chainId);
  }
  if (isToken) {
    return tokenListUrlsMap.get(chainId);
  }
}
