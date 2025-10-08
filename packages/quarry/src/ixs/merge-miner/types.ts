import type { MergePool } from "@macalinao/clients-quarry";
import type { AccountInfo } from "@macalinao/gill-extra";
import type { Address, TransactionSigner } from "@solana/kit";

/**
 * A merge pool account with primary/replica mint exposed.
 */
export type MergePoolAccount = AccountInfo<
  Pick<MergePool, "primaryMint" | "replicaMint">
>;

/**
 * Base arguments shared by merge miner operations
 */
export interface BaseMergeMinerArgs {
  /** The merge pool account */
  mergePool: MergePoolAccount;
  /** The primary rewarder address */
  rewarder: Address;
  /** Optional array of replica rewarder addresses */
  replicaRewarders?: Address[];
  /** Transaction payer */
  payer: TransactionSigner;
}

/**
 * Base arguments for operations that require specifying an amount
 */
export interface MergeMinerAmountArgs extends BaseMergeMinerArgs {
  /** Amount of tokens to deposit or withdraw */
  amount: bigint;
}

export interface InitMergeMinerArgs {
  pool: Address;
  owner: Address;
  payer: TransactionSigner;
}

export interface InitMinerForMergeMinerArgs {
  pool: Address;
  mm: Address;
  rewarder: Address;
  tokenMint: Address;
  payer: TransactionSigner;
}

/**
 * Base arguments shared by stake and unstake primary miner operations
 */
export interface BasePrimaryMinerArgs {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  primaryMint: Address;
}

export type StakePrimaryMinerArgs = BasePrimaryMinerArgs;

export interface UnstakePrimaryMinerArgs extends BasePrimaryMinerArgs {
  amount: bigint;
}

/**
 * Base arguments shared by stake and unstake replica miner operations
 */
export interface BaseReplicaMinerArgs {
  mmOwner: TransactionSigner;
  pool: Address;
  mm: Address;
  rewarder: Address;
  replicaMint: Address;
}

export type StakeReplicaMinerArgs = BaseReplicaMinerArgs;

export type UnstakeAllReplicaMinerArgs = BaseReplicaMinerArgs;

export interface ClaimRewardsMergeMinerArgs {
  mintWrapper: Address;
  minter: Address;
  rewardsTokenMint: Address;
  rewardsTokenAccount: Address;
  claimFeeTokenAccount: Address;
  stakeTokenAccount: Address;
  pool: Address;
  mm: Address;
  rewarder: Address;
  quarry: Address;
  miner: Address;
  minerVault: Address;
}

export interface ClaimMergeMinerRewardsHelperArgs {
  mintWrapper: Address;
  rewarder: Address;
  rewardsTokenMint: Address;
  claimFeeTokenAccount: Address;
  pool: Address;
  mm: Address;
  quarryMint: Address;
}

export interface WithdrawTokensMergeMinerArgs {
  owner: TransactionSigner;
  pool: Address;
  mm: Address;
  withdrawMint: Address;
  tokenDestination: Address;
  rewarder: Address;
  replicaRewarders?: Address[];
  amount: bigint;
}

export interface RescueTokensMergeMinerArgs {
  mmOwner: TransactionSigner;
  mergePool: Address;
  mm: Address;
  miner: Address;
  minerTokenAccount: Address;
  destinationTokenAccount: Address;
}

export interface CreateMergePoolArgs {
  primaryMint: Address;
  payer: TransactionSigner;
}

export interface MinerAddresses {
  rewarder: Address;
  quarry: Address;
  miner: Address;
  minerVault: Address;
}
