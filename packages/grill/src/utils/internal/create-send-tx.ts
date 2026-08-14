// oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-argument -- tsgolint resolves
// gill's createTransaction()/compressTransactionMessageUsingAddressLookupTables() to an error type;
// tsc types them correctly. Re-enable once typescript-go handles these signatures.
import type {
  GetExplorerLinkFunction,
  Logger,
  SendTXFunction,
  SendTXOptions,
  SolanaCluster,
} from "@macalinao/gill-extra";
import type {
  Address,
  Instruction,
  Signature,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import type { TransactionStatusEvent } from "../../types.js";
import {
  confirmTransaction,
  defaultLogger,
  getConfirmedTransaction,
  getSignatureFromBytes,
  getWritableAccounts,
  logTransactionSimulation,
  parseTransactionError,
} from "@macalinao/gill-extra";
import {
  compressTransactionMessageUsingAddressLookupTables,
  getSolanaErrorFromTransactionError,
  signAndSendTransactionMessageWithSigners,
} from "@solana/kit";
import { createTransaction, simulateTransactionFactory } from "gill";

export interface CreateSendTXParams {
  signer: TransactionSendingSigner | null;
  rpc: SolanaClient["rpc"];
  /**
   * WebSocket subscriptions client. When provided, a sent transaction is
   * confirmed by subscribing to its signature instead of polling, so it settles
   * as soon as the cluster reports a verdict. Confirmation falls back to
   * polling when this is omitted or the subscription cannot be opened.
   */
  rpcSubscriptions?: SolanaClient["rpcSubscriptions"] | undefined;
  refetchAccounts: (addresses: Address[]) => Promise<void>;
  onTransactionStatusEvent: (event: TransactionStatusEvent) => void;
  getExplorerLink: GetExplorerLinkFunction;
  /**
   * The RPC URL used for creating transaction inspector URLs.
   * This is needed to generate correct inspector URLs for custom RPC endpoints.
   */
  rpcUrl?: string | undefined;
  /**
   * The Solana cluster for explorer links.
   * Defaults to "mainnet-beta".
   */
  cluster?: SolanaCluster | undefined;
  /**
   * Logger for transaction diagnostics. Defaults to {@link defaultLogger}.
   */
  logger?: Logger | undefined;
}

/**
 * Creates a function to send transactions using the modern @solana/kit API
 * while maintaining compatibility with the wallet adapter.
 */
export const createSendTX = ({
  signer,
  rpc,
  rpcSubscriptions,
  refetchAccounts,
  onTransactionStatusEvent,
  getExplorerLink,
  rpcUrl,
  cluster = "mainnet-beta",
  logger = defaultLogger,
}: CreateSendTXParams): SendTXFunction => {
  const simulateTransaction = simulateTransactionFactory({ rpc });
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

    const latestBlockhash =
      options.latestBlockhash ?? (await rpc.getLatestBlockhash().send()).value;
    const transactionMessage = createTransaction({
      version: 0,
      feePayer: signer,
      instructions: [...ixs],
      latestBlockhash,
      // Spread conditionally: gill types these as `computeUnitLimit?: number | bigint`
      // without `| undefined`, so under exactOptionalPropertyTypes the keys have to be
      // absent rather than explicitly undefined.
      ...(options.computeUnitLimit === undefined
        ? {}
        : { computeUnitLimit: options.computeUnitLimit }),
      ...(options.computeUnitPrice === undefined
        ? {}
        : { computeUnitPrice: options.computeUnitPrice }),
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

    // preflight
    if (!options.skipPreflight) {
      const simulationResult = await simulateTransaction(
        finalTransactionMessage,
      );
      if (simulationResult.value.err !== null) {
        // Log detailed debugging information to the console
        logTransactionSimulation({
          title: name,
          simulationResult: simulationResult.value,
          transactionMessage: finalTransactionMessage,
          cluster,
          rpcUrl,
          logger,
        });

        const logs = simulationResult.value.logs ?? [];
        const errorMessage = parseTransactionError(
          simulationResult.value.err,
          logs,
        );
        onTransactionStatusEvent({
          ...baseEvent,
          type: "error-simulation-failed",
          errorMessage,
        });
        throw getSolanaErrorFromTransactionError(simulationResult.value.err);
      }
    }

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
      const { err } = await confirmTransaction({
        signature: sig,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        rpc,
        rpcSubscriptions,
        logger,
        ...options.confirmation,
      });

      if (err !== null) {
        throw getSolanaErrorFromTransactionError(err);
      }

      onTransactionStatusEvent({
        ...sentTxEvent,
        type: "confirmed",
      });

      // Reload the accounts that were written to. The roles on the message we
      // just sent already say which those are, so there is no need to fetch the
      // confirmed transaction back to find out.
      const writableAccounts = getWritableAccounts(finalTransactionMessage);
      if (writableAccounts.length > 0) {
        const waitForAccountRefetch = options.waitForAccountRefetch ?? true;
        if (waitForAccountRefetch) {
          await refetchAccounts(writableAccounts);
        } else {
          // Refetch in background without waiting
          refetchAccounts(writableAccounts).catch((error: unknown) => {
            logger.warn("Failed to refetch accounts in background:", error);
          });
        }
      }

      // Opt-in only: this is the one thing the confirmed transaction was still
      // being fetched for, and it costs a round trip that nothing else needs.
      if (options.fetchTransactionLogs && logger.isEnabled("debug")) {
        const confirmed = await getConfirmedTransaction(rpc, sig);
        if (confirmed?.meta?.logMessages) {
          logger.debug(name, confirmed.meta.logMessages.join("\n"));
        }
      }

      // Return the signature as a base58 string
      return sig;
    } catch (error: unknown) {
      // Log error details for debugging
      logger.error(`${name} transaction failed:`, error);

      // Extract error logs
      const isLogs = (value: unknown): value is string[] =>
        Array.isArray(value) && value.every((line) => typeof line === "string");

      const extractErrorLogs = (err: unknown): string[] => {
        if (typeof err !== "object" || err === null) {
          return [];
        }
        if ("logs" in err && isLogs(err.logs)) {
          return err.logs;
        }
        if ("context" in err) {
          const { context } = err;
          if (
            typeof context === "object" &&
            context !== null &&
            "logs" in context &&
            isLogs(context.logs)
          ) {
            return context.logs;
          }
        }
        return [];
      };

      const errorLogs = extractErrorLogs(error);
      if (errorLogs.length > 0) {
        logger.error("Transaction logs:");
        for (const log of errorLogs) {
          logger.error("  ", log);
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
