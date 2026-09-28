import type { DevnetUrl, MainnetUrl, TestnetUrl } from "@solana/kit";
import type { SolanaClusterMoniker } from "./solana-cluster-moniker.js";
import { devnet, mainnet, testnet } from "@solana/kit";

/**
 * Get a public Solana RPC endpoint for a cluster based on its moniker.
 *
 * Public clusters come back as kit's branded cluster URLs (`MainnetUrl`,
 * `DevnetUrl`, `TestnetUrl`), so an RPC built from them -- for example with
 * `solanaRpcConnection({ rpcUrl: getPublicSolanaRpcUrl("mainnet") })` -- is
 * typed with that cluster's RPC methods. A local validator comes back as the
 * plain string `http://127.0.0.1:8899`, which `solanaRpcConnection` recognises
 * and pairs with the validator's websocket on port 8900.
 *
 * Note: these RPC URLs are rate limited and not suitable for production
 * applications.
 *
 * @param cluster - The cluster moniker to resolve
 * @returns The public RPC URL for that cluster
 * @throws If the moniker is not one this function knows about
 */
export function getPublicSolanaRpcUrl(
  cluster: "mainnet" | "mainnet-beta",
): MainnetUrl;
export function getPublicSolanaRpcUrl(cluster: "devnet"): DevnetUrl;
export function getPublicSolanaRpcUrl(cluster: "testnet"): TestnetUrl;
export function getPublicSolanaRpcUrl(
  cluster: "localnet" | "localhost",
): string;
export function getPublicSolanaRpcUrl(
  cluster: SolanaClusterMoniker | "mainnet-beta" | "localhost",
): DevnetUrl | MainnetUrl | TestnetUrl | string;
export function getPublicSolanaRpcUrl(
  cluster: SolanaClusterMoniker | "mainnet-beta" | "localhost",
): DevnetUrl | MainnetUrl | TestnetUrl | string {
  switch (cluster) {
    case "devnet":
      return devnet("https://api.devnet.solana.com");
    case "testnet":
      return testnet("https://api.testnet.solana.com");
    case "mainnet-beta":
    case "mainnet":
      return mainnet("https://api.mainnet-beta.solana.com");
    case "localnet":
    case "localhost":
      // Exactly this string: solanaRpcConnection only rewrites the websocket
      // port to 8900 for `http://127.0.0.1:8899` and `http://localhost:8899`.
      return "http://127.0.0.1:8899";
    default:
      throw new Error("Invalid cluster moniker");
  }
}
