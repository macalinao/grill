import type { SolanaClient } from "@macalinao/gill-extra";
import type { QueryClient } from "@tanstack/react-query";
import type { FC, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SolanaClientContext } from "../contexts/solana-client-context.js";

export interface SolanaProviderProps {
  /** The client `useSolanaClient` hands to everything below this provider. */
  client: SolanaClient;
  children: ReactNode;
  /**
   * Query client to install for the subtree.
   *
   * Omit it -- the usual case -- and the provider uses whichever
   * `QueryClientProvider` already wraps it, so grill's queries share the app's
   * cache. Pass one only to deliberately give this subtree a cache of its own.
   */
  queryClient?: QueryClient;
}

/**
 * Provides a {@link SolanaClient} to the component tree.
 *
 * @example
 * ```tsx
 * const client = createSolanaClient({ urlOrMoniker: "mainnet" });
 *
 * <SolanaProvider client={client}>
 *   <App />
 * </SolanaProvider>
 * ```
 */
export const SolanaProvider: FC<SolanaProviderProps> = ({
  client,
  children,
  queryClient,
}) => {
  const provided = (
    <SolanaClientContext.Provider value={client}>
      {children}
    </SolanaClientContext.Provider>
  );

  if (queryClient === undefined) {
    return provided;
  }

  return (
    <QueryClientProvider client={queryClient}>{provided}</QueryClientProvider>
  );
};
