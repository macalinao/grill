import type { Address } from "@solana/kit";
import { useCallback } from "react";
import { useGrillContext } from "../contexts/grill-context.js";

/**
 * Returns a function that force-refreshes the given accounts.
 *
 * This is convenience sugar for use inside components. You do not need a hook
 * to refresh an account: React Query is the single source of truth for account
 * data, so `createAccountQueryKey(address)` + `queryClient.invalidateQueries`
 * works from anywhere you have a `QueryClient` — no React context required.
 * Reach for this hook when you're already in a component and want the batching
 * to be handled for you.
 *
 * Passing several addresses lets their reads coalesce into a single batched RPC
 * call. Only the addresses you pass are refreshed — this never clears the whole
 * cache.
 *
 * Note that transactions sent via {@link useSendTX} already refetch every
 * writable account automatically, so you often don't need this at all.
 *
 * To refresh a **token balance** (from `useTokenBalance`), pass the token
 * account address — the balance is derived from that account plus its mint's
 * token info.
 *
 * @example
 * ```tsx
 * const refetchAccounts = useRefetchAccounts();
 *
 * async function onDeposit() {
 *   await sendTX(...);
 *   // Refresh balances that aren't writable accounts of the tx:
 *   await refetchAccounts([tokenAccountA, tokenAccountB]);
 * }
 * ```
 *
 * @returns A function that refetches the given addresses.
 */
export const useRefetchAccounts = (): ((
  addresses: Address[],
) => Promise<void>) => {
  const { refetchAccounts } = useGrillContext();
  return refetchAccounts;
};

/**
 * Returns a function that force-refreshes a single account.
 *
 * The singular counterpart to {@link useRefetchAccounts} for the common
 * one-account case — refreshing a balance after a transaction, a manual refresh
 * button, etc.
 *
 * As with the plural hook, this is only sugar: outside a component, use
 * `createAccountQueryKey(address)` with `queryClient.invalidateQueries`.
 *
 * To refresh a **token balance** (from `useTokenBalance`), pass the token
 * account address — the balance is derived from that account plus its mint's
 * token info.
 *
 * When refreshing several accounts at once, prefer {@link useRefetchAccounts}
 * so the reads coalesce into a single batched RPC call.
 *
 * @example
 * ```tsx
 * const refetchAccount = useRefetchAccount();
 *
 * async function onDeposit() {
 *   await sendTX(...);
 *   await refetchAccount(tokenAccountAddress);
 * }
 * ```
 *
 * @returns A function that clears the cache for the given address and refetches it.
 */
export const useRefetchAccount = (): ((address: Address) => Promise<void>) => {
  const { refetchAccounts } = useGrillContext();
  return useCallback(
    (address: Address) => refetchAccounts([address]),
    [refetchAccounts],
  );
};
