import type { Address } from "@solana/kit";
import type { JsonValue } from "./json-value.js";

/**
 * A token account returned by `getTokenAccounts` (Helius extension).
 */
export interface DasApiTokenAccount {
  /** The address of the token account. */
  address: Address;
  /** The mint of the token account. */
  mint: Address;
  /** The owner of the token account. */
  owner: Address;
  /** The token amount held, in base units, as a string. */
  amount: number;
  /** The delegated amount, in base units. */
  delegated_amount?: number;
  /** Whether the token account is frozen. */
  frozen: boolean;
  /** The delegate of the token account, if any. */
  delegate?: Address | null;
  /** The close authority of the token account, if any. */
  close_authority?: Address | null;
  /** The token extensions data, for Token-2022 accounts. */
  token_extensions?: Record<string, JsonValue>;
}

/**
 * The response returned by `getTokenAccounts` (Helius extension).
 */
export interface GetTokenAccountsResponse {
  /** The total number of token accounts matching the query. */
  total: number;
  /** The limit that was used to build this page. */
  limit: number;
  /** The page number of this result. */
  page?: number;
  /** The cursor pointing to the next page, for cursor-based pagination. */
  cursor?: string;
  /** The cursor pointing before this page. */
  before?: string;
  /** The cursor pointing after this page. */
  after?: string;
  /** The token accounts in this page. */
  token_accounts: DasApiTokenAccount[];
}
