import type { PdaHook, PdasHook } from "@macalinao/grill";
import type { OperatorSeeds } from "@macalinao/quarry";
import { createPdaHook, createPdasHook } from "@macalinao/grill";
import { findOperatorPda } from "@macalinao/quarry";

/**
 * Hook to derive the PDA address for an Operator.
 * Computes the deterministic address for an Operator account
 * based on the base and operator key.
 *
 * @param seeds - The seeds for deriving the Operator PDA
 * @param seeds.base - The base address
 * @param seeds.operator - The operator's public key
 * @returns The computed Operator PDA address
 *
 * @example
 * ```tsx
 * const operatorPda = useOperatorPda({
 *   base: baseAddress,
 *   operator: operatorPublicKey
 * });
 * ```
 */
export const useOperatorPda: PdaHook<OperatorSeeds> = createPdaHook(
  findOperatorPda,
  "operatorPda",
);

/**
 * Hook to derive multiple PDA addresses for Operators.
 * Computes deterministic addresses for multiple Operator accounts
 * with caching for efficient batch processing.
 *
 * @param args - Array of seed objects for deriving Operator PDAs
 * @returns Array of computed Operator PDA addresses or null if args is null/undefined
 *
 * @example
 * ```tsx
 * const operatorPdas = useOperatorPdas([
 *   { base: baseAddress1, operator: operatorPublicKey1 },
 *   { base: baseAddress2, operator: operatorPublicKey2 }
 * ]);
 * ```
 */
export const useOperatorPdas: PdasHook<OperatorSeeds> = createPdasHook(
  findOperatorPda,
  "operatorPda",
);
