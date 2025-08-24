import * as dn from "dnum";
import type { TokenAmount } from "./types.js";

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

export const tmath: {
  add: typeof add;
  sub: typeof sub;
  mul: typeof mul;
  div: typeof div;
} = {
  add,
  sub,
  mul,
  div,
};
