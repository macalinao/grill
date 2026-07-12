import type { Address } from "@solana/kit";

/**
 * A single printed edition of a master edition NFT (Helius extension).
 */
export interface DasApiNftEdition {
  /** The mint of the edition. */
  mint: Address;
  /** The address of the edition account. */
  edition_address: Address;
  /** The edition number. */
  edition: number;
}

/**
 * The response returned by `getNftEditions` (Helius extension).
 */
export interface GetNftEditionsResponse {
  /** The total number of editions matching the query. */
  total: number;
  /** The limit that was used to build this page. */
  limit: number;
  /** The page number of this result. */
  page?: number;
  /** The cursor pointing before this page. */
  before?: string;
  /** The cursor pointing after this page. */
  after?: string;
  /** The address of the master edition. */
  master_edition_address: Address;
  /** The mint of the master edition supply. */
  supply: number;
  /** The maximum supply of the master edition, if capped. */
  max_supply?: number;
  /** The printed editions in this page. */
  editions: DasApiNftEdition[];
}
