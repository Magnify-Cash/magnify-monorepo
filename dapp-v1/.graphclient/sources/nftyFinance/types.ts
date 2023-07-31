// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace NftyFinanceTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Erc20 = {
  id: Scalars['ID'];
  liquidityShops: Array<LiquidityShop>;
  name: Scalars['String'];
  symbol: Scalars['String'];
  decimals: Scalars['Int'];
};


export type Erc20liquidityShopsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LiquidityShop_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LiquidityShop_filter>;
};

export type Erc20_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidityShops_?: InputMaybe<LiquidityShop_filter>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Erc20_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Erc20_filter>>>;
};

export type Erc20_orderBy =
  | 'id'
  | 'liquidityShops'
  | 'name'
  | 'symbol'
  | 'decimals';

export type LiquidityShop = {
  id: Scalars['ID'];
  erc20: Erc20;
  nftCollection: NftCollection;
  owner: Scalars['Bytes'];
  automaticApproval: Scalars['Boolean'];
  allowRefinancingTerms: Scalars['Boolean'];
  balance: Scalars['BigInt'];
  maxOffer: Scalars['BigInt'];
  interestA: Scalars['BigInt'];
  interestB: Scalars['BigInt'];
  interestC: Scalars['BigInt'];
  name: Scalars['String'];
  status: LiquidityShopStatus;
  loans: Array<Loan>;
};


export type LiquidityShoploansArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Loan_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Loan_filter>;
};

export type LiquidityShopStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'FROZEN';

export type LiquidityShop_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  erc20?: InputMaybe<Scalars['String']>;
  erc20_not?: InputMaybe<Scalars['String']>;
  erc20_gt?: InputMaybe<Scalars['String']>;
  erc20_lt?: InputMaybe<Scalars['String']>;
  erc20_gte?: InputMaybe<Scalars['String']>;
  erc20_lte?: InputMaybe<Scalars['String']>;
  erc20_in?: InputMaybe<Array<Scalars['String']>>;
  erc20_not_in?: InputMaybe<Array<Scalars['String']>>;
  erc20_contains?: InputMaybe<Scalars['String']>;
  erc20_contains_nocase?: InputMaybe<Scalars['String']>;
  erc20_not_contains?: InputMaybe<Scalars['String']>;
  erc20_not_contains_nocase?: InputMaybe<Scalars['String']>;
  erc20_starts_with?: InputMaybe<Scalars['String']>;
  erc20_starts_with_nocase?: InputMaybe<Scalars['String']>;
  erc20_not_starts_with?: InputMaybe<Scalars['String']>;
  erc20_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  erc20_ends_with?: InputMaybe<Scalars['String']>;
  erc20_ends_with_nocase?: InputMaybe<Scalars['String']>;
  erc20_not_ends_with?: InputMaybe<Scalars['String']>;
  erc20_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  erc20_?: InputMaybe<Erc20_filter>;
  nftCollection?: InputMaybe<Scalars['String']>;
  nftCollection_not?: InputMaybe<Scalars['String']>;
  nftCollection_gt?: InputMaybe<Scalars['String']>;
  nftCollection_lt?: InputMaybe<Scalars['String']>;
  nftCollection_gte?: InputMaybe<Scalars['String']>;
  nftCollection_lte?: InputMaybe<Scalars['String']>;
  nftCollection_in?: InputMaybe<Array<Scalars['String']>>;
  nftCollection_not_in?: InputMaybe<Array<Scalars['String']>>;
  nftCollection_contains?: InputMaybe<Scalars['String']>;
  nftCollection_contains_nocase?: InputMaybe<Scalars['String']>;
  nftCollection_not_contains?: InputMaybe<Scalars['String']>;
  nftCollection_not_contains_nocase?: InputMaybe<Scalars['String']>;
  nftCollection_starts_with?: InputMaybe<Scalars['String']>;
  nftCollection_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nftCollection_not_starts_with?: InputMaybe<Scalars['String']>;
  nftCollection_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nftCollection_ends_with?: InputMaybe<Scalars['String']>;
  nftCollection_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nftCollection_not_ends_with?: InputMaybe<Scalars['String']>;
  nftCollection_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nftCollection_?: InputMaybe<NftCollection_filter>;
  owner?: InputMaybe<Scalars['Bytes']>;
  owner_not?: InputMaybe<Scalars['Bytes']>;
  owner_gt?: InputMaybe<Scalars['Bytes']>;
  owner_lt?: InputMaybe<Scalars['Bytes']>;
  owner_gte?: InputMaybe<Scalars['Bytes']>;
  owner_lte?: InputMaybe<Scalars['Bytes']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']>>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  owner_contains?: InputMaybe<Scalars['Bytes']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']>;
  automaticApproval?: InputMaybe<Scalars['Boolean']>;
  automaticApproval_not?: InputMaybe<Scalars['Boolean']>;
  automaticApproval_in?: InputMaybe<Array<Scalars['Boolean']>>;
  automaticApproval_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowRefinancingTerms?: InputMaybe<Scalars['Boolean']>;
  allowRefinancingTerms_not?: InputMaybe<Scalars['Boolean']>;
  allowRefinancingTerms_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowRefinancingTerms_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  balance?: InputMaybe<Scalars['BigInt']>;
  balance_not?: InputMaybe<Scalars['BigInt']>;
  balance_gt?: InputMaybe<Scalars['BigInt']>;
  balance_lt?: InputMaybe<Scalars['BigInt']>;
  balance_gte?: InputMaybe<Scalars['BigInt']>;
  balance_lte?: InputMaybe<Scalars['BigInt']>;
  balance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxOffer?: InputMaybe<Scalars['BigInt']>;
  maxOffer_not?: InputMaybe<Scalars['BigInt']>;
  maxOffer_gt?: InputMaybe<Scalars['BigInt']>;
  maxOffer_lt?: InputMaybe<Scalars['BigInt']>;
  maxOffer_gte?: InputMaybe<Scalars['BigInt']>;
  maxOffer_lte?: InputMaybe<Scalars['BigInt']>;
  maxOffer_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxOffer_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  interestA?: InputMaybe<Scalars['BigInt']>;
  interestA_not?: InputMaybe<Scalars['BigInt']>;
  interestA_gt?: InputMaybe<Scalars['BigInt']>;
  interestA_lt?: InputMaybe<Scalars['BigInt']>;
  interestA_gte?: InputMaybe<Scalars['BigInt']>;
  interestA_lte?: InputMaybe<Scalars['BigInt']>;
  interestA_in?: InputMaybe<Array<Scalars['BigInt']>>;
  interestA_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  interestB?: InputMaybe<Scalars['BigInt']>;
  interestB_not?: InputMaybe<Scalars['BigInt']>;
  interestB_gt?: InputMaybe<Scalars['BigInt']>;
  interestB_lt?: InputMaybe<Scalars['BigInt']>;
  interestB_gte?: InputMaybe<Scalars['BigInt']>;
  interestB_lte?: InputMaybe<Scalars['BigInt']>;
  interestB_in?: InputMaybe<Array<Scalars['BigInt']>>;
  interestB_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  interestC?: InputMaybe<Scalars['BigInt']>;
  interestC_not?: InputMaybe<Scalars['BigInt']>;
  interestC_gt?: InputMaybe<Scalars['BigInt']>;
  interestC_lt?: InputMaybe<Scalars['BigInt']>;
  interestC_gte?: InputMaybe<Scalars['BigInt']>;
  interestC_lte?: InputMaybe<Scalars['BigInt']>;
  interestC_in?: InputMaybe<Array<Scalars['BigInt']>>;
  interestC_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<LiquidityShopStatus>;
  status_not?: InputMaybe<LiquidityShopStatus>;
  status_in?: InputMaybe<Array<LiquidityShopStatus>>;
  status_not_in?: InputMaybe<Array<LiquidityShopStatus>>;
  loans_?: InputMaybe<Loan_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LiquidityShop_filter>>>;
  or?: InputMaybe<Array<InputMaybe<LiquidityShop_filter>>>;
};

export type LiquidityShop_orderBy =
  | 'id'
  | 'erc20'
  | 'erc20__id'
  | 'erc20__name'
  | 'erc20__symbol'
  | 'erc20__decimals'
  | 'nftCollection'
  | 'nftCollection__id'
  | 'nftCollection__isErc1155'
  | 'owner'
  | 'automaticApproval'
  | 'allowRefinancingTerms'
  | 'balance'
  | 'maxOffer'
  | 'interestA'
  | 'interestB'
  | 'interestC'
  | 'name'
  | 'status'
  | 'loans';

export type Loan = {
  id: Scalars['ID'];
  liquidityShop: LiquidityShop;
  amount: Scalars['BigInt'];
  remainder: Scalars['BigInt'];
  duration: Scalars['BigInt'];
  startTime: Scalars['BigInt'];
  nftCollateralId: Scalars['BigInt'];
  fee: Scalars['BigInt'];
  status: LoanStatus;
  lenderFeePercentage: Scalars['BigInt'];
  borrowerFeePercentage: Scalars['BigInt'];
  platformFeePercentage: Scalars['BigInt'];
  lender: Scalars['Bytes'];
  borrower: Scalars['Bytes'];
};

export type LoanStatus =
  | 'ACTIVE'
  | 'RESOLVED'
  | 'INACTIVE';

export type Loan_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidityShop?: InputMaybe<Scalars['String']>;
  liquidityShop_not?: InputMaybe<Scalars['String']>;
  liquidityShop_gt?: InputMaybe<Scalars['String']>;
  liquidityShop_lt?: InputMaybe<Scalars['String']>;
  liquidityShop_gte?: InputMaybe<Scalars['String']>;
  liquidityShop_lte?: InputMaybe<Scalars['String']>;
  liquidityShop_in?: InputMaybe<Array<Scalars['String']>>;
  liquidityShop_not_in?: InputMaybe<Array<Scalars['String']>>;
  liquidityShop_contains?: InputMaybe<Scalars['String']>;
  liquidityShop_contains_nocase?: InputMaybe<Scalars['String']>;
  liquidityShop_not_contains?: InputMaybe<Scalars['String']>;
  liquidityShop_not_contains_nocase?: InputMaybe<Scalars['String']>;
  liquidityShop_starts_with?: InputMaybe<Scalars['String']>;
  liquidityShop_starts_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityShop_not_starts_with?: InputMaybe<Scalars['String']>;
  liquidityShop_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityShop_ends_with?: InputMaybe<Scalars['String']>;
  liquidityShop_ends_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityShop_not_ends_with?: InputMaybe<Scalars['String']>;
  liquidityShop_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityShop_?: InputMaybe<LiquidityShop_filter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainder?: InputMaybe<Scalars['BigInt']>;
  remainder_not?: InputMaybe<Scalars['BigInt']>;
  remainder_gt?: InputMaybe<Scalars['BigInt']>;
  remainder_lt?: InputMaybe<Scalars['BigInt']>;
  remainder_gte?: InputMaybe<Scalars['BigInt']>;
  remainder_lte?: InputMaybe<Scalars['BigInt']>;
  remainder_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainder_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  duration?: InputMaybe<Scalars['BigInt']>;
  duration_not?: InputMaybe<Scalars['BigInt']>;
  duration_gt?: InputMaybe<Scalars['BigInt']>;
  duration_lt?: InputMaybe<Scalars['BigInt']>;
  duration_gte?: InputMaybe<Scalars['BigInt']>;
  duration_lte?: InputMaybe<Scalars['BigInt']>;
  duration_in?: InputMaybe<Array<Scalars['BigInt']>>;
  duration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startTime?: InputMaybe<Scalars['BigInt']>;
  startTime_not?: InputMaybe<Scalars['BigInt']>;
  startTime_gt?: InputMaybe<Scalars['BigInt']>;
  startTime_lt?: InputMaybe<Scalars['BigInt']>;
  startTime_gte?: InputMaybe<Scalars['BigInt']>;
  startTime_lte?: InputMaybe<Scalars['BigInt']>;
  startTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nftCollateralId?: InputMaybe<Scalars['BigInt']>;
  nftCollateralId_not?: InputMaybe<Scalars['BigInt']>;
  nftCollateralId_gt?: InputMaybe<Scalars['BigInt']>;
  nftCollateralId_lt?: InputMaybe<Scalars['BigInt']>;
  nftCollateralId_gte?: InputMaybe<Scalars['BigInt']>;
  nftCollateralId_lte?: InputMaybe<Scalars['BigInt']>;
  nftCollateralId_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nftCollateralId_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee?: InputMaybe<Scalars['BigInt']>;
  fee_not?: InputMaybe<Scalars['BigInt']>;
  fee_gt?: InputMaybe<Scalars['BigInt']>;
  fee_lt?: InputMaybe<Scalars['BigInt']>;
  fee_gte?: InputMaybe<Scalars['BigInt']>;
  fee_lte?: InputMaybe<Scalars['BigInt']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']>>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  status?: InputMaybe<LoanStatus>;
  status_not?: InputMaybe<LoanStatus>;
  status_in?: InputMaybe<Array<LoanStatus>>;
  status_not_in?: InputMaybe<Array<LoanStatus>>;
  lenderFeePercentage?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lenderFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  borrowerFeePercentage?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  borrowerFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  platformFeePercentage?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  platformFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lender?: InputMaybe<Scalars['Bytes']>;
  lender_not?: InputMaybe<Scalars['Bytes']>;
  lender_gt?: InputMaybe<Scalars['Bytes']>;
  lender_lt?: InputMaybe<Scalars['Bytes']>;
  lender_gte?: InputMaybe<Scalars['Bytes']>;
  lender_lte?: InputMaybe<Scalars['Bytes']>;
  lender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lender_contains?: InputMaybe<Scalars['Bytes']>;
  lender_not_contains?: InputMaybe<Scalars['Bytes']>;
  borrower?: InputMaybe<Scalars['Bytes']>;
  borrower_not?: InputMaybe<Scalars['Bytes']>;
  borrower_gt?: InputMaybe<Scalars['Bytes']>;
  borrower_lt?: InputMaybe<Scalars['Bytes']>;
  borrower_gte?: InputMaybe<Scalars['Bytes']>;
  borrower_lte?: InputMaybe<Scalars['Bytes']>;
  borrower_in?: InputMaybe<Array<Scalars['Bytes']>>;
  borrower_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  borrower_contains?: InputMaybe<Scalars['Bytes']>;
  borrower_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Loan_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Loan_filter>>>;
};

export type Loan_orderBy =
  | 'id'
  | 'liquidityShop'
  | 'liquidityShop__id'
  | 'liquidityShop__owner'
  | 'liquidityShop__automaticApproval'
  | 'liquidityShop__allowRefinancingTerms'
  | 'liquidityShop__balance'
  | 'liquidityShop__maxOffer'
  | 'liquidityShop__interestA'
  | 'liquidityShop__interestB'
  | 'liquidityShop__interestC'
  | 'liquidityShop__name'
  | 'liquidityShop__status'
  | 'amount'
  | 'remainder'
  | 'duration'
  | 'startTime'
  | 'nftCollateralId'
  | 'fee'
  | 'status'
  | 'lenderFeePercentage'
  | 'borrowerFeePercentage'
  | 'platformFeePercentage'
  | 'lender'
  | 'borrower';

export type NftCollection = {
  id: Scalars['ID'];
  liquidityShops: Array<LiquidityShop>;
  isErc1155: Scalars['Boolean'];
};


export type NftCollectionliquidityShopsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LiquidityShop_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LiquidityShop_filter>;
};

export type NftCollection_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidityShops_?: InputMaybe<LiquidityShop_filter>;
  isErc1155?: InputMaybe<Scalars['Boolean']>;
  isErc1155_not?: InputMaybe<Scalars['Boolean']>;
  isErc1155_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isErc1155_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<NftCollection_filter>>>;
  or?: InputMaybe<Array<InputMaybe<NftCollection_filter>>>;
};

export type NftCollection_orderBy =
  | 'id'
  | 'liquidityShops'
  | 'isErc1155';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type ProtocolParams = {
  id: Scalars['ID'];
  owner: Scalars['Bytes'];
  paused: Scalars['Boolean'];
  loanOriginationFeePercentage: Scalars['BigInt'];
  lenderFeePercentage: Scalars['BigInt'];
  borrowerFeePercentage: Scalars['BigInt'];
  platformFeePercentage: Scalars['BigInt'];
  oraclePriceExpirationDuration: Scalars['BigInt'];
  promissoryNote: Scalars['Bytes'];
  obligationReceipt: Scalars['Bytes'];
  oracle: Scalars['Bytes'];
  nftyToken: Scalars['Bytes'];
};

export type ProtocolParams_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  owner?: InputMaybe<Scalars['Bytes']>;
  owner_not?: InputMaybe<Scalars['Bytes']>;
  owner_gt?: InputMaybe<Scalars['Bytes']>;
  owner_lt?: InputMaybe<Scalars['Bytes']>;
  owner_gte?: InputMaybe<Scalars['Bytes']>;
  owner_lte?: InputMaybe<Scalars['Bytes']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']>>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  owner_contains?: InputMaybe<Scalars['Bytes']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']>;
  paused?: InputMaybe<Scalars['Boolean']>;
  paused_not?: InputMaybe<Scalars['Boolean']>;
  paused_in?: InputMaybe<Array<Scalars['Boolean']>>;
  paused_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  loanOriginationFeePercentage?: InputMaybe<Scalars['BigInt']>;
  loanOriginationFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  loanOriginationFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  loanOriginationFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  loanOriginationFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  loanOriginationFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  loanOriginationFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  loanOriginationFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lenderFeePercentage?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  lenderFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lenderFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  borrowerFeePercentage?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  borrowerFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  borrowerFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  platformFeePercentage?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_not?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_gt?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_lt?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_gte?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_lte?: InputMaybe<Scalars['BigInt']>;
  platformFeePercentage_in?: InputMaybe<Array<Scalars['BigInt']>>;
  platformFeePercentage_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oraclePriceExpirationDuration?: InputMaybe<Scalars['BigInt']>;
  oraclePriceExpirationDuration_not?: InputMaybe<Scalars['BigInt']>;
  oraclePriceExpirationDuration_gt?: InputMaybe<Scalars['BigInt']>;
  oraclePriceExpirationDuration_lt?: InputMaybe<Scalars['BigInt']>;
  oraclePriceExpirationDuration_gte?: InputMaybe<Scalars['BigInt']>;
  oraclePriceExpirationDuration_lte?: InputMaybe<Scalars['BigInt']>;
  oraclePriceExpirationDuration_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oraclePriceExpirationDuration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  promissoryNote?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_not?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_gt?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_lt?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_gte?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_lte?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_in?: InputMaybe<Array<Scalars['Bytes']>>;
  promissoryNote_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  promissoryNote_contains?: InputMaybe<Scalars['Bytes']>;
  promissoryNote_not_contains?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_not?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_gt?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_lt?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_gte?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_lte?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_in?: InputMaybe<Array<Scalars['Bytes']>>;
  obligationReceipt_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  obligationReceipt_contains?: InputMaybe<Scalars['Bytes']>;
  obligationReceipt_not_contains?: InputMaybe<Scalars['Bytes']>;
  oracle?: InputMaybe<Scalars['Bytes']>;
  oracle_not?: InputMaybe<Scalars['Bytes']>;
  oracle_gt?: InputMaybe<Scalars['Bytes']>;
  oracle_lt?: InputMaybe<Scalars['Bytes']>;
  oracle_gte?: InputMaybe<Scalars['Bytes']>;
  oracle_lte?: InputMaybe<Scalars['Bytes']>;
  oracle_in?: InputMaybe<Array<Scalars['Bytes']>>;
  oracle_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  oracle_contains?: InputMaybe<Scalars['Bytes']>;
  oracle_not_contains?: InputMaybe<Scalars['Bytes']>;
  nftyToken?: InputMaybe<Scalars['Bytes']>;
  nftyToken_not?: InputMaybe<Scalars['Bytes']>;
  nftyToken_gt?: InputMaybe<Scalars['Bytes']>;
  nftyToken_lt?: InputMaybe<Scalars['Bytes']>;
  nftyToken_gte?: InputMaybe<Scalars['Bytes']>;
  nftyToken_lte?: InputMaybe<Scalars['Bytes']>;
  nftyToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  nftyToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  nftyToken_contains?: InputMaybe<Scalars['Bytes']>;
  nftyToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ProtocolParams_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ProtocolParams_filter>>>;
};

export type ProtocolParams_orderBy =
  | 'id'
  | 'owner'
  | 'paused'
  | 'loanOriginationFeePercentage'
  | 'lenderFeePercentage'
  | 'borrowerFeePercentage'
  | 'platformFeePercentage'
  | 'oraclePriceExpirationDuration'
  | 'promissoryNote'
  | 'obligationReceipt'
  | 'oracle'
  | 'nftyToken';

export type Query = {
  liquidityShop?: Maybe<LiquidityShop>;
  liquidityShops: Array<LiquidityShop>;
  protocolParams: Array<ProtocolParams>;
  erc20?: Maybe<Erc20>;
  erc20S: Array<Erc20>;
  nftCollection?: Maybe<NftCollection>;
  nftCollections: Array<NftCollection>;
  loan?: Maybe<Loan>;
  loans: Array<Loan>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryliquidityShopArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryliquidityShopsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LiquidityShop_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LiquidityShop_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryprotocolParamsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProtocolParams_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProtocolParams_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Queryerc20Args = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Queryerc20SArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Erc20_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerynftCollectionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerynftCollectionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NftCollection_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<NftCollection_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryloanArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryloansArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Loan_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Loan_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Subscription = {
  liquidityShop?: Maybe<LiquidityShop>;
  liquidityShops: Array<LiquidityShop>;
  protocolParams: Array<ProtocolParams>;
  erc20?: Maybe<Erc20>;
  erc20S: Array<Erc20>;
  nftCollection?: Maybe<NftCollection>;
  nftCollections: Array<NftCollection>;
  loan?: Maybe<Loan>;
  loans: Array<Loan>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionliquidityShopArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionliquidityShopsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LiquidityShop_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LiquidityShop_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionprotocolParamsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProtocolParams_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProtocolParams_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscriptionerc20Args = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscriptionerc20SArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Erc20_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Erc20_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionnftCollectionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionnftCollectionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NftCollection_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<NftCollection_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionloanArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionloansArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Loan_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Loan_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  liquidityShop: InContextSdkMethod<Query['liquidityShop'], QueryliquidityShopArgs, MeshContext>,
  /** null **/
  liquidityShops: InContextSdkMethod<Query['liquidityShops'], QueryliquidityShopsArgs, MeshContext>,
  /** null **/
  protocolParams: InContextSdkMethod<Query['protocolParams'], QueryprotocolParamsArgs, MeshContext>,
  /** null **/
  erc20: InContextSdkMethod<Query['erc20'], Queryerc20Args, MeshContext>,
  /** null **/
  erc20S: InContextSdkMethod<Query['erc20S'], Queryerc20SArgs, MeshContext>,
  /** null **/
  nftCollection: InContextSdkMethod<Query['nftCollection'], QuerynftCollectionArgs, MeshContext>,
  /** null **/
  nftCollections: InContextSdkMethod<Query['nftCollections'], QuerynftCollectionsArgs, MeshContext>,
  /** null **/
  loan: InContextSdkMethod<Query['loan'], QueryloanArgs, MeshContext>,
  /** null **/
  loans: InContextSdkMethod<Query['loans'], QueryloansArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  liquidityShop: InContextSdkMethod<Subscription['liquidityShop'], SubscriptionliquidityShopArgs, MeshContext>,
  /** null **/
  liquidityShops: InContextSdkMethod<Subscription['liquidityShops'], SubscriptionliquidityShopsArgs, MeshContext>,
  /** null **/
  protocolParams: InContextSdkMethod<Subscription['protocolParams'], SubscriptionprotocolParamsArgs, MeshContext>,
  /** null **/
  erc20: InContextSdkMethod<Subscription['erc20'], Subscriptionerc20Args, MeshContext>,
  /** null **/
  erc20S: InContextSdkMethod<Subscription['erc20S'], Subscriptionerc20SArgs, MeshContext>,
  /** null **/
  nftCollection: InContextSdkMethod<Subscription['nftCollection'], SubscriptionnftCollectionArgs, MeshContext>,
  /** null **/
  nftCollections: InContextSdkMethod<Subscription['nftCollections'], SubscriptionnftCollectionsArgs, MeshContext>,
  /** null **/
  loan: InContextSdkMethod<Subscription['loan'], SubscriptionloanArgs, MeshContext>,
  /** null **/
  loans: InContextSdkMethod<Subscription['loans'], SubscriptionloansArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["nftyFinance"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
