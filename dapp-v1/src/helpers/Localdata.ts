export const fetchLocalTokens = async () => {
  const response = await import("../../../deployments.json");
  const data = response.default;

  const tokenLists = [
    {
      address: data.usdc.address,
      chainId: 31337,
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      name: "USD Coin",
      symbol: "USDC",
    },
    {
      address: data.dai.address,
      chainId: 31337,
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
      name: "Dai Stablecoin",
      symbol: "DAI",
    },
  ];

  return {
    tokens: tokenLists,
  };
};

export const fetchLocalNfts = async () => {
  const response = await import("../../../deployments.json");
  const data = response.default;

  const nftLists = [
    {
      address: data.doodles.address,
      chainId: 31337,
      logoURI:
        "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ",
      name: "Doodles",
      symbol: "DOODLES",
    },

    {
      address: data.punks.address,
      chainId: 31337,
      logoURI: "https://i.seadn.io/gcs/files/498c0d117d7f1c95993804b7712721c7.png",
      name: "PolygonPunks",
      symbol: "ρ",
    },
  ];

  return {
    nfts: nftLists,
  };
};
