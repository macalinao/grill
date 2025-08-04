import { createBatchAccountsLoader } from "@macalinao/solana-batch-accounts-loader";
import type { FC } from "react";
import { useMemo } from "react";
import { useSolanaClient } from "gill-react";
import { SolanaAccountContext } from "./context.js";
import type { GrillProviderProps } from "./types.js";

/**
 * Provider component for Solana account batching functionality.
 * Creates and provides a batch account loader for efficient Solana account fetching.
 * This provider integrates with gill-react's useSolanaClient hook to access the RPC client.
 */
export const GrillProvider: FC<GrillProviderProps> = ({
  children,
  maxBatchSize = 99,
  batchDurationMs = 10,
}) => {
  const solanaClient = useSolanaClient();
  const rpc = solanaClient.rpc;

  const accountLoader = useMemo(
    () =>
      createBatchAccountsLoader({
        rpc,
        maxBatchSize,
        batchDurationMs,
      }),
    [rpc, maxBatchSize, batchDurationMs]
  );

  return (
    <SolanaAccountContext.Provider value={{ accountLoader }}>
      {children}
    </SolanaAccountContext.Provider>
  );
};