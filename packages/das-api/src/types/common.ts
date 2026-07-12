/**
 * Common shared types used across the DAS API.
 *
 * These types are ported from the Metaplex Digital Asset Standard API and the
 * Helius DAS API superset, adapted to use `@solana/kit` primitives instead of
 * `umi`. All addresses are typed as the branded `Address` type from
 * `@solana/kit`.
 */

/**
 * The high-level interface (kind) of an asset as reported by the DAS indexer.
 */
export type DasApiAssetInterface =
  | "V1_NFT"
  | "V1_PRINT"
  | "LEGACY_NFT"
  | "V2_NFT"
  | "FungibleAsset"
  | "FungibleToken"
  | "Custom"
  | "Identity"
  | "Executable"
  | "ProgrammableNFT"
  | "MplCoreAsset"
  | "MplCoreCollection";

/**
 * The scope of an on-chain authority over an asset.
 */
export type DasApiAuthorityScope =
  | "full"
  | "royalty"
  | "metadata"
  | "extension";

/**
 * The key used to group assets. Currently only `"collection"` is supported.
 */
export type DasApiPropGroupKey = "collection";

/**
 * The ownership model of an asset.
 */
export type DasApiOwnershipModel = "single" | "token";

/**
 * The royalty model of an asset.
 */
export type DasApiRoyaltyModel = "creators" | "fanout" | "single";

/**
 * The use method configured for an asset.
 */
export type DasApiUseMethod = "burn" | "multiple" | "single";

/**
 * The type of token to filter for when searching assets.
 *
 * Uses the Helius DAS API casing.
 */
export type DasApiTokenType =
  | "fungible"
  | "nonFungible"
  | "regularNft"
  | "compressedNft"
  | "all";

/**
 * The field to sort assets by.
 */
export type DasApiAssetSortByField =
  | "created"
  | "updated"
  | "recent_action"
  | "id"
  | "none";

/**
 * The direction to sort assets in.
 */
export type DasApiAssetSortDirection = "asc" | "desc";

/**
 * Sorting criteria for paginated asset queries.
 */
export interface DasApiAssetSorting {
  /** The field to sort by. */
  sortBy: DasApiAssetSortByField;
  /** The direction to sort in. */
  sortDirection: DasApiAssetSortDirection;
}

/**
 * Pagination parameters shared by the list/search style methods.
 *
 * Use either `page` OR the cursor-style `before`/`after`/`cursor` parameters,
 * but not both at the same time.
 */
export interface DasApiPagination {
  /** Sorting criteria for the results. */
  sortBy?: DasApiAssetSorting;
  /** The maximum number of assets to retrieve (max 1000). */
  limit?: number;
  /** The index of the page to retrieve. The first page has index `1`. */
  page?: number;
  /** Retrieve assets before the specified `id` value. */
  before?: string;
  /** Retrieve assets after the specified `id` value. */
  after?: string;
  /** An opaque cursor for cursor-based pagination. */
  cursor?: string;
}

/**
 * Display options controlling which extra data the indexer returns.
 *
 * The set of applicable options depends on the method: `getAsset`/`getAssetBatch`
 * accept these under an `options` key, while the list/search methods accept them
 * under a `displayOptions` key. Not every option is meaningful for every method.
 */
export interface DasApiDisplayOptions {
  /** Include assets that belong to unverified collections. */
  showUnverifiedCollections?: boolean;
  /** Include full collection metadata in the `grouping` field. */
  showCollectionMetadata?: boolean;
  /** Include fungible tokens in the results. */
  showFungible?: boolean;
  /** Include inscription and SPL-20 data. */
  showInscription?: boolean;
  /** Include the owner's native SOL balance (list methods only). */
  showNativeBalance?: boolean;
  /** Include token accounts with a zero balance. */
  showZeroBalance?: boolean;
  /** Include a grand total count across all pages (list methods only). */
  showGrandTotal?: boolean;
}
