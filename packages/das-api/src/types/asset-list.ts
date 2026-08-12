import type { DasApiAsset } from "./asset.js";

/**
 * The owner's native SOL balance, returned when `showNativeBalance` is enabled
 * (Helius extension).
 */
export interface DasApiNativeBalance {
  /** The native balance, in lamports. */
  lamports: number;
  /** The price per SOL, if pricing data is available. */
  price_per_sol?: number | undefined;
  /** The total value of the native balance. */
  total_price?: number | undefined;
}

/**
 * A paginated list of assets returned by the list/search style methods.
 */
export interface DasApiAssetList {
  /** The total number of assets matching the query. */
  total: number;
  /** The limit that was used to build this page. */
  limit: number;
  /** The page number of this result, for page-based pagination. */
  page?: number | undefined;
  /** The cursor pointing before this page, for cursor-based pagination. */
  before?: string | undefined;
  /** The cursor pointing after this page, for cursor-based pagination. */
  after?: string | undefined;
  /** An opaque cursor for cursor-based pagination. */
  cursor?: string | undefined;
  /** The assets in this page. */
  items: DasApiAsset[];
  /** The owner's native balance, when `showNativeBalance` is enabled. */
  nativeBalance?: DasApiNativeBalance | undefined;
  /** The grand total across all pages, when `showGrandTotal` is enabled. */
  grand_total?: number | undefined;
}
