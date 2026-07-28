import type { Address } from "@solana/kit";

export const GRILL_REACT_QUERY_NAMESPACE = "solana" as const;

// Type definitions for query keys
export type AccountQueryKey = readonly ["solana", "account", Address];
export type TokenInfoQueryKey = readonly [
  "solana",
  "tokenInfo",
  Address | null | undefined,
];
export type PdaQueryKey<TArgs> = readonly [
  "solana",
  "pda",
  string,
  TArgs | null | undefined,
];

/**
 * Create a query key for the account query.
 *
 * This is the canonical way to target an account in the React Query cache. It's
 * a plain function, not a hook, so you can force a refresh from anywhere you
 * have a `QueryClient` — a mutation callback, an event handler, a service
 * module — with no React context involved:
 *
 * ```ts
 * await queryClient.invalidateQueries({
 *   queryKey: createAccountQueryKey(address),
 *   exact: true,
 * });
 * ```
 *
 * React Query is the single source of truth for account data: grill's
 * DataLoader only coalesces concurrent requests within its batch window and
 * retains nothing afterwards, so an invalidated query really does refetch from
 * the RPC.
 *
 * @param address - The address of the account
 * @returns The query key
 */
export const createAccountQueryKey = (address: Address): AccountQueryKey =>
  [GRILL_REACT_QUERY_NAMESPACE, "account", address] as const;

/**
 * Create a query key for token info query
 * @param mint - The mint address
 * @returns The query key
 */
export const createTokenInfoQueryKey = (
  mint: Address | null | undefined,
): TokenInfoQueryKey =>
  [GRILL_REACT_QUERY_NAMESPACE, "tokenInfo", mint] as const;

/**
 * Create a query key for PDA queries
 * @param queryKeyPrefix - The PDA type prefix
 * @param args - The arguments for the PDA
 * @returns The query key
 */
export const createPdaQueryKey = <TArgs>(
  queryKeyPrefix: string,
  args: TArgs | null | undefined,
): PdaQueryKey<TArgs> =>
  [GRILL_REACT_QUERY_NAMESPACE, "pda", queryKeyPrefix, args] as const;
