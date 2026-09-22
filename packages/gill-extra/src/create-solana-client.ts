import type { DevnetUrl, MainnetUrl, TestnetUrl } from "@solana/kit";
import type {
  CreateSolanaClientArgs,
  LocalnetUrl,
  ModifiedClusterUrl,
  SolanaClient,
  SolanaClientUrlOrMoniker,
  SolanaClusterMoniker,
} from "./solana-client.js";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { getPublicSolanaRpcUrl } from "./get-public-solana-rpc-url.js";
import { sendAndConfirmTransactionWithSignersFactory } from "./send-and-confirm-transaction-with-signers-factory.js";
import { simulateTransactionFactory } from "./simulate-transaction-factory.js";

/**
 * Resolves the caller's `urlOrMoniker` to a URL, accepting either a full RPC
 * URL or the moniker of a public cluster.
 */
const resolveUrl = (urlOrMoniker: SolanaClientUrlOrMoniker): URL => {
  if (urlOrMoniker instanceof URL) {
    // Cloned rather than used directly: the port and protocol are rewritten
    // below, and a caller's URL object is not ours to mutate.
    return new URL(urlOrMoniker.toString());
  }
  if (urlOrMoniker === "") {
    throw new Error("Cluster url or moniker is required");
  }
  try {
    return new URL(urlOrMoniker);
  } catch {
    try {
      // Not a URL, so treat it as a moniker. getPublicSolanaRpcUrl throws on
      // anything it does not recognise, which the outer catch turns into the
      // message below.
      return new URL(
        getPublicSolanaRpcUrl(urlOrMoniker as SolanaClusterMoniker),
      );
    } catch {
      throw new Error("Invalid URL or cluster moniker");
    }
  }
};

/**
 * Create a Solana `rpc` and `rpcSubscriptions` client.
 */
export function createSolanaClient(
  props: Omit<
    CreateSolanaClientArgs<MainnetUrl | "mainnet">,
    "urlOrMoniker"
  > & { urlOrMoniker: "mainnet" },
): SolanaClient<MainnetUrl>;
export function createSolanaClient(
  props: Omit<CreateSolanaClientArgs<DevnetUrl | "devnet">, "urlOrMoniker"> & {
    urlOrMoniker: "devnet";
  },
): SolanaClient<DevnetUrl>;
export function createSolanaClient(
  props: Omit<
    CreateSolanaClientArgs<TestnetUrl | "testnet">,
    "urlOrMoniker"
  > & {
    urlOrMoniker: "testnet";
  },
): SolanaClient<TestnetUrl>;
export function createSolanaClient(
  props: Omit<
    CreateSolanaClientArgs<LocalnetUrl | "localnet">,
    "urlOrMoniker"
  > & { urlOrMoniker: "localnet" },
): SolanaClient<LocalnetUrl>;
export function createSolanaClient<TClusterUrl extends ModifiedClusterUrl>(
  props: CreateSolanaClientArgs<TClusterUrl>,
): SolanaClient<TClusterUrl>;
export function createSolanaClient({
  urlOrMoniker,
  rpcConfig,
  rpcSubscriptionsConfig,
}: CreateSolanaClientArgs<ModifiedClusterUrl>): SolanaClient {
  const url = resolveUrl(urlOrMoniker);

  if (!/^https?/i.test(url.protocol)) {
    throw new Error("Unsupported protocol. Only HTTP and HTTPS are supported");
  }

  if (rpcConfig?.port !== undefined) {
    url.port = rpcConfig.port.toString();
  }

  const rpc = createSolanaRpc(url.toString(), rpcConfig);

  // The subscriptions client talks to the same host over a websocket. A local
  // validator serves its websocket on 8900 unless told otherwise.
  url.protocol = url.protocol.replace("http", "ws");
  if (rpcSubscriptionsConfig?.port !== undefined) {
    url.port = rpcSubscriptionsConfig.port.toString();
  } else if (url.hostname === "localhost" || url.hostname.startsWith("127")) {
    url.port = "8900";
  }

  const rpcSubscriptions = createSolanaRpcSubscriptions(
    url.toString(),
    rpcSubscriptionsConfig,
  );

  return {
    rpc,
    rpcSubscriptions,
    sendAndConfirmTransaction: sendAndConfirmTransactionWithSignersFactory({
      rpc,
      rpcSubscriptions,
    }),
    simulateTransaction: simulateTransactionFactory({ rpc }),
    urlOrMoniker: url.toString(),
  };
}
