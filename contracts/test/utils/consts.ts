import { BigNumber } from "ethers";

export enum LendingDeskStatus {
  Active,
  Frozen,
  Dissolved,
}

export enum LoanStatus {
  Active,
  Resolved,
  Defaulted,
}

export type LoanConfig = {
  nftCollection: string;
  nftCollectionIsErc1155: boolean;
  minAmount: BigNumber;
  maxAmount: BigNumber;
  minDuration: BigNumber;
  maxDuration: BigNumber;
  minInterest: BigNumber;
  maxInterest: BigNumber;
};
