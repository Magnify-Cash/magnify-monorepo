import { BigNumber } from "ethers";

// defaults assume 18 decimals for tokens
export const MINIMUM_BASKET_SIZE = BigNumber.from(10).pow(18).mul(30000); // default minimum amount of tokens to be deposited for creating liquidity shops
export const MINIMUM_PAYMENT_AMOUNT = BigNumber.from(10).pow(18).mul(500); // default minimum amount of tokens to be transferred for paying back a loan
export const TOKEN_NAME = "Test Token";
export const TOKEN_SYMBOL = "TKN";
export const TOKEN_SUPPLY = BigNumber.from(1000000000);
export const PROMISSORY_NOTE = {
  name: "Promissory note",
  symbol: "PSN",
  baseUri: "https://psn.nfty.finance",
};
export const OBLIGATION_RECEIPT = {
  name: "Obligation receipt",
  symbol: "OBG",
  baseUri: "https://obg.nfty.finance",
};
