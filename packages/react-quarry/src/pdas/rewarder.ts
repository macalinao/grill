import type { PdaHook } from "@macalinao/grill";
import { createPdaHook } from "@macalinao/grill";
import { findRewarderPda  } from "@macalinao/quarry";
import type {RewarderSeeds} from "@macalinao/quarry";
import type { Address } from "@solana/kit";

/**
 * Hook to derive the PDA address for a Rewarder.
 */
export const useRewarderPda: PdaHook<RewarderSeeds, Address> = createPdaHook(
  findRewarderPda,
  "rewarderPda",
);
