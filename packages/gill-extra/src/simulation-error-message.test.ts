import type { TransactionError } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { getDefaultSimulationUserErrorMessage } from "./simulation-error-message.js";

describe("getDefaultSimulationUserErrorMessage", () => {
  describe("when simulation succeeded (no error)", () => {
    it("should return 'Unknown error' when err is null", () => {
      const result = getDefaultSimulationUserErrorMessage({
        err: null,
        logs: ["Program invoked", "Program succeeded"],
      });

      expect(result).toBe("Unknown error");
    });
  });

  describe("when simulation failed with standard error", () => {
    it("should return error message for InstructionError", () => {
      const err: TransactionError = {
        InstructionError: [0, "InsufficientFunds"],
      };

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: ["Program invoked", "Program failed"],
      });

      // Solana SDK translates error codes to human-readable messages
      expect(result).toContain("insufficient funds");
    });

    it("should return error message for simple string error", () => {
      const err: TransactionError = "AccountNotFound";

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: null,
      });

      // Solana SDK translates error codes to human-readable messages
      expect(result).toContain("no record of a prior credit");
    });
  });

  describe("when simulation failed with Anchor error in logs", () => {
    it("should extract Anchor error message from logs", () => {
      const err: TransactionError = {
        InstructionError: [0, { Custom: 6000 }],
      };

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: [
          "Program invoked",
          "Program log: AnchorError caused by account: user_account. Error Code: ConstraintRaw. Error Number: 2003. Error Message: A raw constraint was violated.",
          "Program failed",
        ],
      });

      expect(result).toBe("A raw constraint was violated.");
    });

    it("should use last Anchor error when multiple exist", () => {
      const err: TransactionError = {
        InstructionError: [0, { Custom: 6001 }],
      };

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: [
          "Program invoked",
          "Program log: AnchorError caused by account: first. Error Code: FirstError. Error Number: 2001. Error Message: First error message.",
          "Program log: AnchorError caused by account: second. Error Code: SecondError. Error Number: 2002. Error Message: Second error message.",
          "Program failed",
        ],
      });

      expect(result).toBe("Second error message.");
    });
  });

  describe("edge cases", () => {
    it("should handle null logs", () => {
      const err: TransactionError = {
        InstructionError: [0, "InvalidAccountData"],
      };

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: null,
      });

      // Solana SDK translates error codes to human-readable messages
      expect(result).toContain("invalid account data");
    });

    it("should handle empty logs array", () => {
      const err: TransactionError = {
        InstructionError: [0, "InvalidArgument"],
      };

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: [],
      });

      // Solana SDK translates error codes to human-readable messages
      expect(result).toContain("invalid program argument");
    });

    it("should handle AnchorError without Error Message part", () => {
      const err: TransactionError = {
        InstructionError: [0, { Custom: 6002 }],
      };

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs: [
          "Program log: AnchorError without the expected format",
          "Program failed",
        ],
      });

      // Should fall back to Solana error since Error Message: is not found
      expect(result).toBeTruthy();
    });

    it("should handle readonly logs array", () => {
      const err: TransactionError = {
        InstructionError: [0, { Custom: 6003 }],
      };

      const logs: readonly string[] = [
        "Program invoked",
        "Program log: AnchorError caused by account: test. Error Code: TestError. Error Number: 6003. Error Message: Test error occurred.",
        "Program failed",
      ];

      const result = getDefaultSimulationUserErrorMessage({
        err,
        logs,
      });

      expect(result).toBe("Test error occurred.");
    });
  });
});
