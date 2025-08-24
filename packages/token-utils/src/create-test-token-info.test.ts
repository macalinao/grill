import { describe, expect, it } from "bun:test";
import { createTestTokenInfo } from "./create-test-token-info.js";

describe("createTestTokenInfo", () => {
  it("should create TokenInfo for testing", () => {
    const tokenInfo = createTestTokenInfo(
      "So11111111111111111111111111111111111111112",
      9,
    );

    expect(tokenInfo.mint.toString()).toBe(
      "So11111111111111111111111111111111111111112",
    );
    expect(tokenInfo.symbol).toBe("So11");
    expect(tokenInfo.name).toBe("Token So11");
    expect(tokenInfo.decimals).toBe(9);
  });

  it("should work with USDC-like tokens", () => {
    const tokenInfo = createTestTokenInfo(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      6,
    );

    expect(tokenInfo.mint.toString()).toBe(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    );
    expect(tokenInfo.symbol).toBe("EPjF");
    expect(tokenInfo.name).toBe("Token EPjF");
    expect(tokenInfo.decimals).toBe(6);
  });

  it("should handle various decimal values", () => {
    const token0 = createTestTokenInfo(
      "NFT1111111111111111111111111111111111111111",
      0,
    );
    expect(token0.decimals).toBe(0);
    expect(token0.symbol).toBe("NFT1");

    const token18 = createTestTokenInfo(
      "ETH1111111111111111111111111111111111111111",
      18,
    );
    expect(token18.decimals).toBe(18);
    expect(token18.symbol).toBe("ETH1");
  });

  it("should preserve generic types", () => {
    const tokenInfo = createTestTokenInfo<
      "TestToken1111111111111111111111111111111111",
      6
    >("TestToken1111111111111111111111111111111111", 6);

    // Type assertions to ensure generics are preserved
    const _mintType: "TestToken1111111111111111111111111111111111" =
      tokenInfo.mint as "TestToken1111111111111111111111111111111111";
    const _decimalsType: 6 = tokenInfo.decimals;
    void _mintType;
    void _decimalsType;

    expect(tokenInfo.mint.toString()).toBe(
      "TestToken1111111111111111111111111111111111",
    );
    expect(tokenInfo.symbol).toBe("Test");
    expect(tokenInfo.name).toBe("Token Test");
    expect(tokenInfo.decimals).toBe(6);
  });
});
