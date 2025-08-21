import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { createTokenAmount } from "./create-token-amount.js";
import type { TokenInfo } from "./types.js";

describe("createTokenAmount", () => {
  const usdcToken: TokenInfo<string, 6> = {
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6 as const,
    iconURL: "https://example.com/usdc.png",
  };

  const solToken: TokenInfo<string, 9> = {
    mint: address("So11111111111111111111111111111111111111112"),
    name: "Wrapped SOL",
    symbol: "SOL",
    decimals: 9 as const,
  };

  const nftToken: TokenInfo<string, 0> = {
    mint: address("NFTxPQ2aULDsaBgn5BdgKGZvQF6QKPDSipWrmNGVwUp"),
    name: "Cool NFT",
    symbol: "CNFT",
    decimals: 0 as const,
  };

  describe("basic functionality", () => {
    it("should create a TokenAmount with USDC token", () => {
      const amount = createTokenAmount(usdcToken, 1000000n); // 1 USDC

      expect(amount).toEqual({
        token: usdcToken,
        amount: [1000000n, 6],
      });
    });

    it("should create a TokenAmount with SOL token", () => {
      const amount = createTokenAmount(solToken, 1000000000n); // 1 SOL

      expect(amount).toEqual({
        token: solToken,
        amount: [1000000000n, 9],
      });
    });

    it("should create a TokenAmount with zero decimals", () => {
      const amount = createTokenAmount(nftToken, 1n);

      expect(amount).toEqual({
        token: nftToken,
        amount: [1n, 0],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle zero amount", () => {
      const amount = createTokenAmount(usdcToken, 0n);

      expect(amount).toEqual({
        token: usdcToken,
        amount: [0n, 6],
      });
    });

    it("should handle very large amounts", () => {
      const largeAmount = 1000000000000000000n;
      const amount = createTokenAmount(solToken, largeAmount);

      expect(amount).toEqual({
        token: solToken,
        amount: [largeAmount, 9],
      });
    });

    it("should handle fractional amounts in smallest units", () => {
      const amount = createTokenAmount(usdcToken, 123456n); // 0.123456 USDC

      expect(amount).toEqual({
        token: usdcToken,
        amount: [123456n, 6],
      });
    });

    it("should handle single unit amount", () => {
      const amount = createTokenAmount(usdcToken, 1n); // 0.000001 USDC

      expect(amount).toEqual({
        token: usdcToken,
        amount: [1n, 6],
      });
    });
  });

  describe("type preservation", () => {
    it("should preserve specific mint type", () => {
      const specificToken: TokenInfo<
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        6
      > = {
        mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6 as const,
      };

      const amount = createTokenAmount(specificToken, 1000000n);

      expect(amount.token.mint).toBe(
        address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
      );
      expect(amount.amount[1]).toBe(6);
    });

    it("should work with generic token info", () => {
      const genericToken: TokenInfo = {
        mint: address("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
        name: "Generic Token",
        symbol: "GEN",
        decimals: 8,
      };

      const amount = createTokenAmount(genericToken, 100000000n);

      expect(amount).toEqual({
        token: genericToken,
        amount: [100000000n, 8],
      });
    });
  });

  describe("with different decimal places", () => {
    it("should handle 18 decimals", () => {
      const token18: TokenInfo<string, 18> = {
        mint: address("MxZ5KhSytcnFEPJk9xxnSBkwvveKGVbWBNUBfrkvuMp"),
        name: "Max Decimals",
        symbol: "MAX",
        decimals: 18 as const,
      };

      const amount = createTokenAmount(token18, 1000000000000000000n); // 1 token

      expect(amount).toEqual({
        token: token18,
        amount: [1000000000000000000n, 18],
      });
    });

    it("should handle 2 decimals", () => {
      const token2: TokenInfo<string, 2> = {
        mint: address("2DcTknWpTG1bqhS4NqtwsmJHUXaA5Rai7DfPYyKN9oDh"),
        name: "Two Decimal Token",
        symbol: "TDT",
        decimals: 2 as const,
      };

      const amount = createTokenAmount(token2, 100n); // 1 token

      expect(amount).toEqual({
        token: token2,
        amount: [100n, 2],
      });
    });
  });

  describe("immutability", () => {
    it("should create a new TokenAmount object each time", () => {
      const amount1 = createTokenAmount(usdcToken, 1000000n);
      const amount2 = createTokenAmount(usdcToken, 1000000n);

      expect(amount1).not.toBe(amount2);
      expect(amount1).toEqual(amount2);
    });

    it("should use the same token reference", () => {
      const amount1 = createTokenAmount(usdcToken, 1000000n);
      const amount2 = createTokenAmount(usdcToken, 2000000n);

      expect(amount1.token).toBe(amount2.token);
    });
  });
});
