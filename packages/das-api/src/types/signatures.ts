/**
 * A transaction signature associated with an asset.
 *
 * The DAS API returns these as a `[signature, type]` tuple.
 */
export type DasApiAssetSignature = [signature: string, type: string];

/**
 * The response returned by `getSignaturesForAsset`.
 */
export interface GetSignaturesForAssetResponse {
  /** The total number of signatures matching the query. */
  total: number;
  /** The limit that was used to build this page. */
  limit: number;
  /** The page number of this result. */
  page?: number;
  /** The cursor pointing before this page. */
  before?: string;
  /** The cursor pointing after this page. */
  after?: string;
  /** The id of the asset the signatures belong to. */
  id?: string;
  /** The signatures, as `[signature, type]` tuples. */
  items: DasApiAssetSignature[];
}
