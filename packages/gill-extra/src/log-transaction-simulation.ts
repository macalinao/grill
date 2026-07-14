import type {
  TransactionError,
  TransactionMessage,
  TransactionMessageWithFeePayer,
} from "@solana/kit";
import type { SolanaCluster } from "./transaction.js";
import { createTransactionInspectorUrlWithOptions } from "./transaction.js";
import { parseTransactionError } from "./transaction-error.js";

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
  cluster?: SolanaCluster;
  /**
   * Custom RPC URL for the transaction inspector.
   * Required when using localhost or custom RPC endpoints.
   */
  rpcUrl?: string;
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
  errorMessage?: string;
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
  } = options;

  const logs = [...(simulationResult.logs ?? [])];
  const success = simulationResult.err === null;
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
    console.group(
      `%c✅ Transaction Simulation Succeeded: ${title}`,
      "color: #69db7c; font-weight: bold; font-size: 14px;",
    );
  } else {
    // Log failure with red styling
    console.group(
      `%c🚫 Transaction Simulation Failed: ${title}`,
      "color: #ff6b6b; font-weight: bold; font-size: 14px;",
    );
    if (errorMessage) {
      console.log(
        "%cError:",
        "color: #ff6b6b; font-weight: bold;",
        errorMessage,
      );
    }
  }

  if (logs.length > 0) {
    console.groupCollapsed(
      "%c📋 Simulation Logs",
      "color: #ffa94d; font-weight: bold;",
    );
    for (const log of logs) {
      const formatted = formatSimulationLog(log);
      if (formatted.style) {
        console.log(formatted.text, formatted.style);
      } else {
        console.log(formatted.text);
      }
    }
    console.groupEnd();
  }

  console.log(
    "%c🔍 Inspect Transaction:",
    "color: #74c0fc; font-weight: bold;",
  );
  console.log(inspectorUrl);

  console.log("%c📋 Copy for debugging:", "color: #b197fc; font-weight: bold;");
  console.log(
    createSimulationDebugBlock({
      title,
      success,
      inspectorUrl,
      logs,
      errorMessage,
    }),
  );

  console.groupEnd();
}
