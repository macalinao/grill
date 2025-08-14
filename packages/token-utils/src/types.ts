import type { Address } from "@solana/kit";

/**
 * Basic information about a token on the Solana blockchain.
 */
export interface TokenInfo<
  TMint extends string = string,
  TDecimals extends number = number,
> {
  /**
   * The mint account of the token.
   */
  mint: Address<TMint>;
  name: string;
  symbol: string;
  decimals: TDecimals;
  /**
   * URL of the token's icon, if available.
   */
  iconURL?: string;
}

/**
 * A token amount, represented as a dnum.
 */
export interface TokenAmount<
  TMint extends string = string,
  TDecimals extends number = number,
> {
  token: TokenInfo<TMint, TDecimals>;
  amount: readonly [value: bigint, decimals: TDecimals];
}
