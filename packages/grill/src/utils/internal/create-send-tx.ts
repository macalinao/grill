import type {
  Address,
  Instruction,
  Signature,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import {
  compressTransactionMessageUsingAddressLookupTables,
  signAndSendTransactionMessageWithSigners,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import { createTransaction } from "gill";
import type { GetExplorerLinkFunction } from "../../contexts/grill-context.js";
import type { TransactionStatusEvent } from "../../types.js";
import { getSignatureFromBytes } from "../get-signature-from-bytes.js";
import { pollConfirmTransaction } from "../poll-confirm-transaction.js";
import type { SendTXFunction, SendTXOptions } from "../types.js";

export interface CreateSendTXParams {
  signer: TransactionSendingSigner | null;
  rpc: SolanaClient["rpc"];
  refetchAccounts: (addresses: Address[]) => Promise<void>;
  onTransactionStatusEvent: (event: TransactionStatusEvent) => void;
  getExplorerLink: GetExplorerLinkFunction;
}

/**
 * Creates a function to send transactions using the modern @solana/kit API
 * while maintaining compatibility with the wallet adapter.
 */
export const createSendTX = ({
  signer,
  rpc,
  refetchAccounts,
  onTransactionStatusEvent,
  getExplorerLink,
}: CreateSendTXParams): SendTXFunction => {
  return async (
    name: string,
    ixs: readonly Instruction[],
    options: SendTXOptions = {},
  ): Promise<Signature> => {
    const txId = Math.random().toString(36).substring(2, 15);
    const baseEvent = {
      id: txId,
      title: name,
    };
    if (!signer) {
      onTransactionStatusEvent({
        ...baseEvent,
        type: "error-wallet-not-connected",
      });
      throw new Error("Wallet not connected");
    }

    onTransactionStatusEvent({
      ...baseEvent,
      type: "preparing",
    });

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const transactionMessage = createTransaction({
      version: 0,
      feePayer: signer,
      instructions: [...ixs],
      latestBlockhash,
      // the compute budget values are HIGHLY recommend to be set in order to maximize your transaction landing rate
      computeUnitLimit:
        options.computeUnitLimit === null
          ? undefined
          : (options.computeUnitLimit ?? 1_400_000),
      computeUnitPrice:
        options.computeUnitPrice === null
          ? undefined
          : (options.computeUnitPrice ?? 100_000n),
    });

    // Apply address lookup tables if provided to compress the transaction
    const addressLookupTables = options.lookupTables ?? {};
    const finalTransactionMessage =
      Object.keys(addressLookupTables).length > 0
        ? compressTransactionMessageUsingAddressLookupTables(
            transactionMessage,
            addressLookupTables,
          )
        : transactionMessage;

    onTransactionStatusEvent({
      ...baseEvent,
      type: "awaiting-wallet-signature",
    });

    // Send transaction using wallet adapter
    let sigBytes: SignatureBytes;
    try {
      sigBytes = await signAndSendTransactionMessageWithSigners(
        finalTransactionMessage,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send transaction";
      onTransactionStatusEvent({
        ...baseEvent,
        type: "error-transaction-send-failed",
        errorMessage,
      });
      throw error;
    }

    const sig = getSignatureFromBytes(sigBytes);
    const sentTxEvent = {
      ...baseEvent,
      sig,
      explorerLink: getExplorerLink({ transaction: sig }),
    };

    onTransactionStatusEvent({
      ...sentTxEvent,
      type: "waiting-for-confirmation",
    });

    try {
      const result = await pollConfirmTransaction({
        signature: sig,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        rpc,
      });

      onTransactionStatusEvent({
        ...sentTxEvent,
        type: "confirmed",
      });

      // Reload the accounts that were written to
      const writableAccounts = result.transaction.message.accountKeys
        .filter((key) => key.writable)
        .map((k) => k.pubkey);
      if (writableAccounts.length > 0) {
        const waitForAccountRefetch = options.waitForAccountRefetch ?? true;
        if (waitForAccountRefetch) {
          await refetchAccounts(writableAccounts);
        } else {
          // Refetch in background without waiting
          refetchAccounts(writableAccounts).catch((error: unknown) => {
            console.warn("Failed to refetch accounts in background:", error);
          });
        }
      }

      if (result.meta?.logMessages) {
        console.log(name, result.meta.logMessages.join("\n"));
      }

      // Return the signature as a base58 string
      return sig;
    } catch (error: unknown) {
      // Log error details for debugging
      console.error(`${name} transaction failed:`, error);

      // Extract error logs
      const extractErrorLogs = (err: unknown): string[] => {
        if (
          err &&
          typeof err === "object" &&
          "logs" in err &&
          Array.isArray((err as { logs: unknown }).logs)
        ) {
          return (err as { logs: string[] }).logs;
        }
        if (
          err &&
          typeof err === "object" &&
          "context" in err &&
          typeof (err as { context: unknown }).context === "object" &&
          (err as { context: { logs?: unknown } }).context.logs &&
          Array.isArray((err as { context: { logs: unknown } }).context.logs)
        ) {
          return (err as { context: { logs: string[] } }).context.logs;
        }
        return [];
      };

      const errorLogs = extractErrorLogs(error);
      if (errorLogs.length > 0) {
        console.log("Transaction logs:");
        for (const log of errorLogs) {
          console.log("  ", log);
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : "Transaction failed.";

      onTransactionStatusEvent({
        ...sentTxEvent,
        type: "error-transaction-failed",
        errorMessage,
      });
      throw error;
    }
  };
};
