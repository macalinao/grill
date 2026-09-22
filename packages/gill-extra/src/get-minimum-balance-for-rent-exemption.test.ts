import { describe, expect, it } from "bun:test";
import { getMinimumBalanceForRentExemption } from "./get-minimum-balance-for-rent-exemption.js";

describe("getMinimumBalanceForRentExemption", () => {
  it("charges for the storage overhead of an empty account", () => {
    expect(getMinimumBalanceForRentExemption()).toBe(890_880n);
    expect(getMinimumBalanceForRentExemption(0)).toBe(890_880n);
  });

  it("matches the known rent for a token mint and a token account", () => {
    // 82 bytes for a Mint, 165 for a token account -- the values the cluster
    // reports for these two.
    expect(getMinimumBalanceForRentExemption(82)).toBe(1_461_600n);
    expect(getMinimumBalanceForRentExemption(165)).toBe(2_039_280n);
  });

  it("accepts a bigint space", () => {
    expect(getMinimumBalanceForRentExemption(10n)).toBe(
      getMinimumBalanceForRentExemption(10),
    );
  });

  it("grows linearly with the requested space", () => {
    const base = getMinimumBalanceForRentExemption(0);
    const perByte = getMinimumBalanceForRentExemption(1) - base;
    expect(getMinimumBalanceForRentExemption(1000)).toBe(
      base + perByte * 1000n,
    );
  });
});
