import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import * as tmath from "./tmath.js";
import type { TokenAmount } from "./types.js";

describe("tmath", () => {
  const mockTokenA = {
    mint: address("TokenA1111111111111111111111111111111111111"),
    name: "Token A",
    symbol: "TKNA",
    decimals: 9 as const,
  };

  const mockTokenB = {
    mint: address("TokenB2222222222222222222222222222222222222"),
    name: "Token B",
    symbol: "TKNB",
    decimals: 6 as const,
  };

  const mockTokenASameDecimals = {
    mint: address("TokenA1111111111111111111111111111111111111"),
    name: "Token A",
    symbol: "TKNA",
    decimals: 6 as const,
  };

  describe("add", () => {
    it("should add two token amounts with the same token", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };

      const result = tmath.add(a, b);

      expect(result.token).toBe(mockTokenA);
      expect(result.amount[0]).toBe(3000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should throw error when adding tokens with different mints", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenB,
        amount: [2000000n, 6],
      };

      expect(() => tmath.add(a, b)).toThrow(
        "Token mint mismatch: TokenA1111111111111111111111111111111111111 !== TokenB2222222222222222222222222222222222222",
      );
    });

    it("should throw error when adding tokens with different decimals", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenASameDecimals,
        amount: [2000000n, 6],
      };

      expect(() => tmath.add(a, b)).toThrow("Token decimals mismatch: 9 !== 6");
    });

    it("should handle adding zero amounts", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [0n, 9],
      };

      const result = tmath.add(a, b);

      expect(result.amount[0]).toBe(1000000000n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("sub", () => {
    it("should subtract two token amounts with the same token", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };

      const result = tmath.sub(a, b);

      expect(result.token).toBe(mockTokenA);
      expect(result.amount[0]).toBe(3000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should throw error when subtracting tokens with different mints", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenB,
        amount: [2000000n, 6],
      };

      expect(() => tmath.sub(a, b)).toThrow(
        "Token mint mismatch: TokenA1111111111111111111111111111111111111 !== TokenB2222222222222222222222222222222222222",
      );
    });

    it("should handle subtracting to zero", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };

      const result = tmath.sub(a, b);

      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle negative results", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };

      const result = tmath.sub(a, b);

      expect(result.amount[0]).toBe(-1000000000n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("mul", () => {
    it("should multiply two token amounts with the same token", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      const result = tmath.mul(a, b);

      expect(result.token).toBe(mockTokenA);
      // 2 * 3 = 6
      expect(result.amount[0]).toBe(6000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should throw error when multiplying tokens with different mints", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenB,
        amount: [3000000n, 6],
      };

      expect(() => tmath.mul(a, b)).toThrow(
        "Token mint mismatch: TokenA1111111111111111111111111111111111111 !== TokenB2222222222222222222222222222222222222",
      );
    });

    it("should handle multiplication by zero", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [0n, 9],
      };

      const result = tmath.mul(a, b);

      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle multiplication by one", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9], // 1.0 with 9 decimals
      };

      const result = tmath.mul(a, b);

      expect(result.amount[0]).toBe(5000000000n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("div", () => {
    it("should divide two token amounts with the same token", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [6000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };

      const result = tmath.div(a, b);

      expect(result.token).toBe(mockTokenA);
      // 6 / 2 = 3
      expect(result.amount[0]).toBe(3000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should throw error when dividing tokens with different mints", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [6000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenB,
        amount: [2000000n, 6],
      };

      expect(() => tmath.div(a, b)).toThrow(
        "Token mint mismatch: TokenA1111111111111111111111111111111111111 !== TokenB2222222222222222222222222222222222222",
      );
    });

    it("should handle division by one", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [1000000000n, 9], // 1.0 with 9 decimals
      };

      const result = tmath.div(a, b);

      expect(result.amount[0]).toBe(5000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle division resulting in fractions", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [2000000000n, 9],
      };

      const result = tmath.div(a, b);

      // 5 / 2 = 2.5
      expect(result.amount[0]).toBe(2500000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle division of zero", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [0n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      const result = tmath.div(a, b);

      expect(result.amount[0]).toBe(0n);
      expect(result.amount[1]).toBe(9);
    });
  });

  describe("gt", () => {
    it("should return true when a > b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.gt(a, b)).toBe(true);
    });

    it("should return false when a < b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      expect(tmath.gt(a, b)).toBe(false);
    });

    it("should return false when a === b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.gt(a, b)).toBe(false);
    });

    it("should throw error when comparing different tokens", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenB,
        amount: [3000000n, 6],
      };

      expect(() => tmath.gt(a, b)).toThrow(
        "Token mint mismatch: TokenA1111111111111111111111111111111111111 !== TokenB2222222222222222222222222222222222222",
      );
    });
  });

  describe("gte", () => {
    it("should return true when a > b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.gte(a, b)).toBe(true);
    });

    it("should return false when a < b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      expect(tmath.gte(a, b)).toBe(false);
    });

    it("should return true when a === b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.gte(a, b)).toBe(true);
    });
  });

  describe("lt", () => {
    it("should return false when a > b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.lt(a, b)).toBe(false);
    });

    it("should return true when a < b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      expect(tmath.lt(a, b)).toBe(true);
    });

    it("should return false when a === b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.lt(a, b)).toBe(false);
    });
  });

  describe("lte", () => {
    it("should return false when a > b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.lte(a, b)).toBe(false);
    });

    it("should return true when a < b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      expect(tmath.lte(a, b)).toBe(true);
    });

    it("should return true when a === b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      expect(tmath.lte(a, b)).toBe(true);
    });
  });

  describe("abs", () => {
    it("should return positive value when already positive", () => {
      const amount: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      const result = tmath.abs(amount);

      expect(result.amount[0]).toBe(5000000000n);
      expect(result.token).toBe(mockTokenA);
    });

    it("should return positive value when negative", () => {
      const amount: TokenAmount = {
        token: mockTokenA,
        amount: [-5000000000n, 9],
      };

      const result = tmath.abs(amount);

      expect(result.amount[0]).toBe(5000000000n);
      expect(result.token).toBe(mockTokenA);
    });

    it("should return zero when zero", () => {
      const amount: TokenAmount = {
        token: mockTokenA,
        amount: [0n, 9],
      };

      const result = tmath.abs(amount);

      expect(result.amount[0]).toBe(0n);
      expect(result.token).toBe(mockTokenA);
    });
  });

  describe("min", () => {
    it("should return the smaller value when a < b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      const result = tmath.min(a, b);

      expect(result).toBe(a);
    });

    it("should return the smaller value when a > b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      const result = tmath.min(a, b);

      expect(result).toBe(b);
    });

    it("should return either when equal", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      const result = tmath.min(a, b);

      expect(result.amount[0]).toBe(3000000000n);
    });

    it("should throw error when comparing different tokens", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenB,
        amount: [5000000n, 6],
      };

      expect(() => tmath.min(a, b)).toThrow(
        "Token mint mismatch: TokenA1111111111111111111111111111111111111 !== TokenB2222222222222222222222222222222222222",
      );
    });
  });

  describe("max", () => {
    it("should return the larger value when a > b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      const result = tmath.max(a, b);

      expect(result).toBe(a);
    });

    it("should return the larger value when a < b", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      const result = tmath.max(a, b);

      expect(result).toBe(b);
    });

    it("should return either when equal", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [3000000000n, 9],
      };

      const result = tmath.max(a, b);

      expect(result.amount[0]).toBe(3000000000n);
    });
  });

  describe("toRaw", () => {
    it("should convert TokenAmount to raw bigint", () => {
      const amount: TokenAmount = {
        token: mockTokenA,
        amount: [5000000000n, 9],
      };

      const result = tmath.toRaw(amount);

      expect(result).toBe(5000000000n);
    });

    it("should handle zero amounts", () => {
      const amount: TokenAmount = {
        token: mockTokenA,
        amount: [0n, 9],
      };

      const result = tmath.toRaw(amount);

      expect(result).toBe(0n);
    });

    it("should handle negative amounts", () => {
      const amount: TokenAmount = {
        token: mockTokenA,
        amount: [-5000000000n, 9],
      };

      const result = tmath.toRaw(amount);

      expect(result).toBe(-5000000000n);
    });
  });

  describe("edge cases", () => {
    it("should maintain precision with large numbers", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [999999999999999999n, 9],
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [1n, 9],
      };

      const result = tmath.add(a, b);

      expect(result.amount[0]).toBe(1000000000000000000n);
      expect(result.amount[1]).toBe(9);
    });

    it("should handle operations with different decimal representations of same value", () => {
      const a: TokenAmount = {
        token: mockTokenA,
        amount: [1500000000n, 9], // 1.5
      };
      const b: TokenAmount = {
        token: mockTokenA,
        amount: [500000000n, 9], // 0.5
      };

      const addResult = tmath.add(a, b);
      expect(addResult.amount[0]).toBe(2000000000n); // 2.0

      const subResult = tmath.sub(a, b);
      expect(subResult.amount[0]).toBe(1000000000n); // 1.0

      const mulResult = tmath.mul(a, b);
      expect(mulResult.amount[0]).toBe(750000000n); // 0.75

      const divResult = tmath.div(a, b);
      expect(divResult.amount[0]).toBe(3000000000n); // 3.0
    });
  });
});
