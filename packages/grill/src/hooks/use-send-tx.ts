import type {
  AddressesByLookupTableAddress,
  Instruction,
  Signature,
  TransactionSigner,
} from "@solana/kit";
import {
  compressTransactionMessageUsingAddressLookupTables,
  getBase58Decoder,
  signAndSendTransactionMessageWithSigners,
} from "@solana/kit";
import { createTransaction, getExplorerLink } from "gill";

import { useSolanaClient } from "gill-react";
import { useCallback } from "react";
import { useGrillContext } from "../contexts/grill-context.js";
import { useKitWallet } from "./use-kit-wallet.js";

export type TransactionId = string;

export type TransactionStatusEvent = {
  title: string;
  id: TransactionId;
} & (
  | {
      type: "error-wallet-not-connected";
    }
  | {
      type: "preparing";
    }
  | {
      type: "awaiting-wallet-signature";
    }
  | {
      type: "waiting-for-confirmation";
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "confirmed";
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "error-transaction-failed";
      errorMessage: string;
      sig: Signature;
      explorerLink: string;
    }
);

export interface SendTXOptions {
  luts?: AddressesByLookupTableAddress;
  signers?: TransactionSigner[];
}

export type SendTXFunction = (
  name: string,
  ixs: readonly Instruction[],
  options?: SendTXOptions,
) => Promise<Signature>;

/**
 * Hook that provides a function to send transactions using the modern @solana/kit API
 * while maintaining compatibility with the wallet adapter.
 */
export const useSendTX = (): SendTXFunction => {
  const { reloadAccounts, internal_onTransactionStatusEvent } =
    useGrillContext();
  const { signer } = useKitWallet();
  const { rpc } = useSolanaClient();
  return useCallback(
    async (
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
        internal_onTransactionStatusEvent({
          ...baseEvent,
          type: "error-wallet-not-connected",
        });
        throw new Error("Wallet not connected");
      }

      internal_onTransactionStatusEvent({
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
        // TODO(igm): make this configurable and/or dynamic based on the instructions
        computeUnitLimit: 1_400_000,
        computeUnitPrice: 100_000n,
      });

      // Apply address lookup tables if provided to compress the transaction
      const addressLookupTables = options.luts ?? {};
      const finalTransactionMessage =
        Object.keys(addressLookupTables).length > 0
          ? compressTransactionMessageUsingAddressLookupTables(
              transactionMessage,
              addressLookupTables,
            )
          : transactionMessage;

      internal_onTransactionStatusEvent({
        ...baseEvent,
        type: "awaiting-wallet-signature",
      });

      // Send transaction using wallet adapter
      const sigBytes = await signAndSendTransactionMessageWithSigners(
        finalTransactionMessage,
      );
      const decoder = getBase58Decoder();
      const sig = decoder.decode(sigBytes) as Signature;
      const sentTxEvent = {
        ...baseEvent,
        sig,
        explorerLink: getExplorerLink({ transaction: sig }),
      };

      internal_onTransactionStatusEvent({
        ...sentTxEvent,
        type: "waiting-for-confirmation",
      });

      try {
        // Wait for confirmation using modern RPC
        const confirmationStrategy = {
          signature: sig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        };

        // Poll for transaction confirmation
        let confirmed = false;
        let confirmationError: Error | null = null;
        const maxRetries = 30;
        let retries = 0;

        while (retries < maxRetries) {
          try {
            const signatureStatus = await rpc
              .getSignatureStatuses([sig])
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
            if (blockHeight > confirmationStrategy.lastValidBlockHeight) {
              throw new Error(
                "Transaction expired - blockhash no longer valid",
              );
            }

            // Wait before next attempt
            await new Promise((resolve) => setTimeout(resolve, 1000));
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

        // Get transaction details for logging using modern RPC
        const result = await rpc
          .getTransaction(sig, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
            encoding: "jsonParsed",
          })
          .send();

        if (result) {
          // Reload the accounts that were written to
          const writableAccounts = result.transaction.message.accountKeys
            .filter((key) => key.writable)
            .map((k) => k.pubkey);
          await reloadAccounts(writableAccounts);
        }

        internal_onTransactionStatusEvent({
          ...sentTxEvent,
          type: "confirmed",
        });

        if (result?.meta?.logMessages) {
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

        internal_onTransactionStatusEvent({
          ...sentTxEvent,
          type: "error-transaction-failed",
          errorMessage,
        });
        throw error;
      }
    },
    [internal_onTransactionStatusEvent, reloadAccounts, rpc, signer],
  );
};
