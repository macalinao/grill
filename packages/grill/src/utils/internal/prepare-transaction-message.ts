import type {
  BuildTXOptions,
  FullTransaction,
  Logger,
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
import type { GrillClient } from "../../types.js";
import {
  createTransaction,
  defaultLogger,
  logTransactionSimulation,
  parseTransactionError,
} from "@macalinao/gill-extra";
import {
  compressTransactionMessageUsingAddressLookupTables,
  getSolanaErrorFromTransactionError,
  pipe,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessageLoadedAccountsDataSizeLimit,
} from "@solana/kit";
import { planSingleTransactionMessage } from "./plan-single-transaction-message.js";

export interface PrepareTransactionMessageParams {
  /** The fee payer signer for the transaction. */
  signer: TransactionSigner;
  rpc: GrillClient["rpc"];
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
   * transaction without a compute unit limit, or instructions that do not fit
   * in a single transaction), before this function throws.
   */
  onBuildError: (errorMessage: string) => void;
  /**
   * Invoked when the preflight (or resource limit estimation) simulation
   * fails, before this function throws.
   */
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

/** A limit set only to reserve its space until it is estimated (kit's value). */
const PROVISORY_LIMIT = 0;
/** The compute unit limit the runtime allows at most. */
const MAX_COMPUTE_UNIT_LIMIT = 1_400_000;
/** The loaded accounts data size limit the runtime allows at most (64 MiB). */
const MAX_LOADED_ACCOUNTS_DATA_SIZE_LIMIT = 64 * 1024 * 1024;

/**
 * Pads a simulated compute unit count, following `@solana/kit-plugin-rpc`'s
 * default: a 10% margin for small transactions tapering to 2% at 500k CUs, at
 * least 300 CUs, capped at the runtime maximum.
 */
const getComputeUnitLimitFromEstimate = (unitsConsumed: bigint): number => {
  const units = Number(unitsConsumed);
  const progress = Math.min(units / 500_000, 1);
  const margin = 0.1 - (0.1 - 0.02) * progress;
  const buffer = Math.max(300, Math.ceil(units * margin));
  return Math.min(MAX_COMPUTE_UNIT_LIMIT, units + buffer);
};

/** Which resource limits {@link BuildTXOptions.estimateResourceLimits} fills. */
interface LimitsToEstimate {
  computeUnitLimit: boolean;
  loadedAccountsDataSizeLimit: boolean;
}

/**
 * Builds the message the instructions are planned into: fee payer, lifetime
 * and compute budget, with no instructions yet. Limits that will be estimated
 * get a provisory value so the planner accounts for their space.
 */
const buildBaseTransactionMessage = ({
  signer,
  options,
  latestBlockhash,
  estimate,
}: {
  signer: TransactionSigner;
  options: BuildTXOptions;
  latestBlockhash: BlockhashLifetimeConstraint;
  estimate: LimitsToEstimate;
}): PreparedTransactionMessage => {
  const version = options.version ?? 0;
  if (hasLookupTables(options) && version !== 0) {
    throw new Error(
      `Address lookup tables are only supported for version 0 transactions (got version ${String(version)}).`,
    );
  }

  const computeUnitLimit = estimate.computeUnitLimit
    ? PROVISORY_LIMIT
    : options.computeUnitLimit;
  const loadedAccountsDataSizeLimit = estimate.loadedAccountsDataSizeLimit
    ? PROVISORY_LIMIT
    : options.loadedAccountsDataSizeLimit;

  return createTransaction({
    version,
    feePayer: signer,
    instructions: [],
    latestBlockhash,
    // Spread conditionally: `CreateTransactionInput` types these as
    // `computeUnitLimit?: number | bigint` without `| undefined`, so under
    // exactOptionalPropertyTypes the keys have to be absent rather than
    // explicitly undefined.
    ...(computeUnitLimit === undefined ? {} : { computeUnitLimit }),
    ...(options.computeUnitPrice === undefined
      ? {}
      : { computeUnitPrice: options.computeUnitPrice }),
    ...(options.priorityFeeLamports === undefined
      ? {}
      : { priorityFeeLamports: options.priorityFeeLamports }),
    ...(loadedAccountsDataSizeLimit === undefined
      ? {}
      : { loadedAccountsDataSizeLimit }),
  });
};

const hasLookupTables = (options: BuildTXOptions): boolean =>
  Object.keys(options.lookupTables ?? {}).length > 0;

/**
 * Plans the instructions into the base message with kit's transaction planner,
 * compressing with the address lookup tables on every update so the planner's
 * size checks see the compressed message. Throws if they do not fit in one
 * transaction.
 */
const planTransactionMessage = async ({
  signer,
  ixs,
  options,
  latestBlockhash,
  estimate,
}: {
  signer: TransactionSigner;
  ixs: readonly Instruction[];
  options: BuildTXOptions;
  latestBlockhash: BlockhashLifetimeConstraint;
  estimate: LimitsToEstimate;
}): Promise<PreparedTransactionMessage> => {
  const baseMessage = buildBaseTransactionMessage({
    signer,
    options,
    latestBlockhash,
    estimate,
  });
  const addressLookupTables = options.lookupTables ?? {};
  return planSingleTransactionMessage({
    baseMessage,
    instructions: ixs,
    // Lookup tables were checked above to only be present for version 0.
    onTransactionMessageUpdated: hasLookupTables(options)
      ? (message) =>
          message.version === 0
            ? compressTransactionMessageUsingAddressLookupTables(
                message,
                addressLookupTables,
              )
            : message
      : undefined,
  });
};

/**
 * Builds the final transaction message shared by the send and sign paths:
 * fetches the latest blockhash, plans the instructions into a single
 * transaction (at `options.version`, default `0`) with kit's transaction
 * planner, applies address lookup table compression, and runs the preflight
 * simulation -- or, with `options.estimateResourceLimits`, the one simulation
 * that estimates the resource limits and doubles as the preflight.
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

  // Explicit limits are never estimated.
  const estimateResourceLimits = options.estimateResourceLimits ?? false;
  const estimate: LimitsToEstimate = {
    computeUnitLimit:
      estimateResourceLimits && options.computeUnitLimit === undefined,
    loadedAccountsDataSizeLimit:
      estimateResourceLimits &&
      options.version === 1 &&
      options.loadedAccountsDataSizeLimit === undefined,
  };

  let plannedMessage: PreparedTransactionMessage;
  try {
    plannedMessage = await planTransactionMessage({
      signer,
      ixs,
      options,
      latestBlockhash,
      estimate,
    });
  } catch (error: unknown) {
    // Report invalid options so the "preparing" status does not hang.
    onBuildError(
      error instanceof Error ? error.message : "Invalid transaction.",
    );
    throw error;
  }

  /** Simulates `message`, reporting and throwing if the simulation fails. */
  const simulate = async (message: PreparedTransactionMessage) => {
    const simulationResult = await simulateTransaction(message);
    if (simulationResult.value.err !== null) {
      // Log detailed debugging information to the console
      logTransactionSimulation({
        title: name,
        simulationResult: simulationResult.value,
        transactionMessage: message,
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
    return simulationResult.value;
  };

  if (estimate.computeUnitLimit || estimate.loadedAccountsDataSizeLimit) {
    // Simulate once with the limits being estimated at their maximum, so the
    // simulation cannot run out of them; explicit limits are simulated as-is.
    const simulationMessage = pipe(
      plannedMessage,
      (m) =>
        estimate.computeUnitLimit
          ? setTransactionMessageComputeUnitLimit(MAX_COMPUTE_UNIT_LIMIT, m)
          : m,
      (m) =>
        estimate.loadedAccountsDataSizeLimit
          ? setTransactionMessageLoadedAccountsDataSizeLimit(
              MAX_LOADED_ACCOUNTS_DATA_SIZE_LIMIT,
              m,
            )
          : m,
    );
    const { unitsConsumed, loadedAccountsDataSize } =
      await simulate(simulationMessage);

    // Checked by type: an RPC may report these as absent or `null`.
    if (
      (estimate.computeUnitLimit && typeof unitsConsumed !== "bigint") ||
      (estimate.loadedAccountsDataSizeLimit &&
        typeof loadedAccountsDataSize !== "number")
    ) {
      const errorMessage =
        "Failed to estimate resource limits: the RPC simulation did not report the resources consumed.";
      onSimulationError(errorMessage);
      throw new Error(errorMessage);
    }

    const finalTransactionMessage = pipe(
      plannedMessage,
      (m) =>
        estimate.computeUnitLimit && typeof unitsConsumed === "bigint"
          ? setTransactionMessageComputeUnitLimit(
              getComputeUnitLimitFromEstimate(unitsConsumed),
              m,
            )
          : m,
      (m) =>
        estimate.loadedAccountsDataSizeLimit &&
        typeof loadedAccountsDataSize === "number"
          ? setTransactionMessageLoadedAccountsDataSizeLimit(
              loadedAccountsDataSize,
              m,
            )
          : m,
    );
    return { finalTransactionMessage, latestBlockhash };
  }

  // preflight
  if (!options.skipPreflight) {
    await simulate(plannedMessage);
  }

  return { finalTransactionMessage: plannedMessage, latestBlockhash };
}
