import { createBatchAccountsLoader } from "@macalinao/solana-batch-accounts-loader";
import { useQueryClient } from "@tanstack/react-query";
import type { Address } from "gill";
import { getExplorerLink as defaultGetExplorerLink } from "gill";
import { useSolanaClient } from "gill-react";
import type { FC, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type { GetExplorerLinkFunction } from "../contexts/grill-context.js";
import { GrillContext } from "../contexts/grill-context.js";
import { useKitWallet } from "../hooks/use-kit-wallet.js";
import type { TransactionStatusEventCallback } from "../types.js";
import { createSendTX } from "../utils/internal/create-send-tx.js";
import { refetchAccounts as doRefetchAccounts } from "../utils/refetch-accounts.js";

export interface GrillHeadlessProviderProps {
  children: ReactNode;
  /** Maximum number of accounts to batch in a single request. Defaults to 99. */
  maxBatchSize?: number;
  /** Duration in milliseconds to wait before sending a batch. Defaults to 10ms. */
  batchDurationMs?: number;
  onTransactionStatusEvent?: TransactionStatusEventCallback;
  /** Custom function to get explorer link for a transaction signature. Defaults to gill's getExplorerLink. */
  getExplorerLink?: GetExplorerLinkFunction;
}

/**
 * Headless provider component for Solana account batching functionality.
 * Creates and provides a batch account loader for efficient Solana account fetching.
 * This provider integrates with gill-react's useSolanaClient hook to access the RPC client.
 *
 * For UI integration with toast notifications, use GrillProvider instead.
 */
export const GrillHeadlessProvider: FC<GrillHeadlessProviderProps> = ({
  children,
  maxBatchSize = 99,
  batchDurationMs = 10,
  onTransactionStatusEvent = (e) => {
    console.log(e);
  },
  getExplorerLink = defaultGetExplorerLink,
}) => {
  const { rpc } = useSolanaClient();
  const queryClient = useQueryClient();
  const { signer } = useKitWallet();

  const accountLoader = useMemo(
    () =>
      createBatchAccountsLoader({
        rpc,
        maxBatchSize,
        batchDurationMs,
      }),
    [rpc, maxBatchSize, batchDurationMs],
  );

  const refetchAccounts = useCallback(
    async (addresses: Address[]) => {
      await doRefetchAccounts({
        queryClient,
        accountLoader,
        addresses,
      });
    },
    [queryClient, accountLoader],
  );

  const sendTX = useMemo(
    () =>
      createSendTX({
        signer,
        rpc,
        refetchAccounts,
        onTransactionStatusEvent,
        getExplorerLink,
      }),
    [signer, rpc, refetchAccounts, onTransactionStatusEvent, getExplorerLink],
  );

  return (
    <GrillContext.Provider
      value={{
        accountLoader,
        refetchAccounts,
        sendTX,
        getExplorerLink,
      }}
    >
      {children}
    </GrillContext.Provider>
  );
};
