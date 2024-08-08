# MagnifyCash
MagnifyCash is an onchain protocol that facilitates lending and borrowing of ERC20 tokens using NFTs as collateral. The protocol introduces a novel AMM-style architecture called "LAMM" (Lending Automated Market Maker) for lending markets.

The protocol provides a simple but powerful DeFi primitive where any NFT can be lent against any fungible token. All lending parameters are fully customizable - duration, interest, and loan value - offering liquidity providers a full range of capital utilization.

In contrast to many lending markets, the MagnifyCash protocol supports lending for any type of fungible or non-fungible asset. This approach targets the long-tail of asset distribution, where there are tens and thousands of assets without any suitable markets.

Additionally, the MagnifyCash protocol is entirely dependency-free. All transactions are between a lender and borrower exclusively, free of any external third parties. By doing so, users are able to manage risk on their own accord, without worrying about mass liqudiation events, flash crashes, and the like.

Going a step further, lender and borrower positions in the protocol are tokenized. The goal here is a composable base layer where developers can steadily build on top of for years to come.

## Table of Contents
- [Interfaces](contracts/contracts/interfaces)
- [Contracts](contracts/contracts)
- [Integration Guides](integration/)
