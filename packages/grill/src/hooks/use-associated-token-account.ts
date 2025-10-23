import type { Account, Address } from "@solana/kit";
import type { Token } from "@solana-program/token";
import type { UseQueryResult } from "@tanstack/react-query";
import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { useTokenAccount } from "../accounts/token-account.js";
import { useAssociatedTokenPda } from "../pdas/associated-token.js";

export interface UseAssociatedTokenAccountOptions {
  /** The mint address of the token */
  mint: Address | null | undefined;
  /** The owner address of the token account */
  owner: Address | null | undefined;
  /** The token program address (defaults to TOKEN_PROGRAM_ADDRESS) */
  tokenProgram?: Address;
}

export interface UseAssociatedTokenAccountResult {
  /** The ATA address */
  address: Address | null;
  /** The bump seed for the PDA */
  bump: number | null;
  /** The decoded token account data */
  tokenAccount: Token | null;
  /** Whether the PDA is being computed */
  isLoadingPda: boolean;
  /** Whether the account data is being fetched */
  isLoadingAccount: boolean;
  /** Whether either operation is loading */
  isLoading: boolean;
  /** Any error from PDA computation */
  pdaError: Error | null;
  /** Any error from account fetching */
  accountError: Error | null;
  /** Refetch the account data */
  refetch: () => void;
}

/**
 * Hook that computes the Associated Token Account address and fetches its data
 * Combines useAssociatedTokenPda and useTokenAccount for convenience
 *
 * @example
 * ```typescript
 * const {
 *   address,
 *   tokenAccount,
 *   isLoading
 * } = useAssociatedTokenAccount({
 *   mint: mintAddress,
 *   owner: walletAddress,
 * });
 *
 * if (tokenAccount) {
 *   console.log("Balance:", tokenAccount.amount);
 * }
 * ```
 */
export function useAssociatedTokenAccount(
  options: UseAssociatedTokenAccountOptions,
): UseQueryResult<Account<Token> | null> & {
  address: Address | null | undefined;
} {
  const { mint, owner, tokenProgram = TOKEN_PROGRAM_ADDRESS } = options;

  // Compute the ATA address
  const ataAddress = useAssociatedTokenPda(
    mint && owner
      ? {
          mint,
          owner,
          tokenProgram,
        }
      : null,
  );

  // Fetch the token account data
  const accountResult = useTokenAccount({
    address: ataAddress,
  });

  return {
    ...accountResult,
    address: ataAddress,
  };
}
