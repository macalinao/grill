// oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-argument, typescript/no-unsafe-return -- tsgolint resolves
// gill's createTransaction()/compressTransactionMessageUsingAddressLookupTables() to an error type;
// tsc types them correctly. Re-enable once typescript-go handles these signatures.
import type {
  BuildTXOptions,
  LatestBlockhash,
  SolanaCluster,
} from "@macalinao/gill-extra";
import type { Instruction, TransactionSigner } from "@solana/kit";
import type { SolanaClient, simulateTransactionFactory } from "gill";
import {
  logTransactionSimulation,
  parseTransactionError,
} from "@macalinao/gill-extra";
import {
  compressTransactionMessageUsingAddressLookupTables,
  getSolanaErrorFromTransactionError,
} from "@solana/kit";
import { createTransaction } from "gill";

export interface PrepareTransactionMessageParams {
  /** The fee payer signer for the transaction. */
  signer: TransactionSigner;
  rpc: SolanaClient["rpc"];
  /** Reused simulate function (created once via simulateTransactionFactory). */
  simulateTransaction: ReturnType<typeof simulateTransactionFactory>;
  name: string;
  ixs: readonly Instruction[];
  options: BuildTXOptions;
  cluster: SolanaCluster;
  rpcUrl?: string;
  /** Invoked when preflight simulation fails, before this function throws. */
  onSimulationError: (errorMessage: string) => void;
}

/**
 * Builds the final transaction message shared by the send and sign paths:
 * resolves the blockhash (using an injected one when provided, otherwise
 * fetching the latest), creates the transaction, applies address lookup table
 * compression, and runs optional preflight simulation.
 *
 * @returns The final (possibly compressed) transaction message and the
 * resolved blockhash (needed by the send path for confirmation).
 */
export async function prepareTransactionMessage({
  signer,
  rpc,
  simulateTransaction,
  name,
  ixs,
  options,
  cluster,
  rpcUrl,
  onSimulationError,
}: PrepareTransactionMessageParams): Promise<{
  finalTransactionMessage: ReturnType<typeof createTransaction>;
  latestBlockhash: LatestBlockhash;
}> {
  // Use the injected blockhash when provided to avoid an RPC round trip.
  const latestBlockhash =
    options.latestBlockhash ?? (await rpc.getLatestBlockhash().send()).value;

  const transactionMessage = createTransaction({
    version: 0,
    feePayer: signer,
    instructions: [...ixs],
    latestBlockhash,
    computeUnitLimit: options.computeUnitLimit,
    computeUnitPrice: options.computeUnitPrice,
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
    const simulationResult = await simulateTransaction(finalTransactionMessage);
    if (simulationResult.value.err !== null) {
      // Log detailed debugging information to the console
      logTransactionSimulation({
        title: name,
        simulationResult: simulationResult.value,
        transactionMessage: finalTransactionMessage,
        cluster,
        rpcUrl,
      });

      const logs = simulationResult.value.logs ?? [];
      const errorMessage = parseTransactionError(
        simulationResult.value.err,
        logs,
      );
      onSimulationError(errorMessage);
      throw getSolanaErrorFromTransactionError(simulationResult.value.err);
    }
  }

  return { finalTransactionMessage, latestBlockhash };
}
