import type {
  BuildTXOptions,
  FullTransaction,
  Logger,
  SolanaClient,
  SolanaCluster,
  simulateTransactionFactory,
} from "@macalinao/gill-extra";
import type {
  BlockhashLifetimeConstraint,
  Instruction,
  TransactionMessageWithBlockhashLifetime,
  TransactionMessageWithFeePayerSigner,
  TransactionSigner,
  TransactionVersion,
} from "@solana/kit";
import {
  createTransaction,
  defaultLogger,
  logTransactionSimulation,
  parseTransactionError,
} from "@macalinao/gill-extra";
import {
  compressTransactionMessageUsingAddressLookupTables,
  getSolanaErrorFromTransactionError,
} from "@solana/kit";

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
  rpcUrl?: string | undefined;
  /**
   * Logger used for simulation diagnostics. Defaults to {@link defaultLogger}.
   */
  logger?: Logger | undefined;
  /**
   * Invoked when the options cannot be built into a transaction (e.g. a v1
   * transaction without a compute unit limit), before this function throws.
   */
  onBuildError: (errorMessage: string) => void;
  /** Invoked when preflight simulation fails, before this function throws. */
  onSimulationError: (errorMessage: string) => void;
}

/**
 * The transaction message built by {@link prepareTransactionMessage}, of any
 * version.
 */
export type PreparedTransactionMessage = FullTransaction<
  TransactionVersion,
  TransactionMessageWithFeePayerSigner,
  TransactionMessageWithBlockhashLifetime
>;

const buildTransactionMessage = ({
  signer,
  ixs,
  options,
  latestBlockhash,
}: {
  signer: TransactionSigner;
  ixs: readonly Instruction[];
  options: BuildTXOptions;
  latestBlockhash: BlockhashLifetimeConstraint;
}): PreparedTransactionMessage => {
  const version = options.version ?? 0;
  const addressLookupTables = options.lookupTables ?? {};
  const hasLookupTables = Object.keys(addressLookupTables).length > 0;
  if (hasLookupTables && version !== 0) {
    throw new Error(
      `Address lookup tables are only supported for version 0 transactions (got version ${String(version)}).`,
    );
  }

  const transactionMessage = createTransaction({
    version,
    feePayer: signer,
    instructions: [...ixs],
    latestBlockhash,
    // Spread conditionally: `CreateTransactionInput` types these as
    // `computeUnitLimit?: number | bigint` without `| undefined`, so under
    // exactOptionalPropertyTypes the keys have to be absent rather than
    // explicitly undefined.
    ...(options.computeUnitLimit === undefined
      ? {}
      : { computeUnitLimit: options.computeUnitLimit }),
    ...(options.computeUnitPrice === undefined
      ? {}
      : { computeUnitPrice: options.computeUnitPrice }),
    ...(options.priorityFeeLamports === undefined
      ? {}
      : { priorityFeeLamports: options.priorityFeeLamports }),
    ...(options.loadedAccountsDataSizeLimit === undefined
      ? {}
      : { loadedAccountsDataSizeLimit: options.loadedAccountsDataSizeLimit }),
  });

  // Apply address lookup tables if provided to compress the transaction.
  // Lookup tables were checked above to only be present for version 0.
  return hasLookupTables && transactionMessage.version === 0
    ? compressTransactionMessageUsingAddressLookupTables(
        transactionMessage,
        addressLookupTables,
      )
    : transactionMessage;
};

/**
 * Builds the final transaction message shared by the send and sign paths:
 * fetches the latest blockhash, creates the transaction (at `options.version`,
 * default `0`), applies address lookup table compression, and runs optional
 * preflight simulation.
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
  logger = defaultLogger,
  onBuildError,
  onSimulationError,
}: PrepareTransactionMessageParams): Promise<{
  finalTransactionMessage: PreparedTransactionMessage;
  latestBlockhash: BlockhashLifetimeConstraint;
}> {
  // Use the injected blockhash when provided to avoid an RPC round trip.
  const latestBlockhash =
    options.latestBlockhash ?? (await rpc.getLatestBlockhash().send()).value;

  let finalTransactionMessage: PreparedTransactionMessage;
  try {
    finalTransactionMessage = buildTransactionMessage({
      signer,
      ixs,
      options,
      latestBlockhash,
    });
  } catch (error: unknown) {
    // Report invalid options so the "preparing" status does not hang.
    onBuildError(
      error instanceof Error ? error.message : "Invalid transaction.",
    );
    throw error;
  }

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
        logger,
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
