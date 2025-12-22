import { describe, expect, it } from "bun:test";
import {
  createSimulationDebugBlock,
  formatSimulationLog,
} from "./log-transaction-simulation.js";

describe("formatSimulationLog", () => {
  it("should format error logs with red color", () => {
    const result = formatSimulationLog("Program failed: Error message");
    expect(result.text).toBe("%cProgram failed: Error message");
    expect(result.style).toBe("color: #ff6b6b;");
  });

  it("should format logs containing 'failed' with red color", () => {
    const result = formatSimulationLog("Transaction failed");
    expect(result.text).toBe("%cTransaction failed");
    expect(result.style).toBe("color: #ff6b6b;");
  });

  it("should format program logs with green color", () => {
    const result = formatSimulationLog("Program log: Hello world");
    expect(result.text).toBe("%cProgram log: Hello world");
    expect(result.style).toBe("color: #69db7c;");
  });

  it("should return plain text for other logs", () => {
    const result = formatSimulationLog("Program invoked");
    expect(result.text).toBe("Program invoked");
    expect(result.style).toBeUndefined();
  });
});

describe("createSimulationDebugBlock", () => {
  it("should create a formatted debug block for failure", () => {
    const result = createSimulationDebugBlock({
      title: "Swap Tokens",
      success: false,
      inspectorUrl: "https://explorer.solana.com/tx/inspector?message=abc",
      logs: [
        "Program invoked",
        "Program log: swap started",
        "Error: insufficient funds",
      ],
      errorMessage: "Insufficient funds",
    });

    expect(result).toContain("Transaction: Swap Tokens");
    expect(result).toContain("Status: Failed");
    expect(result).toContain("Error: Insufficient funds");
    expect(result).toContain(
      "Inspector URL: https://explorer.solana.com/tx/inspector?message=abc",
    );
    expect(result).toContain("Program invoked");
    expect(result).toContain("Program log: swap started");
    expect(result).toContain("Error: insufficient funds");
  });

  it("should create a formatted debug block for success", () => {
    const result = createSimulationDebugBlock({
      title: "Transfer SOL",
      success: true,
      inspectorUrl: "https://explorer.solana.com/tx/inspector?message=xyz",
      logs: ["Program invoked", "Program log: transfer complete"],
    });

    expect(result).toContain("Transaction: Transfer SOL");
    expect(result).toContain("Status: Success");
    expect(result).not.toContain("Error:");
    expect(result).toContain(
      "Inspector URL: https://explorer.solana.com/tx/inspector?message=xyz",
    );
  });

  it("should handle empty logs array", () => {
    const result = createSimulationDebugBlock({
      title: "Transfer",
      success: false,
      inspectorUrl: "https://explorer.solana.com/tx/inspector?message=xyz",
      logs: [],
      errorMessage: "Unknown error",
    });

    expect(result).toContain("Transaction: Transfer");
    expect(result).toContain("Error: Unknown error");
    expect(result).toContain("Logs:");
  });
});
