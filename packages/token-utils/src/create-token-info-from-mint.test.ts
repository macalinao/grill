import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { createTokenInfoFromMint } from "./create-token-info-from-mint.js";

describe("createTokenInfoFromMint", () => {
  it("should create TokenInfo from mint with generated symbol and name", () => {
    const mintAddress = address("TokenA1111111111111111111111111111111111111");
    const mint = {
      address: mintAddress,
      data: { decimals: 9 as const },
    };

    const tokenInfo = createTokenInfoFromMint(mint);

    expect(tokenInfo.mint).toBe(mintAddress);
    expect(tokenInfo.symbol).toBe("Toke");
    expect(tokenInfo.name).toBe("Token Toke");
    expect(tokenInfo.decimals).toBe(9);
  });

  it("should handle different decimals", () => {
    const mintAddress = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const mint = {
      address: mintAddress,
      data: { decimals: 6 as const },
    };

    const tokenInfo = createTokenInfoFromMint(mint);

    expect(tokenInfo.mint).toBe(mintAddress);
    expect(tokenInfo.symbol).toBe("EPjF");
    expect(tokenInfo.name).toBe("Token EPjF");
    expect(tokenInfo.decimals).toBe(6);
  });

  it("should preserve generic types", () => {
    const mintAddress = address("So11111111111111111111111111111111111111112");
    const mint = {
      address: mintAddress,
      data: { decimals: 9 as const },
    };

    const tokenInfo = createTokenInfoFromMint<
      "So11111111111111111111111111111111111111112",
      9
    >(mint);

    // Type assertions to ensure generics are preserved
    const _mintType: "So11111111111111111111111111111111111111112" =
      tokenInfo.mint as "So11111111111111111111111111111111111111112";
    const _decimalsType: 9 = tokenInfo.decimals;
    void _mintType;
    void _decimalsType;

    expect(tokenInfo.mint).toBe(mintAddress);
    expect(tokenInfo.symbol).toBe("So11");
    expect(tokenInfo.name).toBe("Token So11");
    expect(tokenInfo.decimals).toBe(9);
  });
});
