import type { GetTokenAccountsResponse } from "../types/token-accounts.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import {
  dasApiTokenAccountSchema,
  getTokenAccountsResponseSchema,
} from "./token-accounts.js";

const TOKEN_ACCOUNT = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const DELEGATE = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

const ACCOUNT = {
  address: TOKEN_ACCOUNT,
  mint: MINT,
  owner: OWNER,
  amount: 1_000_000,
  frozen: false,
};

describe("dasApiTokenAccountSchema", () => {
  it("parses a minimal token account", () => {
    const account = dasApiTokenAccountSchema.parse(ACCOUNT);

    expect(account.address).toBe(address(TOKEN_ACCOUNT));
    expect(account.mint).toBe(address(MINT));
    expect(account.owner).toBe(address(OWNER));
    expect(account.amount).toBe(1_000_000);
    expect(account.frozen).toBe(false);
    expect(account.delegate).toBeUndefined();
  });

  it("parses a delegated Token-2022 account", () => {
    const account = dasApiTokenAccountSchema.parse({
      ...ACCOUNT,
      delegated_amount: 500,
      delegate: DELEGATE,
      close_authority: OWNER,
      token_extensions: { transfer_fee_amount: { withheld_amount: 0 } },
    });

    expect(account.delegated_amount).toBe(500);
    expect(account.delegate).toBe(address(DELEGATE));
    expect(account.close_authority).toBe(address(OWNER));
    expect(account.token_extensions?.transfer_fee_amount).toEqual({
      withheld_amount: 0,
    });
  });

  it("accepts null for delegate and close_authority", () => {
    const account = dasApiTokenAccountSchema.parse({
      ...ACCOUNT,
      delegate: null,
      close_authority: null,
    });

    expect(account.delegate).toBeNull();
    expect(account.close_authority).toBeNull();
  });

  it("rejects an account with an invalid mint", () => {
    expect(() =>
      dasApiTokenAccountSchema.parse({ ...ACCOUNT, mint: "bad" }),
    ).toThrow();
  });

  it("rejects an account that is missing a required field", () => {
    const { frozen: _frozen, ...withoutFrozen } = ACCOUNT;

    expect(() => dasApiTokenAccountSchema.parse(withoutFrozen)).toThrow();
  });
});

describe("getTokenAccountsResponseSchema", () => {
  it("parses a token accounts response", () => {
    const response: GetTokenAccountsResponse =
      getTokenAccountsResponseSchema.parse({
        total: 1,
        limit: 100,
        page: 1,
        token_accounts: [ACCOUNT],
      });

    expect(response.total).toBe(1);
    expect(response.page).toBe(1);
    expect(response.token_accounts[0]?.address).toBe(address(TOKEN_ACCOUNT));
  });

  it("parses a cursor-based response", () => {
    const response = getTokenAccountsResponseSchema.parse({
      total: 0,
      limit: 100,
      cursor: "c",
      before: "b",
      after: "a",
      token_accounts: [],
    });

    expect(response.cursor).toBe("c");
    expect(response.before).toBe("b");
    expect(response.after).toBe("a");
    expect(response.token_accounts).toEqual([]);
  });

  it("rejects a response with a malformed token account", () => {
    expect(() =>
      getTokenAccountsResponseSchema.parse({
        total: 1,
        limit: 100,
        token_accounts: [{ ...ACCOUNT, owner: "bad" }],
      }),
    ).toThrow();
  });

  it("rejects a response that is missing token_accounts", () => {
    expect(() =>
      getTokenAccountsResponseSchema.parse({ total: 0, limit: 100 }),
    ).toThrow();
  });
});
