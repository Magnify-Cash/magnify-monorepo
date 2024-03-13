export enum LendingDeskStatus {
  Active,
  Frozen
}

export enum LoanStatus {
  Active,
  Resolved,
  Defaulted,
}

export type LoanConfig = {
  nftCollection: string;
  nftCollectionIsErc1155: boolean;
  minAmount: bigint;
  maxAmount: bigint;
  minDuration: bigint;
  maxDuration: bigint;
  minInterest: bigint;
  maxInterest: bigint;
};
