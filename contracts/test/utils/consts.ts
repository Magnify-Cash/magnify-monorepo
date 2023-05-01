import { BigNumber } from "ethers";

// possible statuses for liquidity shops
export const SHOP_STATUS = {
  ACTIVE: 0,
  INACTIVE: 1,
  FROZEN: 2,
};
export const LOAN_STATUS = {
  ACTIVE: 0,
  RESOLVED: 1,
  INACTIVE: 2,
};
export const MINIMUM_BASKET_SIZE = BigNumber.from(10).pow(18).mul(30000); // default minimum amount of tokens to be deposited for creating liquidity shops
export const MINIMUM_PAYMENT_AMOUNT = BigNumber.from(10).pow(18).mul(500); // default minimum amount of tokens to be transferred for paying back a loan
export const TEST_TOKEN_SUPPLY = BigNumber.from(10).pow(18).mul(1000000000);
export const TEST_TOKEN_SYMBOL = "LINK";
export const TEST_TOKEN_NAME = "Chainlink";
export const TEST_FEE_TOKEN_SYMBOL = "NFTY";
export const TEST_FEE_TOKEN_NAME = "NFTY Token";
export const TEST_NFT_IMAGE_1 =
  "https://ik.imagekit.io/bayc/assets/bayc-footer.png";
export const TEST_NFT_IMAGE_2 =
  "https://img.seadn.io/files/ee29834c76764b35886807884a2f4ff8.png";
export const TEST_NFT_IMAGE_3 =
  "https://pbs.twimg.com/profile_images/1514324107881431045/vsF28_QV_400x400.jpg";
export const TEST_NFT_BASE_URI =
  "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq";
export const TEST_SIGNATURE_EXPIRY = 180;
export const TEST_CURRENCIES = {
  "NFTY/USD": {
    price: 1400994, // 0.01400994
    timestamp: 1663490945, // 18/09/2022
  },
  "LINK/USD": {
    price: 699946215, // 6.99946215
    timestamp: 1666877154, // 27/10/2022
  },
  "SDN/USD": {
    price: 1400994, // 0.01400994
    timestamp: 1666877154, // 27/10/2022
  },
  "USDT/USD": {
    price: 99994433, // 0.99994433
    timestamp: 1666877033, // 27/10/22
  },
  "FTM/USD": {
    price: 99994433, // 0.99994433
    timestamp: 1667309155, // 01/11/22
  },
}; // default values to take for oracle updates in tests
export const DIA_ORACLE_ADDRESS = "0xf8c7A657193d14916f45dc478Ac5881eF612fDDD"; // oracle address on mainnet, used for tests in fork
export const DIA_ORACLE_UPDATER = "0x7fF0c8AC0fD796a5F457f572870BfA399c484B8c"; // oracle admin on mainnet, used to update oracle contract
