import * as dnum from "dnum";
import type { TokenAmount } from "./types.js";

/**
 * Options for formatting a token amount
 */
export interface FormatTokenAmountOptions {
  /**
   * Whether to include the token symbol in the output.
   * When true, adds symbol after the amount (e.g., "100.5 USDC")
   * @default false
   */
  symbol?: boolean;

  /**
   * Number of decimal digits to display.
   * If not specified, uses the token's decimals.
   * @example
   * // For a token with 9 decimals
   * formatTokenAmount(amount, { digits: 2 }) // "100.50"
   * formatTokenAmount(amount, { digits: 4 }) // "100.5000"
   */
  digits?: number;

  /**
   * Whether to display trailing zeros.
   * @default undefined (uses dnum default)
   */
  trailingZeros?: boolean;

  /**
   * Whether to use compact notation (K, M, B, etc).
   * @default undefined (uses dnum default)
   */
  compact?: boolean;

  /**
   * Locale for formatting (e.g., "en-US", "de-DE").
   * @default undefined (uses dnum default)
   */
  locale?: string;

  /**
   * How to display the sign.
   * @default undefined (uses dnum default)
   */
  signDisplay?: "auto" | "always" | "never" | "exceptZero";
}

/**
 * Format a token amount for display.
 *
 * This function takes a TokenAmount (which includes both the token information
 * and the precise amount as a bigint) and formats it for human-readable display.
 * All formatting is delegated to the dnum library.
 *
 * @param tokenAmount - The token amount to format, containing token info and amount
 * @param options - Optional formatting options (passed through to dnum.format)
 * @returns A formatted string representation of the amount
 *
 * @example
 * ```typescript
 * // Basic usage
 * const amount = parseTokenAmount(usdcToken, "1234.56");
 * formatTokenAmount(amount); // "1,234.56"
 *
 * // With symbol
 * formatTokenAmount(amount, { symbol: true }); // "1,234.56 USDC"
 *
 * // With formatting options
 * formatTokenAmount(amount, {
 *   digits: 2,
 *   trailingZeros: true
 * }); // "1,234.56"
 *
 * // Compact notation
 * formatTokenAmount(amount, { compact: true }); // "1.23K"
 *
 * // Different locales
 * formatTokenAmount(amount, { locale: "de-DE" }); // "1.234,56"
 *
 * // Custom sign display
 * formatTokenAmount(amount, { signDisplay: "always" }); // "+1,234.56"
 * ```
 */
export function formatTokenAmount(
  tokenAmount: TokenAmount,
  options: FormatTokenAmountOptions = {},
): string {
  const { symbol = false, digits, ...dnumOptions } = options;

  // Format using dnum
  const formattedAmount = dnum.format(tokenAmount.amount, {
    digits: digits ?? tokenAmount.token.decimals,
    ...dnumOptions,
  });

  // Add symbol if requested
  if (symbol) {
    return `${formattedAmount} ${tokenAmount.token.symbol}`;
  }

  return formattedAmount;
}
