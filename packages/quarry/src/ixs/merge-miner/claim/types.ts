import type { Rewarder } from "@macalinao/clients-quarry";
import type { Address, TransactionSigner } from "@solana/kit";

export interface QuarryStakeAccounts {
  pool: Address;
  mm: Address;
  rewarder: Address;
  quarry: Address;
  miner: Address;
  minerVault: Address;
}

export interface ClaimMMRewardsArgs {
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

export interface ClaimMMRewardsNoWithdrawArgs {
  quarryMint: Address;
  stake: QuarryStakeAccounts;
  payer: TransactionSigner;
  rewarder: {
    address: Address;
    data: Pick<
      Rewarder,
      "mintWrapper" | "rewardsTokenMint" | "claimFeeTokenAccount"
    >;
  };
}
