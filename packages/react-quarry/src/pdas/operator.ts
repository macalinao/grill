import type { PdaHook } from "@macalinao/grill";
import type { OperatorSeeds } from "@macalinao/quarry";
import type { Address } from "@solana/kit";
import { createPdaHook } from "@macalinao/grill";
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
export const useOperatorPda: PdaHook<OperatorSeeds, Address> = createPdaHook(
  findOperatorPda,
  "operatorPda",
);
