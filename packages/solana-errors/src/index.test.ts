import { describe, expect, it } from "bun:test";
import {
  getInstructionErrorMessage,
  getTransactionErrorMessage,
} from "./index.js";

describe("getInstructionErrorMessage", () => {
  it("handles string error variants", () => {
    expect(getInstructionErrorMessage("GenericError")).toBe(
      "Generic instruction error",
    );
    expect(getInstructionErrorMessage("InvalidInstructionData")).toBe(
      "Invalid instruction data",
    );
    expect(getInstructionErrorMessage("InsufficientFunds")).toBe(
      "Insufficient funds for instruction",
    );
  });

  it("handles Custom error with number", () => {
    expect(getInstructionErrorMessage({ Custom: 1 })).toBe(
      "Custom program error: 0x1 (1)",
    );
    expect(getInstructionErrorMessage({ Custom: 6001 })).toBe(
      "Custom program error: 0x1771 (6001)",
    );
  });

  it("handles BorshIoError with message", () => {
    expect(
      getInstructionErrorMessage({ BorshIoError: "Invalid account data" }),
    ).toBe("Borsh serialization error: Invalid account data");
  });

  it("handles unknown error variants", () => {
    expect(getInstructionErrorMessage("SomeNewError")).toBe(
      "Instruction error: SomeNewError",
    );
  });

  it("handles null/undefined", () => {
    expect(getInstructionErrorMessage(null)).toBe("Unknown instruction error");
    expect(getInstructionErrorMessage(undefined)).toBe(
      "Unknown instruction error",
    );
  });
});

describe("getTransactionErrorMessage", () => {
  it("handles string error variants", () => {
    expect(getTransactionErrorMessage("AccountInUse")).toBe(
      "Account is already being processed in another transaction",
    );
    expect(getTransactionErrorMessage("BlockhashNotFound")).toBe(
      "Blockhash not found in recent blockhashes or in the blockhash queue",
    );
  });

  it("handles InstructionError", () => {
    expect(
      getTransactionErrorMessage({ InstructionError: [0, "GenericError"] }),
    ).toBe("Instruction 0 failed: Generic instruction error");

    expect(
      getTransactionErrorMessage({ InstructionError: [2, { Custom: 1234 }] }),
    ).toBe("Instruction 2 failed: Custom program error: 0x4d2 (1234)");
  });

  it("handles DuplicateInstruction", () => {
    expect(getTransactionErrorMessage({ DuplicateInstruction: 3 })).toBe(
      "Transaction contains a duplicate instruction at index 3",
    );
  });

  it("handles InsufficientFundsForRent", () => {
    expect(
      getTransactionErrorMessage({
        InsufficientFundsForRent: { account_index: 2 },
      }),
    ).toBe("Account at index 2 has insufficient funds for rent");
  });

  it("handles ProgramExecutionTemporarilyRestricted", () => {
    expect(
      getTransactionErrorMessage({
        ProgramExecutionTemporarilyRestricted: { account_index: 1 },
      }),
    ).toBe(
      "Program execution temporarily restricted for account at index 1",
    );
  });

  it("handles unknown error variants", () => {
    expect(getTransactionErrorMessage("SomeNewError")).toBe(
      "Transaction error: SomeNewError",
    );
  });
});
