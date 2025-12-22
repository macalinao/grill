import type {
  GetExplorerLinkFunction,
  SolanaCluster,
} from "@macalinao/gill-extra";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "gill";
import type { FC, ReactNode } from "react";
import type { TransactionStatusEventCallback } from "../types.js";
import { useSolanaClient } from "@gillsdk/react";
import { createBatchAccountsLoader } from "@macalinao/solana-batch-accounts-loader";
import { useQueryClient } from "@tanstack/react-query";
import { getExplorerLink as defaultGetExplorerLink } from "gill";
import { useCallback, useMemo } from "react";
import { GrillContext } from "../contexts/grill-context.js";
import { useKitWallet } from "../hooks/use-kit-wallet.js";
import { createSendTX } from "../utils/internal/create-send-tx.js";
import { refetchAccounts as doRefetchAccounts } from "../utils/refetch-accounts.js";
import { SubscriptionProvider } from "./subscription-provider.js";

export interface GrillHeadlessProviderProps {
  children: ReactNode;
  /** Maximum number of accounts to batch in a single request. Defaults to 99. */
  maxBatchSize?: number;
  /** Duration in milliseconds to wait before sending a batch. Defaults to 10ms. */
  batchDurationMs?: number;
  onTransactionStatusEvent?: TransactionStatusEventCallback;
  /** Custom function to get explorer link for a transaction signature. Defaults to gill's getExplorerLink. */
  getExplorerLink?: GetExplorerLinkFunction;
  /**
   * Static token information that overrides whatever is on-chain.
   * useTokenInfo will load these instantly without fetching from chain.
   */
  staticTokenInfo?: TokenInfo[];
  /**
   * Whether to fetch from the certified token list as a fallback when token metadata is missing.
   * Defaults to true for backwards compatibility.
   */
  fetchFromCertifiedTokenList?: boolean;
  /**
   * The RPC URL used for creating transaction inspector URLs in error logs.
   * This is needed to generate correct inspector URLs for custom RPC endpoints.
   * If using localhost, this should be "http://localhost:8899" (or your local RPC port).
   */
  rpcUrl?: string;
  /**
   * The Solana cluster for explorer links. Defaults to "mainnet-beta".
   * Use "localnet" when developing locally.
   */
  cluster?: SolanaCluster;
}

/**
 * Headless provider component for Solana account batching functionality.
 * Creates and provides a batch account loader for efficient Solana account fetching.
 * This provider integrates with @gillsdk/react's useSolanaClient hook to access the RPC client.
 *
 * For UI integration with toast notifications, use GrillProvider instead.
 *
 * @example
 * ```tsx
 * <GrillHeadlessProvider>
 *   <App />
 * </GrillHeadlessProvider>
 * ```
 */
export const GrillHeadlessProvider: FC<GrillHeadlessProviderProps> = ({
  children,
  maxBatchSize = 99,
  batchDurationMs = 10,
  onTransactionStatusEvent = (e) => {
    console.log(e);
  },
  getExplorerLink = defaultGetExplorerLink,
  staticTokenInfo = [],
  fetchFromCertifiedTokenList = true,
  rpcUrl,
  cluster = "mainnet-beta",
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
        rpcUrl,
        cluster,
      }),
    [
      signer,
      rpc,
      refetchAccounts,
      onTransactionStatusEvent,
      getExplorerLink,
      rpcUrl,
      cluster,
    ],
  );

  const staticTokenInfoMap = useMemo(
    () => new Map(staticTokenInfo.map((info) => [info.mint, info])),
    [staticTokenInfo],
  );

  return (
    <SubscriptionProvider>
      <GrillContext.Provider
        value={{
          accountLoader,
          refetchAccounts,
          sendTX,
          getExplorerLink,
          staticTokenInfo: staticTokenInfoMap,
          fetchFromCertifiedTokenList,
        }}
      >
        {children}
      </GrillContext.Provider>
    </SubscriptionProvider>
  );
};
