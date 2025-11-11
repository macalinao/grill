import type { DataLoader } from "@macalinao/dataloader-es";
import type {
  GetExplorerLinkFunction,
  SendTXFunction,
} from "@macalinao/gill-extra";
import type { TokenInfo } from "@macalinao/token-utils";
import type { Address, EncodedAccount } from "@solana/kit";
import { createContext, useContext } from "react";

/**
 * Context value interface for SolanaAccountProvider.
 * Provides access to a batch account loader for efficient Solana account fetching.
 */
export interface GrillContextValue {
  /** DataLoader instance for batching and caching Solana account requests */
  accountLoader: DataLoader<Address, EncodedAccount | null>;
  /**
   * Refetches the given accounts.
   * @param addresses
   * @returns
   */
  refetchAccounts: (addresses: Address[]) => Promise<void>;

  /**
   * Function to send transactions with batching and confirmation
   */
  sendTX: SendTXFunction;

  /**
   * Function to get explorer link for a transaction signature
   */
  getExplorerLink: GetExplorerLinkFunction;

  /**
   * Static token information map where key is mint address.
   * This overrides whatever is on-chain, and useTokenInfo will load it instantly.
   */
  staticTokenInfo: ReadonlyMap<Address, TokenInfo>;

  /**
   * Whether to fetch from the certified token list as a fallback.
   * Defaults to true for backwards compatibility.
   */
  fetchFromCertifiedTokenList: boolean;
}

/**
 * React context for Solana account provider functionality.
 * Provides access to batch account loading capabilities throughout the component tree.
 */
export const GrillContext: React.Context<GrillContextValue | null> =
  createContext<GrillContextValue | null>(null);

/**
 * Hook to access the SolanaAccount context.
 * Must be used within a SolanaAccountProvider component tree.
 *
 * @returns The SolanaAccount context value containing the account loader
 * @throws Error if used outside of a SolanaAccountProvider
 */
export const useGrillContext = (): GrillContextValue => {
  const context = useContext(GrillContext);
  if (!context) {
    throw new Error("useGrillContext must be used within a GrillProvider");
  }
  return context;
};
