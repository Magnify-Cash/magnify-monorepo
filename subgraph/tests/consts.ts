import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TestLoanConfig } from "./utils";

// Protocol level parameters
export const protocolOwner = Address.fromString(
  "0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"
);
export const obligationNotes = Address.fromString(
  "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097"
);
export const lendingKeys = Address.fromString(
  "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"
);
export const loanOriginationFee = 200;
export const platformWallet = Address.fromString(
  "0x3546BcD3c84621e976D8186a91A922aE77ECEc31"
);

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

// Loan Configs
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

// Loan
export const loanId = 31;
export const borrower = Address.fromString(
  "0xcd3B766CCDd6AE721141F452C550Ca635964ce71"
);
export const nftCollection = Address.fromString(
  "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
);
export const nftId = 3120;
export const amount = BigInt.fromU64(50 * 10 ** 18);
export const duration = BigInt.fromU64(3 * 24);
export const interest = BigInt.fromU64(8000);
export const platformFee = BigInt.fromU64(1 * 10 ** 18);
