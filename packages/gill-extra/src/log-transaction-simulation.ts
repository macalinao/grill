import type {
  TransactionError,
  TransactionMessage,
  TransactionMessageWithFeePayer,
} from "@solana/kit";
import type { LogLevel, Logger } from "./logger.js";
import type { SolanaCluster } from "./transaction.js";
import { defaultLogger } from "./logger.js";
import { parseTransactionError } from "./transaction-error.js";
import { createTransactionInspectorUrlWithOptions } from "./transaction.js";

/**
 * Simulation result from the RPC, containing error info and logs.
 * This matches the structure of `simulationResult.value` from simulateTransaction.
 */
export interface SimulationResultValue {
  /**
   * The error from the simulation, or null if successful.
   */
  err: TransactionError | null;
  /**
   * The simulation logs from the RPC.
   */
  logs: readonly string[] | null;
}

export interface LogTransactionSimulationOptions {
  /**
   * The name/title of the transaction.
   */
  title: string;
  /**
   * The simulation result value from the RPC.
   * Contains `err` (null if successful) and `logs`.
   */
  simulationResult: SimulationResultValue;
  /**
   * The transaction message that was simulated.
   */
  transactionMessage: TransactionMessage & TransactionMessageWithFeePayer;
  /**
   * The Solana cluster for explorer links.
   */
  cluster?: SolanaCluster | undefined;
  /**
   * Custom RPC URL for the transaction inspector.
   * Required when using localhost or custom RPC endpoints.
   */
  rpcUrl?: string | undefined;
  /**
   * Logger used for the output. Defaults to {@link defaultLogger}.
   *
   * Pass the logger configured on `GrillProvider` to have this respect the
   * app's `logLevel`.
   */
  logger?: Logger | undefined;
}

/**
 * Formats simulation logs with color codes for console output.
 * - Error logs are colored red
 * - Program logs are colored green
 * - Other logs are left uncolored
 */
export function formatSimulationLog(log: string): {
  text: string;
  style?: string;
} {
  if (log.includes("Error") || log.includes("failed")) {
    return { text: `%c${log}`, style: "color: #ff6b6b;" };
  }
  if (log.includes("Program log:")) {
    return { text: `%c${log}`, style: "color: #69db7c;" };
  }
  return { text: log };
}

/**
 * Creates a copy-paste friendly debugging block for simulation results.
 */
export function createSimulationDebugBlock(options: {
  title: string;
  success: boolean;
  inspectorUrl: string;
  logs: string[];
  errorMessage?: string | undefined;
}): string {
  const { title, success, inspectorUrl, logs, errorMessage } = options;

  const lines = [
    "---",
    `Transaction: ${title}`,
    `Status: ${success ? "Success" : "Failed"}`,
  ];

  if (errorMessage) {
    lines.push(`Error: ${errorMessage}`);
  }

  lines.push(`Inspector URL: ${inspectorUrl}`);
  lines.push("Logs:");
  lines.push(logs.join("\n"));
  lines.push("---");

  return lines.join("\n");
}

/**
 * Logs detailed information about a transaction simulation.
 * Automatically determines success/failure from the simulation result.
 *
 * Outputs a nicely formatted console log with:
 * - Transaction title and status (success/failure)
 * - Error message (if failed)
 * - Collapsible simulation logs (color-coded)
 * - Inspector URL for the Solana Explorer
 * - Copy-paste friendly debugging block
 *
 * A failed simulation is reported at the `"error"` level and a successful one
 * at `"info"`, so a logger configured below that level prints nothing.
 */
export function logTransactionSimulation(
  options: LogTransactionSimulationOptions,
): void {
  const {
    title,
    simulationResult,
    transactionMessage,
    cluster = "mainnet-beta",
    rpcUrl,
    logger = defaultLogger,
  } = options;

  const success = simulationResult.err === null;
  const level: LogLevel = success ? "info" : "error";
  // Bail before building the inspector URL, which is not free.
  if (!logger.isEnabled(level)) {
    return;
  }

  const logs = [...(simulationResult.logs ?? [])];
  const errorMessage =
    success || simulationResult.err === null
      ? undefined
      : parseTransactionError(simulationResult.err, logs);

  // Create inspector URL with proper RPC handling
  const inspectorUrl = createTransactionInspectorUrlWithOptions(
    transactionMessage,
    {
      cluster,
      customUrl: rpcUrl,
    },
  );

  if (success) {
    // Log success with green styling
    logger.group(
      level,
      `%c✅ Transaction Simulation Succeeded: ${title}`,
      "color: #69db7c; font-weight: bold; font-size: 14px;",
    );
  } else {
    // Log failure with red styling
    logger.group(
      level,
      `%c🚫 Transaction Simulation Failed: ${title}`,
      "color: #ff6b6b; font-weight: bold; font-size: 14px;",
    );
    if (errorMessage) {
      logger.log(
        level,
        "%cError:",
        "color: #ff6b6b; font-weight: bold;",
        errorMessage,
      );
    }
  }

  if (logs.length > 0) {
    logger.groupCollapsed(
      level,
      "%c📋 Simulation Logs",
      "color: #ffa94d; font-weight: bold;",
    );
    for (const log of logs) {
      const formatted = formatSimulationLog(log);
      if (formatted.style) {
        logger.log(level, formatted.text, formatted.style);
      } else {
        logger.log(level, formatted.text);
      }
    }
    logger.groupEnd(level);
  }

  logger.log(
    level,
    "%c🔍 Inspect Transaction:",
    "color: #74c0fc; font-weight: bold;",
  );
  logger.log(level, inspectorUrl);

  logger.log(
    level,
    "%c📋 Copy for debugging:",
    "color: #b197fc; font-weight: bold;",
  );
  logger.log(
    level,
    createSimulationDebugBlock({
      title,
      success,
      inspectorUrl,
      logs,
      errorMessage,
    }),
  );

  logger.groupEnd(level);
}
