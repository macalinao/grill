import type { TokenAmount } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import { createTokenAmount } from "@macalinao/token-utils";
import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { useMemo } from "react";
import { useAssociatedTokenAccount } from "./use-associated-token-account.js";
import { useTokenInfo } from "./use-token-info.js";

export interface UseATABalanceOptions {
  /** The mint address of the token */
  mint: Address | null | undefined;
  /** The owner address of the token account */
  owner: Address | null | undefined;
  /** The token program address (defaults to TOKEN_PROGRAM_ADDRESS) */
  tokenProgram?: Address;
}

/**
 * Hook that fetches an Associated Token Account balance as a TokenAmount.
 * This combines useAssociatedTokenAccount and useTokenInfo to provide the complete balance information.
 *
 * @example
 * ```typescript
 * const balance = useATABalance({
 *   mint: mintAddress,
 *   owner: walletAddress,
 * });
 *
 * if (balance) {
 *   console.log("Balance:", formatTokenAmount(balance));
 * }
 * ```
 */
export function useATABalance(
  options: UseATABalanceOptions,
): TokenAmount | null {
  const { mint, owner, tokenProgram = TOKEN_PROGRAM_ADDRESS } = options;

  // Fetch the ATA and its data
  const { data: ataAccount } = useAssociatedTokenAccount({
    mint,
    owner,
    tokenProgram,
  });

  // Fetch the token info
  const { data: tokenInfo } = useTokenInfo({ mint });

  return useMemo(() => {
    if (!tokenInfo) {
      return null;
    }

    // If ATA doesn't exist, return zero balance
    if (!ataAccount) {
      return createTokenAmount(tokenInfo, 0n);
    }

    return createTokenAmount(tokenInfo, ataAccount.data.amount);
  }, [ataAccount, tokenInfo]);
}
