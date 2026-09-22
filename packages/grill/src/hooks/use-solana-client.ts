import type { SolanaClient } from "@macalinao/gill-extra";
import { useContext } from "react";
import { SolanaClientContext } from "../contexts/solana-client-context.js";

/**
 * Hook to access the {@link SolanaClient} provided by `SolanaProvider`.
 *
 * @returns The client, including its `rpc` and `rpcSubscriptions` members
 * @throws Error if used outside of a `SolanaProvider`
 */
export function useSolanaClient(): SolanaClient {
  const client = useContext(SolanaClientContext);
  if (!client) {
    throw new Error("useSolanaClient must be used within a SolanaProvider");
  }
  return client;
}
