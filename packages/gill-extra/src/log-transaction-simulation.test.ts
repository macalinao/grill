import type { Blockhash } from "@solana/kit";
import type { Mock } from "bun:test";
import type { SimulationResultValue } from "./log-transaction-simulation.js";
import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import {
  address,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import {
  createSimulationDebugBlock,
  formatSimulationLog,
  logTransactionSimulation,
} from "./log-transaction-simulation.js";
import { createLogger } from "./logger.js";

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

describe("logTransactionSimulation log levels", () => {
  const CONSOLE_METHODS = [
    "log",
    "error",
    "warn",
    "debug",
    "group",
    "groupCollapsed",
    "groupEnd",
  ] as const;

  type ConsoleMethod = (typeof CONSOLE_METHODS)[number];

  let spies: Record<ConsoleMethod, Mock<(...args: unknown[]) => void>>;

  beforeEach(() => {
    spies = Object.fromEntries(
      CONSOLE_METHODS.map((method) => [
        method,
        spyOn(console, method).mockImplementation(() => {
          // Swallow the output; the tests only care that it was attempted.
        }),
      ]),
    ) as Record<ConsoleMethod, Mock<(...args: unknown[]) => void>>;
  });

  afterEach(() => {
    for (const method of CONSOLE_METHODS) {
      spies[method].mockRestore();
    }
  });

  const totalCalls = (): number =>
    CONSOLE_METHODS.reduce(
      (sum, method) => sum + spies[method].mock.calls.length,
      0,
    );

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (message) =>
      setTransactionMessageFeePayer(
        address("SysvarC1ock11111111111111111111111111111111"),
        message,
      ),
    (message) =>
      setTransactionMessageLifetimeUsingBlockhash(
        {
          blockhash: "11111111111111111111111111111111" as Blockhash,
          lastValidBlockHeight: 100n,
        },
        message,
      ),
  );

  const FAILED: SimulationResultValue = {
    err: "AccountNotFound",
    logs: ["Program invoked", "Program log: boom"],
  };

  const SUCCEEDED: SimulationResultValue = {
    err: null,
    logs: ["Program invoked"],
  };

  it("emits nothing when the logger is off", () => {
    for (const simulationResult of [FAILED, SUCCEEDED]) {
      logTransactionSimulation({
        title: "Swap",
        simulationResult,
        transactionMessage,
        logger: createLogger("off"),
      });
    }

    expect(totalCalls()).toBe(0);
  });

  it("reports a failed simulation at the error level", () => {
    logTransactionSimulation({
      title: "Swap",
      simulationResult: FAILED,
      transactionMessage,
      logger: createLogger("error"),
    });

    expect(spies.group).toHaveBeenCalled();
    expect(spies.error).toHaveBeenCalled();
    expect(spies.log).not.toHaveBeenCalled();
  });

  it("reports a successful simulation at the info level", () => {
    logTransactionSimulation({
      title: "Swap",
      simulationResult: SUCCEEDED,
      transactionMessage,
      logger: createLogger("error"),
    });

    expect(totalCalls()).toBe(0);

    logTransactionSimulation({
      title: "Swap",
      simulationResult: SUCCEEDED,
      transactionMessage,
      logger: createLogger("info"),
    });

    expect(spies.log).toHaveBeenCalled();
  });

  it("uses the default logger, which is info, when none is given", () => {
    logTransactionSimulation({
      title: "Swap",
      simulationResult: SUCCEEDED,
      transactionMessage,
    });

    expect(spies.log).toHaveBeenCalled();
    expect(spies.debug).not.toHaveBeenCalled();
  });
});
