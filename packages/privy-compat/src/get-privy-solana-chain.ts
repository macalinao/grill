import type { SolanaCluster } from "@macalinao/grill";
import type { PrivySolanaChain } from "./types.js";

/**
 * The clusters Privy can reach, keyed by their grill/gill cluster name.
 * `localnet` is absent: Privy's signers submit through Privy's own RPCs.
 */
const PRIVY_SOLANA_CHAINS: Partial<Record<SolanaCluster, PrivySolanaChain>> = {
  devnet: "solana:devnet",
  "mainnet-beta": "solana:mainnet",
  testnet: "solana:testnet",
};

/**
 * Converts a grill/gill {@link SolanaCluster} into the CAIP-2 chain identifier
 * that Privy expects.
 *
 * @param cluster - The cluster the app is pointed at.
 * @returns The matching Privy chain identifier.
 * @throws Error if the cluster has no Privy equivalent, e.g. `localnet`.
 *
 * @example
 * ```ts
 * getPrivySolanaChain("mainnet-beta"); // "solana:mainnet"
 * ```
 */
export function getPrivySolanaChain(cluster: SolanaCluster): PrivySolanaChain {
  const chain = PRIVY_SOLANA_CHAINS[cluster];
  if (chain === undefined) {
    throw new Error(
      `Privy does not support the "${cluster}" cluster. Use "mainnet-beta", "devnet", or "testnet".`,
    );
  }
  return chain;
}
