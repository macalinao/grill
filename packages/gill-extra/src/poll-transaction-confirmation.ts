import type {
  GetBlockHeightApi,
  GetSignatureStatusesApi,
  Rpc,
  Signature,
  TransactionError,
} from "@solana/kit";
import type { Logger } from "./logger.js";
import { defaultLogger } from "./logger.js";
import { waitForDelay } from "./reconnect.js";

/**
 * The outcome of confirming a transaction: whether the cluster accepted it, and
 * the on-chain error if it did not.
 *
 * `err` is `null` for a transaction that landed successfully.
 */
export interface TransactionConfirmation {
  err: TransactionError | null;
}

/**
 * Message thrown when the transaction's blockhash falls out of the block height
 * window before the transaction is confirmed.
 */
export const TRANSACTION_EXPIRED_MESSAGE =
  "Transaction expired - blockhash no longer valid";

/**
 * Message thrown when polling runs out of attempts without a verdict.
 */
export const TRANSACTION_CONFIRMATION_TIMEOUT_MESSAGE =
  "Transaction confirmation timeout";

/**
 * The RPC methods needed to decide whether a transaction has landed.
 */
export type ConfirmationRpc = Rpc<GetBlockHeightApi & GetSignatureStatusesApi>;

/**
 * Reads the transaction's current confirmation status.
 *
 * @returns The confirmation, or `null` when the cluster has not confirmed the
 *   transaction yet (unknown signature, or only `processed`).
 */
export async function getTransactionConfirmation(
  rpc: ConfirmationRpc,
  signature: Signature,
): Promise<TransactionConfirmation | null> {
  const signatureStatus = await rpc.getSignatureStatuses([signature]).send();
  const status = signatureStatus.value[0];
  if (!status) {
    return null;
  }
  if (
    status.confirmationStatus === "confirmed" ||
    status.confirmationStatus === "finalized"
  ) {
    return { err: status.err };
  }
  return null;
}

/**
 * Whether the block height has moved past the transaction's last valid block,
 * meaning its blockhash can no longer be accepted by the cluster.
 */
export async function isBlockhashExpired(
  rpc: ConfirmationRpc,
  lastValidBlockHeight: bigint,
): Promise<boolean> {
  const blockHeight = await rpc.getBlockHeight().send();
  return blockHeight > lastValidBlockHeight;
}

export interface PollTransactionConfirmationOptions {
  signature: Signature;
  lastValidBlockHeight: bigint;
  rpc: ConfirmationRpc;
  /**
   * How many times to re-check the status before giving up.
   *
   * @default 30
   */
  maxRetries?: number | undefined;
  /**
   * How long to wait between status checks, in milliseconds.
   *
   * @default 1000
   */
  retryInterval?: number | undefined;
  /**
   * Aborts the poll. The returned promise rejects with the signal's reason.
   */
  abortSignal?: AbortSignal | undefined;
  /**
   * Logger used for status check failures. Defaults to {@link defaultLogger}.
   */
  logger?: Logger | undefined;
}

/**
 * Polls `getSignatureStatuses` until the transaction is confirmed, its
 * blockhash expires, or the attempts run out.
 *
 * This is the confirmation strategy that works against any RPC endpoint. When
 * WebSocket subscriptions are available, prefer `confirmTransaction`, which
 * settles as soon as the cluster notifies it and only falls back to this.
 *
 * @returns The transaction's confirmation, including its on-chain error if it
 *   failed. Landing with an error is not an exception here -- inspect `err`.
 * @throws If the blockhash expires, the attempts run out, the poll is aborted,
 *   or a status check fails.
 */
export async function pollTransactionConfirmation({
  signature,
  lastValidBlockHeight,
  rpc,
  maxRetries = 30,
  retryInterval = 1000,
  abortSignal,
  logger = defaultLogger,
}: PollTransactionConfirmationOptions): Promise<TransactionConfirmation> {
  let retries = 0;

  while (retries < maxRetries) {
    abortSignal?.throwIfAborted();

    try {
      const confirmation = await getTransactionConfirmation(rpc, signature);
      if (confirmation) {
        return confirmation;
      }

      // Check if blockhash is still valid
      if (await isBlockhashExpired(rpc, lastValidBlockHeight)) {
        throw new Error(TRANSACTION_EXPIRED_MESSAGE);
      }

      // Wait before next attempt
      if (abortSignal) {
        await waitForDelay(retryInterval, abortSignal);
      } else {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, retryInterval);
        });
      }
      retries++;
    } catch (error) {
      logger.error("Error checking transaction status:", error);
      throw error;
    }
  }

  abortSignal?.throwIfAborted();
  throw new Error(TRANSACTION_CONFIRMATION_TIMEOUT_MESSAGE);
}
