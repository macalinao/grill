import type { Rpc, RpcTransport } from "@solana/rpc-spec";
import type { ClusterUrl } from "@solana/rpc-types";
import type { SolanaDasApi } from "./das-api.js";
import { createDefaultRpcTransport } from "@solana/rpc";
import { createRpc } from "@solana/rpc-spec";
import { createDasApi } from "./das-api.js";

/**
 * A ready-to-use DAS API RPC client.
 *
 * Each method returns a pending request; call `.send()` to execute it:
 *
 * ```ts
 * const asset = await dasRpc.getAsset({ id }).send();
 * ```
 */
export type DasRpc = Rpc<SolanaDasApi>;

/**
 * Creates a DAS API RPC client from an existing `@solana/kit` transport.
 *
 * Use this when you want to share a transport (e.g. one already configured with
 * custom headers or dispatching) between the DAS API and other RPC APIs.
 */
export function createDasRpcFromTransport(transport: RpcTransport): DasRpc {
  return createRpc({ api: createDasApi(), transport });
}

/**
 * Creates a DAS API RPC client for a DAS-enabled endpoint URL.
 *
 * ```ts
 * const dasRpc = createDasRpc("https://mainnet.helius-rpc.com/?api-key=...");
 * const asset = await dasRpc.getAsset({ id }).send();
 * ```
 *
 * @param clusterUrl - The URL of a DAS-enabled RPC endpoint.
 * @param config - Optional transport configuration (e.g. custom headers).
 */
export function createDasRpc<TClusterUrl extends ClusterUrl>(
  clusterUrl: TClusterUrl,
  config?: Omit<
    Parameters<typeof createDefaultRpcTransport<TClusterUrl>>[0],
    "url"
  >,
): DasRpc {
  return createDasRpcFromTransport(
    createDefaultRpcTransport({ url: clusterUrl, ...config }),
  );
}
