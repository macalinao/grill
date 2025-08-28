import type { MergePool, Rewarder } from "@macalinao/clients-quarry";
import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import {
  findMergeMinerPda,
  findMinerPda,
  findMinterPda,
  findQuarryPda,
  getClaimRewardsMMInstruction,
  getWithdrawTokensMMInstruction,
  QUARRY_MINT_WRAPPER_PROGRAM_ADDRESS,
} from "@macalinao/clients-quarry";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

export interface QuarryStakeAccounts {
  pool: Address;
  mm: Address;
  rewarder: Address;
  quarry: Address;
  miner: Address;
  minerVault: Address;
}

export interface MergePoolAccount {
  address: Address;
  data: Pick<MergePool, "primaryMint" | "replicaMint">;
}

export interface ClaimRewardsCommonArgs {
  quarryMint: Address;
  stake: QuarryStakeAccounts;
  mmOwner: TransactionSigner;
  rewarder: {
    address: Address;
    data: Pick<
      Rewarder,
      "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
    >;
  };
}

/**
 * Creates instructions to claim rewards from a quarry through a merge miner.
 * This includes:
 * 1. Creating necessary associated token accounts
 * 2. Claiming the rewards
 * 3. Withdrawing the rewards tokens from the merge miner to the owner
 */
export async function claimRewardsCommon({
  quarryMint,
  stake,
  mmOwner,
  rewarder,
}: ClaimRewardsCommonArgs): Promise<Instruction[]> {
  const instructions: Instruction[] = [];

  // Derive the minter PDA
  const [minter] = await findMinterPda({
    wrapper: rewarder.data.mintWrapper,
    authority: stake.rewarder,
  });

  // Get or create associated token accounts for the merge miner
  const [mmQuarryTokenAccount] = await findAssociatedTokenPda({
    mint: quarryMint,
    owner: stake.mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [mmRewardsTokenAccount] = await findAssociatedTokenPda({
    mint: rewarder.data.rewardsTokenMint,
    owner: stake.mm,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Get or create associated token accounts for the owner
  const [ownerRewardsTokenAccount] = await findAssociatedTokenPda({
    mint: rewarder.data.rewardsTokenMint,
    owner: mmOwner.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Create ATAs if needed (idempotent)
  // 1. MM quarry token account
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer: mmOwner,
      ata: mmQuarryTokenAccount,
      owner: stake.mm,
      mint: quarryMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // 2. MM rewards token account
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer: mmOwner,
      ata: mmRewardsTokenAccount,
      owner: stake.mm,
      mint: rewarder.data.rewardsTokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // 3. Owner rewards token account
  instructions.push(
    getCreateAssociatedTokenIdempotentInstruction({
      payer: mmOwner,
      ata: ownerRewardsTokenAccount,
      owner: mmOwner.address,
      mint: rewarder.data.rewardsTokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    }),
  );

  // Claim rewards instruction
  instructions.push(
    getClaimRewardsMMInstruction({
      mintWrapper: rewarder.data.mintWrapper,
      mintWrapperProgram: QUARRY_MINT_WRAPPER_PROGRAM_ADDRESS,
      minter,
      rewardsTokenMint: rewarder.data.rewardsTokenMint,
      rewardsTokenAccount: mmRewardsTokenAccount,
      claimFeeTokenAccount: rewarder.data.claimFeeTokenAccount,
      stakeTokenAccount: mmQuarryTokenAccount,
      pool: stake.pool,
      mm: stake.mm,
      rewarder: stake.rewarder,
      quarry: stake.quarry,
      miner: stake.miner,
      minerVault: stake.minerVault,
    }),
  );

  // Withdraw rewards tokens from merge miner to owner
  instructions.push(
    getWithdrawTokensMMInstruction({
      owner: mmOwner,
      pool: stake.pool,
      mm: stake.mm,
      mmTokenAccount: mmRewardsTokenAccount,
      withdrawMint: rewarder.data.rewardsTokenMint,
      tokenDestination: ownerRewardsTokenAccount,
    }),
  );

  return instructions;
}

/**
 * Creates instructions to claim rewards for a primary miner
 */
export async function claimPrimaryRewards({
  mergePool,
  mmOwner,
  rewarder,
}: {
  mergePool: MergePoolAccount;
  mmOwner: TransactionSigner;
  rewarder: {
    address: Address;
    data: Pick<
      Rewarder,
      "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
    >;
  };
}): Promise<Instruction[]> {
  const stake = await getPrimaryStakeAccounts({
    rewarder: rewarder.address,
    mergePool,
    owner: mmOwner.address,
  });

  return claimRewardsCommon({
    quarryMint: mergePool.data.primaryMint,
    stake,
    mmOwner,
    rewarder,
  });
}

/**
 * Creates instructions to claim rewards for a replica miner
 */
export async function claimReplicaRewards({
  mergePool,
  mmOwner,
  rewarder,
}: {
  mergePool: MergePoolAccount;
  mmOwner: TransactionSigner;
  rewarder: {
    address: Address;
    data: Pick<
      Rewarder,
      "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
    >;
  };
}): Promise<Instruction[]> {
  const stake = await getReplicaStakeAccounts({
    rewarder: rewarder.address,
    mergePool,
    owner: mmOwner.address,
  });

  return claimRewardsCommon({
    quarryMint: mergePool.data.replicaMint,
    stake,
    mmOwner,
    rewarder,
  });
}

/**
 * Get the stake accounts for a primary miner
 */
export async function getPrimaryStakeAccounts({
  rewarder,
  mergePool,
  owner,
}: {
  rewarder: Address;
  mergePool: MergePoolAccount;
  owner: Address;
}): Promise<QuarryStakeAccounts> {
  // Derive the merge miner from pool and owner
  const [mm] = await findMergeMinerPda({
    pool: mergePool.address,
    owner,
  });

  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: mergePool.data.primaryMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: mergePool.data.primaryMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return {
    pool: mergePool.address,
    mm,
    rewarder,
    quarry,
    miner,
    minerVault,
  };
}

/**
 * Get the stake accounts for a replica miner
 */
export async function getReplicaStakeAccounts({
  rewarder,
  mergePool,
  owner,
}: {
  rewarder: Address;
  mergePool: MergePoolAccount;
  owner: Address;
}): Promise<QuarryStakeAccounts> {
  // Derive the merge miner from pool and owner
  const [mm] = await findMergeMinerPda({
    pool: mergePool.address,
    owner,
  });

  const [quarry] = await findQuarryPda({
    rewarder,
    tokenMint: mergePool.data.replicaMint,
  });

  const [miner] = await findMinerPda({
    quarry,
    authority: mm,
  });

  const [minerVault] = await findAssociatedTokenPda({
    mint: mergePool.data.replicaMint,
    owner: miner,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  return {
    pool: mergePool.address,
    mm,
    rewarder,
    quarry,
    miner,
    minerVault,
  };
}
