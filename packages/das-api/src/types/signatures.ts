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
  page?: number | undefined;
  /** The cursor pointing before this page. */
  before?: string | undefined;
  /** The cursor pointing after this page. */
  after?: string | undefined;
  /** The id of the asset the signatures belong to. */
  id?: string | undefined;
  /** The signatures, as `[signature, type]` tuples. */
  items: DasApiAssetSignature[];
}
