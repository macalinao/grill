import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { MinerAddresses } from "../types.js";
import { getInitMinerMMV2Instruction } from "@macalinao/clients-quarry";

/**
 * Creates an instruction to initialize a miner for a merge miner using pre-computed addresses
 * This is a helper function that avoids re-deriving addresses when they are already available
 *
 * @param pool - The merge pool address
 * @param mm - The merge miner address
 * @param tokenMint - The token mint address for the miner
 * @param minerAddresses - Pre-computed miner addresses (rewarder, quarry, miner, minerVault)
 * @param payer - The transaction signer who will pay for the initialization
 * @returns The miner initialization instruction
 */
export function createInitMinerForMergeMinerIxFromAddresses({
  pool,
  mm,
  tokenMint,
  minerAddresses,
  payer,
}: {
  pool: Address;
  mm: Address;
  tokenMint: Address;
  minerAddresses: MinerAddresses;
  payer: TransactionSigner;
}): Instruction {
  return getInitMinerMMV2Instruction({
    pool,
    mm,
    payer,
    rewarder: minerAddresses.rewarder,
    miner: minerAddresses.miner,
    quarry: minerAddresses.quarry,
    tokenMint,
    minerVault: minerAddresses.minerVault,
  });
}
