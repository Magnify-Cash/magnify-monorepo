export enum LiquidityShopStatus {
  Active,
  Frozen,
}

export enum LoanStatus {
  Active,
  Resolved,
}

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
