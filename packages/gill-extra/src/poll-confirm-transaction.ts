import type { Signature } from "@solana/kit";
import type { SolanaClient } from "gill";
import type { ConfirmedTransaction } from "./get-confirmed-transaction.js";
import { getConfirmedTransaction } from "./get-confirmed-transaction.js";

export interface PollConfirmTransactionOptions {
  signature: Signature;
  lastValidBlockHeight: bigint;
  rpc: SolanaClient["rpc"];
  maxRetries?: number;
  retryInterval?: number;
}

/**
 * Polls for transaction confirmation status.
 *
 * @param options - Options for polling transaction confirmation
 * @returns Promise that resolves when transaction is confirmed or times out
 * @throws Error if transaction fails on-chain or expires
 */
export async function pollConfirmTransaction({
  signature,
  lastValidBlockHeight,
  rpc,
  maxRetries = 30,
  retryInterval = 1000,
}: PollConfirmTransactionOptions): Promise<ConfirmedTransaction> {
  let confirmed = false;
  let confirmationError: Error | null = null;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const signatureStatus = await rpc
        .getSignatureStatuses([signature])
        .send();

      if (signatureStatus.value[0]) {
        const status = signatureStatus.value[0];
        if (
          status.confirmationStatus === "confirmed" ||
          status.confirmationStatus === "finalized"
        ) {
          confirmed = true;
          if (status.err) {
            confirmationError = new Error("Transaction failed on-chain");
          }
          break;
        }
      }

      // Check if blockhash is still valid
      const blockHeight = await rpc.getBlockHeight().send();
      if (blockHeight > lastValidBlockHeight) {
        throw new Error("Transaction expired - blockhash no longer valid");
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      retries++;
    } catch (error) {
      console.error("Error checking transaction status:", error);
      throw error;
    }
  }

  if (!confirmed) {
    throw new Error("Transaction confirmation timeout");
  }

  if (confirmationError) {
    throw confirmationError;
  }

  // Get transaction details
  const transaction = await getConfirmedTransaction(rpc, signature);

  if (!transaction) {
    throw new Error("Transaction not found after confirmation");
  }

  return transaction;
}
