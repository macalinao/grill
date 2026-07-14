import type {
  CompiledTransactionMessage,
  TransactionMessage,
  TransactionMessageWithFeePayer,
} from "@solana/kit";
import {
  compileTransactionMessage,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
} from "@solana/kit";

/**
 * Encodes a transaction message to base64 format.
 * This is useful for creating transaction inspector URLs or sending transactions
 * to services that expect base64-encoded messages.
 *
 * @param transactionMessage - The compilable transaction message to encode
 * @returns The base64-encoded transaction message string
 */
export function encodeTransactionMessageToBase64(
  transactionMessage: TransactionMessage & TransactionMessageWithFeePayer,
): string {
  const compiled = compileTransactionMessage(transactionMessage);
  return encodeCompiledTransactionMessageToBase64(compiled);
}

/**
 * Encodes a compiled transaction message to base64 format.
 * This is useful when you already have a compiled message and need to encode it.
 *
 * @param compiledMessage - The compiled transaction message to encode
 * @returns The base64-encoded transaction message string
 */
export function encodeCompiledTransactionMessageToBase64(
  compiledMessage: CompiledTransactionMessage,
): string {
  const encodedMessageBytes =
    getCompiledTransactionMessageEncoder().encode(compiledMessage);
  return getBase64Decoder().decode(encodedMessageBytes);
}

export type SolanaCluster = "mainnet-beta" | "testnet" | "devnet" | "localnet";

export interface TransactionInspectorUrlOptions {
  /**
   * The Solana cluster (defaults to "mainnet-beta").
   * Use "localnet" for local development with a custom RPC URL.
   */
  cluster?: SolanaCluster;
  /**
   * Custom RPC URL for the transaction inspector.
   * Required when cluster is "localnet" or when using a custom RPC endpoint.
   * This will be URL-encoded and passed as the customUrl parameter.
   */
  customUrl?: string;
}

/**
 * Creates a Solana Explorer transaction inspector URL from a transaction message.
 * This allows previewing and simulating transactions before sending them.
 *
 * @param transactionMessage - The compilable transaction message to create an inspector URL for
 * @param cluster - The Solana cluster (defaults to "mainnet-beta")
 * @returns The Solana Explorer transaction inspector URL
 */
export function createTransactionInspectorUrl(
  transactionMessage: TransactionMessage & TransactionMessageWithFeePayer,
  cluster: SolanaCluster = "mainnet-beta",
): string {
  return createTransactionInspectorUrlWithOptions(transactionMessage, {
    cluster,
  });
}

/**
 * Creates a Solana Explorer transaction inspector URL from a transaction message
 * with support for custom RPC URLs.
 *
 * @param transactionMessage - The compilable transaction message to create an inspector URL for
 * @param options - Options including cluster and optional custom RPC URL
 * @returns The Solana Explorer transaction inspector URL
 */
export function createTransactionInspectorUrlWithOptions(
  transactionMessage: TransactionMessage & TransactionMessageWithFeePayer,
  options: TransactionInspectorUrlOptions = {},
): string {
  const { cluster = "mainnet-beta", customUrl } = options;
  const encodedMessage = encodeTransactionMessageToBase64(transactionMessage);

  const params = new URLSearchParams();
  params.set("message", encodedMessage);

  // Handle cluster and customUrl
  if (customUrl) {
    params.set("cluster", "custom");
    params.set("customUrl", customUrl);
  } else if (cluster === "localnet") {
    params.set("cluster", "custom");
    params.set("customUrl", "http://localhost:8899");
  } else if (cluster !== "mainnet-beta") {
    params.set("cluster", cluster);
  }

  return `https://explorer.solana.com/tx/inspector?${params.toString()}`;
}
