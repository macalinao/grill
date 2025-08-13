import type { Address } from "@solana/kit";

/**
 * Basic information about a token on the Solana blockchain.
 */
export interface TokenInfo {
  /**
   * The mint account of the token.
   */
  mint: Address;
  name: string;
  symbol: string;
  decimals: number;
  /**
   * URL of the token's icon, if available.
   */
  iconURL?: string;
}
