import type {
  ModifiedClusterUrl,
  SolanaClusterMoniker,
} from "./solana-client.js";

/**
 * Get a public Solana RPC endpoint for a cluster based on its moniker.
 *
 * Note: these RPC URLs are rate limited and not suitable for production
 * applications.
 *
 * @param cluster - The cluster moniker to resolve
 * @returns The public RPC URL for that cluster
 * @throws If the moniker is not one this function knows about
 */
export function getPublicSolanaRpcUrl(
  cluster: SolanaClusterMoniker | "mainnet-beta" | "localhost",
): ModifiedClusterUrl {
  switch (cluster) {
    case "devnet":
      return "https://api.devnet.solana.com";
    case "testnet":
      return "https://api.testnet.solana.com";
    case "mainnet-beta":
    case "mainnet":
      return "https://api.mainnet-beta.solana.com";
    case "localnet":
    case "localhost":
      return "http://127.0.0.1:8899";
    default:
      throw new Error("Invalid cluster moniker");
  }
}
