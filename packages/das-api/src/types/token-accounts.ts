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
  delegated_amount?: number | undefined;
  /** Whether the token account is frozen. */
  frozen: boolean;
  /** The delegate of the token account, if any. */
  delegate?: Address | null | undefined;
  /** The close authority of the token account, if any. */
  close_authority?: Address | null | undefined;
  /** The token extensions data, for Token-2022 accounts. */
  token_extensions?: Record<string, JsonValue> | undefined;
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
  page?: number | undefined;
  /** The cursor pointing to the next page, for cursor-based pagination. */
  cursor?: string | undefined;
  /** The cursor pointing before this page. */
  before?: string | undefined;
  /** The cursor pointing after this page. */
  after?: string | undefined;
  /** The token accounts in this page. */
  token_accounts: DasApiTokenAccount[];
}
