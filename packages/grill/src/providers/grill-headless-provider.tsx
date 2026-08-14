import type {
  GetExplorerLinkFunction,
  LogLevel,
  SolanaCluster,
  TokenMetadataValidator,
} from "@macalinao/gill-extra";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Address } from "gill";
import type { FC, ReactNode } from "react";
import type {
  TransactionStatusEvent,
  TransactionStatusEventCallback,
} from "../types.js";
import { useSolanaClient } from "@gillsdk/react";
import {
  createLogger,
  DEFAULT_LOG_LEVEL,
  defaultTokenMetadataValidator,
} from "@macalinao/gill-extra";
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
   * Validates the JSON fetched from a token's metadata URI.
   *
   * Defaults to `defaultTokenMetadataValidator`, a dependency-free shallow
   * check. Pass `zodTokenMetadataValidator` from `@macalinao/zod-solana` to
   * validate the full Metaplex schema instead — note that doing so pulls zod
   * into your bundle.
   */
  validateTokenMetadata?: TokenMetadataValidator;
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
  /**
   * How much the library is allowed to write to the console.
   *
   * Each level enables itself and everything more severe, so `"warn"` emits
   * warnings and errors. `"off"` silences the library completely.
   *
   * @default "info"
   */
  logLevel?: LogLevel;
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
  onTransactionStatusEvent,
  getExplorerLink = defaultGetExplorerLink,
  staticTokenInfo = [],
  fetchFromCertifiedTokenList = true,
  validateTokenMetadata = defaultTokenMetadataValidator,
  rpcUrl,
  cluster = "mainnet-beta",
  logLevel = DEFAULT_LOG_LEVEL,
}) => {
  const { rpc } = useSolanaClient();
  const queryClient = useQueryClient();
  const { signer } = useKitWallet();

  const logger = useMemo(() => createLogger(logLevel), [logLevel]);

  // Without a handler, transaction events are dumped to the console at the
  // debug level -- they are a firehose, so they stay quiet by default.
  const handleTransactionStatusEvent: TransactionStatusEventCallback = useMemo(
    () =>
      onTransactionStatusEvent ??
      ((event: TransactionStatusEvent) => {
        logger.debug(event);
      }),
    [onTransactionStatusEvent, logger],
  );

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
        onTransactionStatusEvent: handleTransactionStatusEvent,
        getExplorerLink,
        rpcUrl,
        cluster,
        logger,
      }),
    [
      signer,
      rpc,
      refetchAccounts,
      handleTransactionStatusEvent,
      getExplorerLink,
      rpcUrl,
      cluster,
      logger,
    ],
  );

  const staticTokenInfoMap = useMemo(
    () => new Map(staticTokenInfo.map((info) => [info.mint, info])),
    [staticTokenInfo],
  );

  return (
    <SubscriptionProvider logger={logger}>
      <GrillContext.Provider
        value={{
          accountLoader,
          refetchAccounts,
          sendTX,
          getExplorerLink,
          staticTokenInfo: staticTokenInfoMap,
          fetchFromCertifiedTokenList,
          validateTokenMetadata,
          logger,
        }}
      >
        {children}
      </GrillContext.Provider>
    </SubscriptionProvider>
  );
};
