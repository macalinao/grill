import type { Signature } from "@solana/kit";
import type { SolanaClient } from "gill";
import type { ConfirmedTransaction } from "./get-confirmed-transaction.js";
import type { Logger } from "./logger.js";
import { getSolanaErrorFromTransactionError } from "@solana/kit";
import { getConfirmedTransaction } from "./get-confirmed-transaction.js";
import { defaultLogger } from "./logger.js";
import { pollTransactionConfirmation } from "./poll-transaction-confirmation.js";

export interface PollConfirmTransactionOptions {
  signature: Signature;
  lastValidBlockHeight: bigint;
  rpc: SolanaClient["rpc"];
  maxRetries?: number | undefined;
  retryInterval?: number | undefined;
  /**
   * Logger used for status check failures. Defaults to {@link defaultLogger}.
   */
  logger?: Logger | undefined;
}

/**
 * Polls for transaction confirmation status, then fetches the confirmed
 * transaction.
 *
 * Prefer `confirmTransaction` when you only need to know whether the
 * transaction landed: it settles on a WebSocket notification where one is
 * available, and skips the extra `getTransaction` round trip this function
 * makes.
 *
 * @param options - Options for polling transaction confirmation
 * @returns Promise that resolves with the confirmed transaction
 * @throws If the transaction fails on-chain, expires, or the poll times out
 */
export async function pollConfirmTransaction({
  signature,
  lastValidBlockHeight,
  rpc,
  maxRetries,
  retryInterval,
  logger = defaultLogger,
}: PollConfirmTransactionOptions): Promise<ConfirmedTransaction> {
  const { err } = await pollTransactionConfirmation({
    signature,
    lastValidBlockHeight,
    rpc,
    maxRetries,
    retryInterval,
    logger,
  });

  if (err !== null) {
    throw getSolanaErrorFromTransactionError(err);
  }

  // Get transaction details
  const transaction = await getConfirmedTransaction(rpc, signature);

  if (!transaction) {
    throw new Error("Transaction not found after confirmation");
  }

  return transaction;
}
