import type { SolanaClient } from "@macalinao/gill-extra";
import { createContext } from "react";

/**
 * React context holding the {@link SolanaClient} the app talks to.
 *
 * Deliberately not part of the package's public surface: consumers reach the
 * client through `useSolanaClient` and set it through `SolanaProvider`.
 */
export const SolanaClientContext: React.Context<SolanaClient | null> =
  createContext<SolanaClient | null>(null);
