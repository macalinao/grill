import type { TokenAmount } from "@macalinao/token-utils";
import type { Address } from "@solana/kit";
import { createTokenAmount } from "@macalinao/token-utils";
import { useMemo } from "react";
import { useTokenAccount } from "./use-token-account.js";
import { useTokenInfo } from "./use-token-info.js";

export interface UseTokenBalanceOptions {
  /** The address of the token account */
  address: Address | null | undefined;
  /** The mint address of the token (optional, will be fetched from token account) */
  mint?: Address | null | undefined;
}

/**
 * Hook that fetches a token account and its token info to return a TokenAmount.
 * This combines useTokenAccount and useTokenInfo to provide the complete balance information.
 *
 * @example
 * ```typescript
 * const balance = useTokenBalance({
 *   address: tokenAccountAddress,
 * });
 *
 * if (balance) {
 *   console.log("Balance:", formatTokenAmount(balance));
 * }
 * ```
 */
export function useTokenBalance(
  options: UseTokenBalanceOptions,
): TokenAmount | null {
  const { address, mint: providedMint } = options;

  // Fetch the token account data
  const { data: tokenAccount } = useTokenAccount({ address });

  // Use provided mint or get it from the token account
  const mint = providedMint ?? tokenAccount?.data.mint;

  // Fetch the token info
  const { data: tokenInfo } = useTokenInfo({ mint });

  return useMemo(() => {
    if (!(tokenAccount && tokenInfo)) {
      return null;
    }

    return createTokenAmount(tokenInfo, tokenAccount.data.amount);
  }, [tokenAccount, tokenInfo]);
}
