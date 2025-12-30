import type { SimulationResultValue } from "./log-transaction-simulation.js";
import { parseTransactionError } from "./transaction-error.js";

/**
 * Function type for getting a user-friendly error message from a simulation result.
 */
export type GetSimulationUserErrorMessageFunction = (
  simulationResult: SimulationResultValue,
) => string;

/**
 * Gets a user-friendly error message from a simulation result using the default implementation.
 *
 * This function extracts the error message from the simulation result, attempting to
 * parse Anchor errors and other transaction errors into human-readable messages.
 *
 * @param simulationResult - The simulation result value containing error and logs
 * @returns A human-readable error message string
 *
 * @example
 * ```ts
 * const errorMessage = getDefaultSimulationUserErrorMessage(simulationResult.value);
 * console.log(errorMessage); // "Insufficient funds"
 * ```
 */
export function getDefaultSimulationUserErrorMessage(
  simulationResult: SimulationResultValue,
): string {
  if (!simulationResult.err) {
    return "Unknown error";
  }
  const logs = [...(simulationResult.logs ?? [])];
  return parseTransactionError(simulationResult.err, logs);
}
