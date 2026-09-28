import type {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  DevnetUrl,
  MainnetUrl,
  RpcFromTransport,
  RpcSubscriptions,
  RpcTransportFromClusterUrl,
  SolanaRpcApiFromTransport,
  SolanaRpcSubscriptionsApi,
  TestnetUrl,
} from "@solana/kit";
import type { SendAndConfirmTransactionWithSignersFunction } from "./send-and-confirm-transaction-with-signers-factory.js";
import type { SimulateTransactionFunction } from "./simulate-transaction-factory.js";

/** Solana cluster moniker */
export type SolanaClusterMoniker =
  | "devnet"
  | "localnet"
  | "mainnet"
  | "testnet";

/** A cluster URL pointing at a local validator. */
export type LocalnetUrl = string & { "~cluster": "localnet" };

/** A cluster URL with no cluster branding, such as a private RPC endpoint. */
export type GenericUrl = string & NonNullable<unknown>;

/** Any URL {@link createSolanaClient} accepts. */
export type ModifiedClusterUrl =
  | DevnetUrl
  | GenericUrl
  | LocalnetUrl
  | MainnetUrl
  | TestnetUrl;

/** Either a cluster URL or the moniker of a public cluster. */
export type SolanaClientUrlOrMoniker =
  | ModifiedClusterUrl
  | SolanaClusterMoniker
  | URL;

/**
 * Arguments for {@link createSolanaClient}.
 */
export interface CreateSolanaClientArgs<
  TClusterUrl extends SolanaClientUrlOrMoniker = GenericUrl,
> {
  /** Configuration used to create the `rpc` client */
  rpcConfig?: Parameters<typeof createSolanaRpc>[1] & { port?: number };
  /** Configuration used to create the `rpcSubscriptions` client */
  rpcSubscriptionsConfig?: Parameters<
    typeof createSolanaRpcSubscriptions
  >[1] & {
    port?: number;
  };
  /**
   * Full RPC URL (for a private RPC endpoint) or the Solana moniker (for a
   * public RPC endpoint)
   */
  urlOrMoniker: SolanaClientUrlOrMoniker | TClusterUrl;
}

/**
 * An RPC client, a WebSocket subscriptions client, and the transaction helpers
 * built on top of them.
 */
export interface SolanaClient<
  TClusterUrl extends ModifiedClusterUrl | string = string,
> {
  /** Used to make RPC calls to your RPC provider */
  rpc: RpcFromTransport<
    SolanaRpcApiFromTransport<RpcTransportFromClusterUrl<TClusterUrl>>,
    RpcTransportFromClusterUrl<TClusterUrl>
  >;
  /** Used to make RPC websocket calls to your RPC provider */
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  /**
   * Send and confirm a transaction to the network (including signing with
   * available Signers).
   *
   * If the `transaction` does not already have a latest blockhash (and is not
   * already signed), it will be automatically retrieved and applied.
   *
   * Default commitment level: `confirmed`
   */
  sendAndConfirmTransaction: SendAndConfirmTransactionWithSignersFunction;
  /** Simulate a transaction on the network */
  simulateTransaction: SimulateTransactionFunction;
  /**
   * Full RPC URL (for a private RPC endpoint) or the Solana moniker (for a
   * public RPC endpoint)
   */
  urlOrMoniker: SolanaClientUrlOrMoniker | TClusterUrl;
}
