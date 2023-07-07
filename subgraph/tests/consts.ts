import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TestLoanConfig } from "./utils";

// Protocol level parameters
export const nftyFinance = Address.fromString(
  "0x63fea6E447F120B8Faf85B53cdaD8348e645D80E"
);
export const promissoryNotes = Address.fromString(
  "0x90cBa2Bbb19ecc291A12066Fd8329D65FA1f1947"
);
export const obligationNotes = Address.fromString(
  "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
);
export const lendingKeys = Address.fromString(
  "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"
);
export const loanOriginationFee = 200;

// Lending Desk
export const lendingDeskId = 12;
export const lendingDeskOwner = Address.fromString(
  "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a"
);

// ERC20
export const erc20Address = Address.fromString(
  "0x71bE63f3384f5fb98995898A86B02Fb2426c5788"
);
export const erc20Name = "USD Coin";
export const erc20Symbol = "USDC";
export const erc20Decimals = 18;

export const loanConfigs: Array<TestLoanConfig> = [
  {
    nftCollection: Address.fromString(
      "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
    ),
    nftCollectionIsErc1155: false,
    minAmount: BigInt.fromU64(10 * 10 ** 18),
    maxAmount: BigInt.fromU64(100 * 10 ** 18),
    minDuration: BigInt.fromU64(12),
    maxDuration: BigInt.fromU64(24 * 5),
    minInterest: BigInt.fromU64(300),
    maxInterest: BigInt.fromU64(15000),
  },
  {
    nftCollection: Address.fromString(
      "0xED5AF388653567Af2F388E6224dC7C4b3241C544"
    ),
    nftCollectionIsErc1155: true,
    minAmount: BigInt.fromU64(20 * 10 ** 18),
    maxAmount: BigInt.fromU64(60 * 10 ** 18),
    minDuration: BigInt.fromU64(24 * 2),
    maxDuration: BigInt.fromU64(24 * 10),
    minInterest: BigInt.fromU64(500),
    maxInterest: BigInt.fromU64(10000),
  },
];
