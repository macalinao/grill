import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import { getSetAnnualRewardsInstruction } from "@macalinao/clients-quarry";

/**
 * Creates an instruction to set the annual rewards rate for a rewarder
 *
 * @param rewarder - The rewarder address
 * @param newRate - The new annual rewards rate (number of tokens per year)
 * @param authority - The authority that can set the rewards rate
 * @returns The set annual rewards instruction
 */
export function createSetAnnualRewardsRateIx({
  rewarder,
  newRate,
  authority,
}: {
  rewarder: Address;
  newRate: number | bigint;
  authority: TransactionSigner;
}): Instruction {
  return getSetAnnualRewardsInstruction({
    authority,
    rewarder,
    newRate,
  });
}
