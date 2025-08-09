import { createBatchAccountsLoader } from "@macalinao/solana-batch-accounts-loader";
import { useQueryClient } from "@tanstack/react-query";
import type { Address } from "gill";
import { useSolanaClient } from "gill-react";
import type { FC } from "react";
import { useCallback, useMemo } from "react";
import { GrillContext } from "../contexts/grill-context.js";
import type { GrillProviderProps } from "../types.js";
import { reloadAccounts as doReloadAccounts } from "../utils/reloadAccounts.js";

/**
 * Provider component for Solana account batching functionality.
 * Creates and provides a batch account loader for efficient Solana account fetching.
 * This provider integrates with gill-react's useSolanaClient hook to access the RPC client.
 */
export const GrillProvider: FC<GrillProviderProps> = ({
  children,
  maxBatchSize = 99,
  batchDurationMs = 10,
  onTransactionStatusEvent = (e) => {
    console.log(e);
  },
}) => {
  const { rpc } = useSolanaClient();
  const queryClient = useQueryClient();

  const accountLoader = useMemo(
    () =>
      createBatchAccountsLoader({
        rpc,
        maxBatchSize,
        batchDurationMs,
      }),
    [rpc, maxBatchSize, batchDurationMs],
  );

  const reloadAccounts = useCallback(
    async (addresses: Address[]) => {
      await doReloadAccounts({
        queryClient,
        accountLoader,
        addresses,
      });
    },
    [queryClient, accountLoader],
  );

  return (
    <GrillContext.Provider
      value={{
        accountLoader,
        reloadAccounts,
        internal_onTransactionStatusEvent: onTransactionStatusEvent,
      }}
    >
      {children}
    </GrillContext.Provider>
  );
};
