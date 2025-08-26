import type { TokenAmount } from "./types.js";
import * as dn from "dnum";
import { tokenAmountToBigInt } from "./token-amount-to-bigint.js";

function assertSameToken<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): void {
  if (a.token.mint !== b.token.mint) {
    throw new Error(
      `Token mint mismatch: ${String(a.token.mint)} !== ${String(b.token.mint)}`,
    );
  }
  if (a.token.decimals !== b.token.decimals) {
    throw new Error(
      `Token decimals mismatch: ${String(a.token.decimals)} !== ${String(b.token.decimals)}`,
    );
  }
}

export function add<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  assertSameToken(a, b);
  return {
    token: a.token,
    amount: dn.add(a.amount, b.amount, a.token.decimals) as readonly [
      bigint,
      TDecimals,
    ],
  };
}

export function sub<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  assertSameToken(a, b);
  return {
    token: a.token,
    amount: dn.sub(a.amount, b.amount, a.token.decimals) as readonly [
      bigint,
      TDecimals,
    ],
  };
}

export function mul<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  assertSameToken(a, b);
  return {
    token: a.token,
    amount: dn.mul(a.amount, b.amount, a.token.decimals) as readonly [
      bigint,
      TDecimals,
    ],
  };
}

export function div<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  assertSameToken(a, b);
  return {
    token: a.token,
    amount: dn.div(a.amount, b.amount, a.token.decimals) as readonly [
      bigint,
      TDecimals,
    ],
  };
}

/**
 * Checks if token amount `a` is greater than token amount `b`.
 * Both amounts must be of the same token.
 * @param a - First token amount
 * @param b - Second token amount
 * @returns true if a > b, false otherwise
 */
export function gt<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): boolean {
  assertSameToken(a, b);
  return dn.greaterThan(a.amount, b.amount);
}

/**
 * Checks if token amount `a` is greater than or equal to token amount `b`.
 * Both amounts must be of the same token.
 * @param a - First token amount
 * @param b - Second token amount
 * @returns true if a >= b, false otherwise
 */
export function gte<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): boolean {
  assertSameToken(a, b);
  return dn.greaterThanOrEqual(a.amount, b.amount);
}

/**
 * Checks if token amount `a` is less than token amount `b`.
 * Both amounts must be of the same token.
 * @param a - First token amount
 * @param b - Second token amount
 * @returns true if a < b, false otherwise
 */
export function lt<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): boolean {
  assertSameToken(a, b);
  return dn.lessThan(a.amount, b.amount);
}

/**
 * Checks if token amount `a` is less than or equal to token amount `b`.
 * Both amounts must be of the same token.
 * @param a - First token amount
 * @param b - Second token amount
 * @returns true if a <= b, false otherwise
 */
export function lte<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): boolean {
  assertSameToken(a, b);
  return dn.lessThanOrEqual(a.amount, b.amount);
}

/**
 * Returns the absolute value of a token amount.
 * @param amount - Token amount to get absolute value of
 * @returns Token amount with absolute value
 */
export function abs<TMint extends string, TDecimals extends number>(
  amount: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  return {
    token: amount.token,
    amount: dn.abs(amount.amount) as readonly [bigint, TDecimals],
  };
}

/**
 * Returns the minimum of two token amounts.
 * Both amounts must be of the same token.
 * @param a - First token amount
 * @param b - Second token amount
 * @returns The smaller of the two amounts
 */
export function min<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  assertSameToken(a, b);
  return lt(a, b) ? a : b;
}

/**
 * Returns the maximum of two token amounts.
 * Both amounts must be of the same token.
 * @param a - First token amount
 * @param b - Second token amount
 * @returns The larger of the two amounts
 */
export function max<TMint extends string, TDecimals extends number>(
  a: TokenAmount<TMint, TDecimals>,
  b: TokenAmount<TMint, TDecimals>,
): TokenAmount<TMint, TDecimals> {
  assertSameToken(a, b);
  return gt(a, b) ? a : b;
}

/**
 * Converts a TokenAmount to its raw bigint representation.
 * This is an alias for tokenAmountToBigInt.
 * @param amount - Token amount to convert
 * @returns Raw amount as bigint
 */
export function toRaw<TMint extends string, TDecimals extends number>(
  amount: TokenAmount<TMint, TDecimals>,
): bigint {
  return tokenAmountToBigInt(amount);
}
