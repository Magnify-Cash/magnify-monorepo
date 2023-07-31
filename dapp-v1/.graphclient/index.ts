// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { NftyFinanceTypes } from './sources/nftyFinance/types';
import * as importedModule$0 from "./sources/nftyFinance/introspectionSchema";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  Erc20: ResolverTypeWrapper<Erc20>;
  Erc20_filter: Erc20_filter;
  Erc20_orderBy: Erc20_orderBy;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LiquidityShop: ResolverTypeWrapper<LiquidityShop>;
  LiquidityShopStatus: LiquidityShopStatus;
  LiquidityShop_filter: LiquidityShop_filter;
  LiquidityShop_orderBy: LiquidityShop_orderBy;
  Loan: ResolverTypeWrapper<Loan>;
  LoanStatus: LoanStatus;
  Loan_filter: Loan_filter;
  Loan_orderBy: Loan_orderBy;
  NftCollection: ResolverTypeWrapper<NftCollection>;
  NftCollection_filter: NftCollection_filter;
  NftCollection_orderBy: NftCollection_orderBy;
  OrderDirection: OrderDirection;
  ProtocolParams: ResolverTypeWrapper<ProtocolParams>;
  ProtocolParams_filter: ProtocolParams_filter;
  ProtocolParams_orderBy: ProtocolParams_orderBy;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  Erc20: Erc20;
  Erc20_filter: Erc20_filter;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  LiquidityShop: LiquidityShop;
  LiquidityShop_filter: LiquidityShop_filter;
  Loan: Loan;
  Loan_filter: Loan_filter;
  NftCollection: NftCollection;
  NftCollection_filter: NftCollection_filter;
  ProtocolParams: ProtocolParams;
  ProtocolParams_filter: ProtocolParams_filter;
  Query: {};
  String: Scalars['String'];
  Subscription: {};
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type entityDirectiveArgs = { };

export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String'];
};

export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String'];
};

export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type Erc20Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Erc20'] = ResolversParentTypes['Erc20']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  liquidityShops?: Resolver<Array<ResolversTypes['LiquidityShop']>, ParentType, ContextType, RequireFields<Erc20liquidityShopsArgs, 'skip' | 'first'>>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LiquidityShopResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LiquidityShop'] = ResolversParentTypes['LiquidityShop']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  erc20?: Resolver<ResolversTypes['Erc20'], ParentType, ContextType>;
  nftCollection?: Resolver<ResolversTypes['NftCollection'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  automaticApproval?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowRefinancingTerms?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  maxOffer?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  interestA?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  interestB?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  interestC?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['LiquidityShopStatus'], ParentType, ContextType>;
  loans?: Resolver<Array<ResolversTypes['Loan']>, ParentType, ContextType, RequireFields<LiquidityShoploansArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoanResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Loan'] = ResolversParentTypes['Loan']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  liquidityShop?: Resolver<ResolversTypes['LiquidityShop'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  remainder?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  nftCollateralId?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  fee?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['LoanStatus'], ParentType, ContextType>;
  lenderFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  borrowerFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  platformFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  borrower?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NftCollectionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['NftCollection'] = ResolversParentTypes['NftCollection']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  liquidityShops?: Resolver<Array<ResolversTypes['LiquidityShop']>, ParentType, ContextType, RequireFields<NftCollectionliquidityShopsArgs, 'skip' | 'first'>>;
  isErc1155?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProtocolParamsResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['ProtocolParams'] = ResolversParentTypes['ProtocolParams']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  paused?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  loanOriginationFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lenderFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  borrowerFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  platformFeePercentage?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  oraclePriceExpirationDuration?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  promissoryNote?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  obligationReceipt?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  oracle?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  nftyToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  liquidityShop?: Resolver<Maybe<ResolversTypes['LiquidityShop']>, ParentType, ContextType, RequireFields<QueryliquidityShopArgs, 'id' | 'subgraphError'>>;
  liquidityShops?: Resolver<Array<ResolversTypes['LiquidityShop']>, ParentType, ContextType, RequireFields<QueryliquidityShopsArgs, 'skip' | 'first' | 'subgraphError'>>;
  protocolParams?: Resolver<Array<ResolversTypes['ProtocolParams']>, ParentType, ContextType, RequireFields<QueryprotocolParamsArgs, 'skip' | 'first' | 'subgraphError'>>;
  erc20?: Resolver<Maybe<ResolversTypes['Erc20']>, ParentType, ContextType, RequireFields<Queryerc20Args, 'id' | 'subgraphError'>>;
  erc20S?: Resolver<Array<ResolversTypes['Erc20']>, ParentType, ContextType, RequireFields<Queryerc20SArgs, 'skip' | 'first' | 'subgraphError'>>;
  nftCollection?: Resolver<Maybe<ResolversTypes['NftCollection']>, ParentType, ContextType, RequireFields<QuerynftCollectionArgs, 'id' | 'subgraphError'>>;
  nftCollections?: Resolver<Array<ResolversTypes['NftCollection']>, ParentType, ContextType, RequireFields<QuerynftCollectionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  loan?: Resolver<Maybe<ResolversTypes['Loan']>, ParentType, ContextType, RequireFields<QueryloanArgs, 'id' | 'subgraphError'>>;
  loans?: Resolver<Array<ResolversTypes['Loan']>, ParentType, ContextType, RequireFields<QueryloansArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  liquidityShop?: SubscriptionResolver<Maybe<ResolversTypes['LiquidityShop']>, "liquidityShop", ParentType, ContextType, RequireFields<SubscriptionliquidityShopArgs, 'id' | 'subgraphError'>>;
  liquidityShops?: SubscriptionResolver<Array<ResolversTypes['LiquidityShop']>, "liquidityShops", ParentType, ContextType, RequireFields<SubscriptionliquidityShopsArgs, 'skip' | 'first' | 'subgraphError'>>;
  protocolParams?: SubscriptionResolver<Array<ResolversTypes['ProtocolParams']>, "protocolParams", ParentType, ContextType, RequireFields<SubscriptionprotocolParamsArgs, 'skip' | 'first' | 'subgraphError'>>;
  erc20?: SubscriptionResolver<Maybe<ResolversTypes['Erc20']>, "erc20", ParentType, ContextType, RequireFields<Subscriptionerc20Args, 'id' | 'subgraphError'>>;
  erc20S?: SubscriptionResolver<Array<ResolversTypes['Erc20']>, "erc20S", ParentType, ContextType, RequireFields<Subscriptionerc20SArgs, 'skip' | 'first' | 'subgraphError'>>;
  nftCollection?: SubscriptionResolver<Maybe<ResolversTypes['NftCollection']>, "nftCollection", ParentType, ContextType, RequireFields<SubscriptionnftCollectionArgs, 'id' | 'subgraphError'>>;
  nftCollections?: SubscriptionResolver<Array<ResolversTypes['NftCollection']>, "nftCollections", ParentType, ContextType, RequireFields<SubscriptionnftCollectionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  loan?: SubscriptionResolver<Maybe<ResolversTypes['Loan']>, "loan", ParentType, ContextType, RequireFields<SubscriptionloanArgs, 'id' | 'subgraphError'>>;
  loans?: SubscriptionResolver<Array<ResolversTypes['Loan']>, "loans", ParentType, ContextType, RequireFields<SubscriptionloansArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
}>;

export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Erc20?: Erc20Resolvers<ContextType>;
  LiquidityShop?: LiquidityShopResolvers<ContextType>;
  Loan?: LoanResolvers<ContextType>;
  NftCollection?: NftCollectionResolvers<ContextType>;
  ProtocolParams?: ProtocolParamsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = NftyFinanceTypes.Context & BaseMeshContext;


const baseDir = pathModule.join(typeof __dirname === 'string' ? __dirname : '/', '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/nftyFinance/introspectionSchema":
      return Promise.resolve(importedModule$0) as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const nftyFinanceTransforms = [];
const additionalTypeDefs = [] as any[];
const nftyFinanceHandler = new GraphqlHandler({
              name: "nftyFinance",
              config: {"endpoint":"http://localhost:8000/subgraphs/name/nftyfinance-local"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("nftyFinance"),
              logger: logger.child("nftyFinance"),
              importFn,
            });
sources[0] = {
          name: 'nftyFinance',
          handler: nftyFinanceHandler,
          transforms: nftyFinanceTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      {
        document: ExploreCollectionsDocument,
        get rawSDL() {
          return printWithCache(ExploreCollectionsDocument);
        },
        location: 'ExploreCollectionsDocument.graphql'
      },{
        document: ExploreShopsDocument,
        get rawSDL() {
          return printWithCache(ExploreShopsDocument);
        },
        location: 'ExploreShopsDocument.graphql'
      },{
        document: RequestLoanDocument,
        get rawSDL() {
          return printWithCache(RequestLoanDocument);
        },
        location: 'RequestLoanDocument.graphql'
      },{
        document: ManageShopsDocument,
        get rawSDL() {
          return printWithCache(ManageShopsDocument);
        },
        location: 'ManageShopsDocument.graphql'
      },{
        document: LendingDashboardDocument,
        get rawSDL() {
          return printWithCache(LendingDashboardDocument);
        },
        location: 'LendingDashboardDocument.graphql'
      },{
        document: BorrowingDashboardDocument,
        get rawSDL() {
          return printWithCache(BorrowingDashboardDocument);
        },
        location: 'BorrowingDashboardDocument.graphql'
      },{
        document: MakePaymentDocument,
        get rawSDL() {
          return printWithCache(MakePaymentDocument);
        },
        location: 'MakePaymentDocument.graphql'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type ExploreCollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ExploreCollectionsQuery = { nftCollections: Array<(
    Pick<NftCollection, 'id'>
    & { liquidityShops: Array<Pick<LiquidityShop, 'id'>> }
  )> };

export type ExploreShopsQueryVariables = Exact<{
  nftCollectionAddress: Scalars['ID'];
}>;


export type ExploreShopsQuery = { nftCollection?: Maybe<(
    Pick<NftCollection, 'id'>
    & { liquidityShops: Array<(
      Pick<LiquidityShop, 'id' | 'name' | 'balance' | 'owner' | 'interestA' | 'interestB' | 'interestC'>
      & { erc20: Pick<Erc20, 'decimals'> }
    )> }
  )> };

export type RequestLoanQueryVariables = Exact<{
  liquidityShopId: Scalars['ID'];
  walletAddress: Scalars['Bytes'];
}>;


export type RequestLoanQuery = { liquidityShop?: Maybe<(
    Pick<LiquidityShop, 'name' | 'owner' | 'interestA' | 'interestB' | 'interestC' | 'balance' | 'maxOffer'>
    & { nftCollection: Pick<NftCollection, 'id'>, erc20: Pick<Erc20, 'id' | 'name' | 'symbol' | 'decimals'> }
  )> };

export type ManageShopsQueryVariables = Exact<{
  walletAddress: Scalars['Bytes'];
}>;


export type ManageShopsQuery = { liquidityShops: Array<(
    Pick<LiquidityShop, 'id' | 'name' | 'balance' | 'status'>
    & { nftCollection: Pick<NftCollection, 'id'>, erc20: Pick<Erc20, 'decimals'> }
  )> };

export type LendingDashboardQueryVariables = Exact<{
  walletAddress: Scalars['Bytes'];
}>;


export type LendingDashboardQuery = { loans: Array<(
    Pick<Loan, 'id' | 'borrower' | 'duration' | 'amount' | 'startTime' | 'status'>
    & { liquidityShop: { nftCollection: Pick<NftCollection, 'id'>, erc20: Pick<Erc20, 'decimals'> } }
  )> };

export type BorrowingDashboardQueryVariables = Exact<{
  walletAddress: Scalars['Bytes'];
}>;


export type BorrowingDashboardQuery = { loans: Array<(
    Pick<Loan, 'id' | 'lender' | 'duration' | 'amount' | 'startTime' | 'status'>
    & { liquidityShop: { nftCollection: Pick<NftCollection, 'id'>, erc20: Pick<Erc20, 'decimals'> } }
  )> };

export type MakePaymentQueryVariables = Exact<{
  loanId: Scalars['ID'];
}>;


export type MakePaymentQuery = { loan?: Maybe<(
    Pick<Loan, 'duration' | 'amount' | 'startTime' | 'remainder' | 'nftCollateralId'>
    & { liquidityShop: { nftCollection: Pick<NftCollection, 'id'>, erc20: Pick<Erc20, 'id' | 'decimals' | 'symbol'> } }
  )> };


export const ExploreCollectionsDocument = gql`
    query ExploreCollections {
  nftCollections {
    id
    liquidityShops {
      id
    }
  }
}
    ` as unknown as DocumentNode<ExploreCollectionsQuery, ExploreCollectionsQueryVariables>;
export const ExploreShopsDocument = gql`
    query ExploreShops($nftCollectionAddress: ID!) {
  nftCollection(id: $nftCollectionAddress) {
    id
    liquidityShops {
      id
      name
      balance
      owner
      interestA
      interestB
      interestC
      erc20 {
        decimals
      }
    }
  }
}
    ` as unknown as DocumentNode<ExploreShopsQuery, ExploreShopsQueryVariables>;
export const RequestLoanDocument = gql`
    query RequestLoan($liquidityShopId: ID!, $walletAddress: Bytes!) {
  liquidityShop(id: $liquidityShopId) {
    name
    owner
    interestA
    interestB
    interestC
    balance
    maxOffer
    nftCollection {
      id
    }
    erc20 {
      id
      name
      symbol
      decimals
    }
  }
}
    ` as unknown as DocumentNode<RequestLoanQuery, RequestLoanQueryVariables>;
export const ManageShopsDocument = gql`
    query ManageShops($walletAddress: Bytes!) {
  liquidityShops(where: {owner: $walletAddress}) {
    id
    name
    balance
    status
    nftCollection {
      id
    }
    erc20 {
      decimals
    }
  }
}
    ` as unknown as DocumentNode<ManageShopsQuery, ManageShopsQueryVariables>;
export const LendingDashboardDocument = gql`
    query LendingDashboard($walletAddress: Bytes!) {
  loans(where: {lender: $walletAddress}) {
    id
    borrower
    duration
    amount
    startTime
    status
    liquidityShop {
      nftCollection {
        id
      }
      erc20 {
        decimals
      }
    }
  }
}
    ` as unknown as DocumentNode<LendingDashboardQuery, LendingDashboardQueryVariables>;
export const BorrowingDashboardDocument = gql`
    query BorrowingDashboard($walletAddress: Bytes!) {
  loans(where: {borrower: $walletAddress}) {
    id
    lender
    duration
    amount
    startTime
    status
    liquidityShop {
      nftCollection {
        id
      }
      erc20 {
        decimals
      }
    }
  }
}
    ` as unknown as DocumentNode<BorrowingDashboardQuery, BorrowingDashboardQueryVariables>;
export const MakePaymentDocument = gql`
    query MakePayment($loanId: ID!) {
  loan(id: $loanId) {
    liquidityShop {
      nftCollection {
        id
      }
      erc20 {
        id
        decimals
        symbol
      }
    }
    duration
    amount
    startTime
    remainder
    nftCollateralId
  }
}
    ` as unknown as DocumentNode<MakePaymentQuery, MakePaymentQueryVariables>;








export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    ExploreCollections(variables?: ExploreCollectionsQueryVariables, options?: C): Promise<ExploreCollectionsQuery> {
      return requester<ExploreCollectionsQuery, ExploreCollectionsQueryVariables>(ExploreCollectionsDocument, variables, options) as Promise<ExploreCollectionsQuery>;
    },
    ExploreShops(variables: ExploreShopsQueryVariables, options?: C): Promise<ExploreShopsQuery> {
      return requester<ExploreShopsQuery, ExploreShopsQueryVariables>(ExploreShopsDocument, variables, options) as Promise<ExploreShopsQuery>;
    },
    RequestLoan(variables: RequestLoanQueryVariables, options?: C): Promise<RequestLoanQuery> {
      return requester<RequestLoanQuery, RequestLoanQueryVariables>(RequestLoanDocument, variables, options) as Promise<RequestLoanQuery>;
    },
    ManageShops(variables: ManageShopsQueryVariables, options?: C): Promise<ManageShopsQuery> {
      return requester<ManageShopsQuery, ManageShopsQueryVariables>(ManageShopsDocument, variables, options) as Promise<ManageShopsQuery>;
    },
    LendingDashboard(variables: LendingDashboardQueryVariables, options?: C): Promise<LendingDashboardQuery> {
      return requester<LendingDashboardQuery, LendingDashboardQueryVariables>(LendingDashboardDocument, variables, options) as Promise<LendingDashboardQuery>;
    },
    BorrowingDashboard(variables: BorrowingDashboardQueryVariables, options?: C): Promise<BorrowingDashboardQuery> {
      return requester<BorrowingDashboardQuery, BorrowingDashboardQueryVariables>(BorrowingDashboardDocument, variables, options) as Promise<BorrowingDashboardQuery>;
    },
    MakePayment(variables: MakePaymentQueryVariables, options?: C): Promise<MakePaymentQuery> {
      return requester<MakePaymentQuery, MakePaymentQueryVariables>(MakePaymentDocument, variables, options) as Promise<MakePaymentQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;