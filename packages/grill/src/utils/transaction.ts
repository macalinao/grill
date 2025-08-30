import type {
  BaseTransactionMessage,
  CompiledTransactionMessage,
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
  transactionMessage: BaseTransactionMessage & TransactionMessageWithFeePayer,
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

/**
 * Creates a Solana Explorer transaction inspector URL from a transaction message.
 * This allows previewing and simulating transactions before sending them.
 *
 * @param transactionMessage - The compilable transaction message to create an inspector URL for
 * @param cluster - The Solana cluster (defaults to "mainnet-beta")
 * @returns The Solana Explorer transaction inspector URL
 */
export function createTransactionInspectorUrl(
  transactionMessage: BaseTransactionMessage & TransactionMessageWithFeePayer,
  cluster: "mainnet-beta" | "testnet" | "devnet" = "mainnet-beta",
): string {
  const encodedMessage = encodeTransactionMessageToBase64(transactionMessage);
  const clusterParam = cluster === "mainnet-beta" ? "" : `&cluster=${cluster}`;
  return `https://explorer.solana.com/tx/inspector?message=${encodeURIComponent(
    encodedMessage,
  )}${clusterParam}`;
}
