import type { Address } from "@solana/kit";
import type {
  DasApiAssetInterface,
  DasApiDisplayOptions,
  DasApiOwnershipModel,
  DasApiPagination,
  DasApiPropGroupKey,
  DasApiRoyaltyModel,
  DasApiTokenType,
} from "./common.js";

/**
 * Input for `getAsset`.
 */
export interface GetAssetRequest {
  /** The id (mint/asset address) of the asset to fetch. */
  id: Address;
  /** Display options for the query. */
  options?: DasApiDisplayOptions;
}

/**
 * Input for `getAssetBatch`.
 */
export interface GetAssetBatchRequest {
  /** The ids of the assets to fetch (max 1000). */
  ids: Address[];
  /** Display options for the query. */
  options?: DasApiDisplayOptions;
}

/**
 * Input for `getAssetProof`.
 */
export interface GetAssetProofRequest {
  /** The id of the compressed asset to fetch a proof for. */
  id: Address;
}

/**
 * Input for `getAssetProofBatch`.
 */
export interface GetAssetProofBatchRequest {
  /** The ids of the compressed assets to fetch proofs for. */
  ids: Address[];
}

/**
 * Input for `getAssetsByOwner`.
 */
export interface GetAssetsByOwnerRequest extends DasApiPagination {
  /** The address of the owner of the assets. */
  ownerAddress: Address;
  /** Display options for the query. */
  displayOptions?: DasApiDisplayOptions;
}

/**
 * Input for `getAssetsByAuthority`.
 */
export interface GetAssetsByAuthorityRequest extends DasApiPagination {
  /** The address of the authority of the assets. */
  authorityAddress: Address;
  /** Display options for the query. */
  displayOptions?: DasApiDisplayOptions;
}

/**
 * Input for `getAssetsByCreator`.
 */
export interface GetAssetsByCreatorRequest extends DasApiPagination {
  /** The address of the creator of the assets. */
  creatorAddress: Address;
  /** Whether to only return assets where the creator is verified. */
  onlyVerified?: boolean;
  /** Display options for the query. */
  displayOptions?: DasApiDisplayOptions;
}

/**
 * Input for `getAssetsByGroup`.
 */
export interface GetAssetsByGroupRequest extends DasApiPagination {
  /** The key of the group (e.g. `"collection"`). */
  groupKey: DasApiPropGroupKey;
  /** The value of the group (e.g. the collection address). */
  groupValue: string;
  /** Display options for the query. */
  displayOptions?: DasApiDisplayOptions;
}

/**
 * Input for `searchAssets`.
 */
export interface SearchAssetsRequest extends DasApiPagination {
  /** Whether the search criteria should be negated. */
  negate?: boolean;
  /** Whether all (`"all"`) or any (`"any"`) of the criteria must match. */
  conditionType?: "all" | "any";
  /** The interface (kind) of the asset. */
  interface?: DasApiAssetInterface;
  /** The address of the owner. */
  ownerAddress?: Address;
  /** The type of ownership. */
  ownerType?: DasApiOwnershipModel;
  /** The address of the creator. */
  creatorAddress?: Address;
  /** Whether the creator must be verified. */
  creatorVerified?: boolean;
  /** The address of the authority. */
  authorityAddress?: Address;
  /** The grouping (`[key, value]`) pair. */
  grouping?: [key: string, value: string];
  /** The address of the delegate. */
  delegate?: Address;
  /** Whether the asset is frozen. */
  frozen?: boolean;
  /** The supply of the asset. */
  supply?: number;
  /** The address of the supply mint. */
  supplyMint?: Address;
  /** Whether the asset is compressed. */
  compressed?: boolean;
  /** Whether the asset is compressible. */
  compressible?: boolean;
  /** The royalty model to filter by. */
  royaltyTargetType?: DasApiRoyaltyModel;
  /** The target address for royalties. */
  royaltyTarget?: Address;
  /** The royalty amount to filter by. */
  royaltyAmount?: number;
  /** Whether the asset is burnt. */
  burnt?: boolean;
  /** The value of the JSON URI. */
  jsonUri?: string;
  /** The name of the asset. */
  name?: string;
  /** The type of token to filter for. */
  tokenType?: DasApiTokenType;
  /** Display options for the query. */
  displayOptions?: DasApiDisplayOptions;
}

/**
 * Input for `getSignaturesForAsset`.
 *
 * Provide either an asset `id`, or a `tree` together with a `leafIndex`.
 */
export type GetSignaturesForAssetRequest = {
  /** The maximum number of signatures to retrieve. */
  limit?: number;
  /** The page number of the signatures. */
  page?: number;
  /** Retrieve signatures before the specified value. */
  before?: string;
  /** Retrieve signatures after the specified value. */
  after?: string;
  /** An opaque cursor for cursor-based pagination. */
  cursor?: string;
  /** The sort direction of the signatures. */
  sortDirection?: "asc" | "desc";
} & (
  | {
      /** The id of the asset to retrieve signatures for. */
      id: Address;
      tree?: never;
      leafIndex?: never;
    }
  | {
      /** The address of the merkle tree. */
      tree: Address;
      /** The index of the leaf within the tree. */
      leafIndex: number;
      id?: never;
    }
);

/**
 * Options for `getTokenAccounts`.
 */
export interface GetTokenAccountsOptions {
  /** Include token accounts with a zero balance. */
  showZeroBalance?: boolean;
}

/**
 * Input for `getTokenAccounts` (Helius extension).
 *
 * At least one of `owner` or `mint` should be provided.
 */
export interface GetTokenAccountsRequest {
  /** The owner whose token accounts to retrieve. */
  owner?: Address;
  /** The mint whose token accounts to retrieve. */
  mint?: Address;
  /** The page number to retrieve. */
  page?: number;
  /** The maximum number of token accounts to retrieve. */
  limit?: number;
  /** An opaque cursor for cursor-based pagination. */
  cursor?: string;
  /** Retrieve token accounts before the specified value. */
  before?: string;
  /** Retrieve token accounts after the specified value. */
  after?: string;
  /** Additional options. */
  options?: GetTokenAccountsOptions;
}

/**
 * Input for `getNftEditions` (Helius extension).
 */
export interface GetNftEditionsRequest {
  /** The mint of the master edition. */
  mint: Address;
  /** The page number to retrieve. */
  page?: number;
  /** The maximum number of editions to retrieve. */
  limit?: number;
}
