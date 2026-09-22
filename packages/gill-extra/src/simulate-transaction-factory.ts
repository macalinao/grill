import type {
  Rpc,
  SimulateTransactionApi,
  Transaction,
  TransactionMessage,
  TransactionMessageWithFeePayer,
} from "@solana/kit";
import type { Simplify } from "./simplify.js";
import {
  getBase64EncodedWireTransaction,
  partiallySignTransactionMessageWithSigners,
} from "@solana/kit";

/**
 * Configuration accepted by a {@link SimulateTransactionFunction}, minus the
 * pieces the function sets itself.
 */
export type SimulateTransactionConfig = Simplify<
  Omit<
    Parameters<SimulateTransactionApi["simulateTransaction"]>[1],
    "encoding" | "sigVerify"
  >
>;

/**
 * Simulates a transaction (or a transaction message, which is signed with its
 * attached signers first) against the network.
 */
export type SimulateTransactionFunction = (
  transaction:
    | Transaction
    | (TransactionMessage & TransactionMessageWithFeePayer),
  config?: SimulateTransactionConfig,
) => Promise<ReturnType<SimulateTransactionApi["simulateTransaction"]>>;

export interface SimulateTransactionFactoryConfig {
  /** An RPC client that supports the `simulateTransaction` method. */
  rpc: Rpc<SimulateTransactionApi>;
}

/**
 * Builds a function that simulates transactions against `rpc`.
 *
 * Simulation always runs with `sigVerify: false` and, unless overridden,
 * `replaceRecentBlockhash: true`, so a transaction message can be simulated
 * before a blockhash or signatures exist for it.
 *
 * @param config - The RPC client to simulate against
 * @returns A function that simulates a transaction
 */
export function simulateTransactionFactory({
  rpc,
}: SimulateTransactionFactoryConfig): SimulateTransactionFunction {
  return async function simulateTransaction(transaction, config) {
    const signed =
      "messageBytes" in transaction
        ? transaction
        : await partiallySignTransactionMessageWithSigners(transaction);

    return rpc
      .simulateTransaction(getBase64EncodedWireTransaction(signed), {
        replaceRecentBlockhash: true,
        ...config,
        sigVerify: false,
        encoding: "base64",
      })
      .send();
  };
}
