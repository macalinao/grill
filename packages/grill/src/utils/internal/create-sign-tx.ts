// oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-argument -- tsgolint resolves
// gill's createTransaction()/compressTransactionMessageUsingAddressLookupTables() to an error type;
// tsc types them correctly. Re-enable once typescript-go handles these signatures.
import type {
  SignTXFunction,
  SignTXOptions,
  SolanaCluster,
} from "@macalinao/gill-extra";
import type { Instruction, Transaction } from "@solana/kit";
import type { SolanaClient } from "gill";
import type { GrillSigner } from "../../contexts/wallet-context.js";
import type { TransactionStatusEvent } from "../../types.js";
import {
  isTransactionModifyingSigner,
  isTransactionPartialSigner,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { simulateTransactionFactory } from "gill";
import { prepareTransactionMessage } from "./prepare-transaction-message.js";

export interface CreateSignTXParams {
  signer: GrillSigner | null;
  rpc: SolanaClient["rpc"];
  onTransactionStatusEvent: (event: TransactionStatusEvent) => void;
  /**
   * The RPC URL used for creating transaction inspector URLs.
   */
  rpcUrl?: string;
  /**
   * The Solana cluster for explorer links.
   * Defaults to "mainnet-beta".
   */
  cluster?: SolanaCluster;
}

/**
 * Creates a function to sign transactions without sending them, using the
 * modern @solana/kit API. Requires that the connected signer supports signing
 * without sending (a `TransactionPartialSigner` or `TransactionModifyingSigner`).
 *
 * Returns the fully-signed {@link Transaction}, which the caller can broadcast
 * later, hand to a backend/relayer, or combine with additional signers.
 */
export const createSignTX = ({
  signer,
  rpc,
  onTransactionStatusEvent,
  rpcUrl,
  cluster = "mainnet-beta",
}: CreateSignTXParams): SignTXFunction => {
  const simulateTransaction = simulateTransactionFactory({ rpc });
  return async (
    name: string,
    ixs: readonly Instruction[],
    options: SignTXOptions = {},
  ): Promise<Transaction> => {
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

    // `signTransactionMessageWithSigners` only uses partial/modifying signers.
    // A sending-only signer (e.g. a wallet that only supports sign-and-send)
    // cannot produce a signed-but-unsent transaction.
    if (
      !(
        isTransactionPartialSigner(signer) ||
        isTransactionModifyingSigner(signer)
      )
    ) {
      const errorMessage =
        "This wallet does not support signing transactions without sending them.";
      onTransactionStatusEvent({
        ...baseEvent,
        type: "error-transaction-sign-failed",
        errorMessage,
      });
      throw new Error(errorMessage);
    }

    onTransactionStatusEvent({
      ...baseEvent,
      type: "preparing",
    });

    const { finalTransactionMessage } = await prepareTransactionMessage({
      signer,
      rpc,
      simulateTransaction,
      name,
      ixs,
      options,
      cluster,
      rpcUrl,
      onSimulationError: (errorMessage) => {
        onTransactionStatusEvent({
          ...baseEvent,
          type: "error-simulation-failed",
          errorMessage,
        });
      },
    });

    onTransactionStatusEvent({
      ...baseEvent,
      type: "awaiting-wallet-signature",
    });

    try {
      const signedTransaction = await signTransactionMessageWithSigners(
        finalTransactionMessage,
      );

      onTransactionStatusEvent({
        ...baseEvent,
        type: "signed",
      });

      return signedTransaction;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign transaction";
      onTransactionStatusEvent({
        ...baseEvent,
        type: "error-transaction-sign-failed",
        errorMessage,
      });
      throw error;
    }
  };
};
