import type { Mock } from "bun:test";
import type { LogLevel } from "./logger.js";
import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { createLogger, DEFAULT_LOG_LEVEL, defaultLogger } from "./logger.js";

/** Every console method the logger is allowed to reach for. */
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

type ConsoleSpies = Record<ConsoleMethod, Mock<(...args: unknown[]) => void>>;

let spies: ConsoleSpies;

beforeEach(() => {
  spies = Object.fromEntries(
    CONSOLE_METHODS.map((method) => [
      method,
      spyOn(console, method).mockImplementation(() => {
        // Swallow the output; the tests only care that it was attempted.
      }),
    ]),
  ) as ConsoleSpies;
});

afterEach(() => {
  for (const method of CONSOLE_METHODS) {
    spies[method].mockRestore();
  }
});

/** Total number of console calls across every method. */
function totalCalls(): number {
  return CONSOLE_METHODS.reduce(
    (sum, method) => sum + spies[method].mock.calls.length,
    0,
  );
}

/** Exercises every logger entry point at every level. */
function logEverything(level: LogLevel): void {
  const logger = createLogger(level);
  logger.error("error");
  logger.warn("warn");
  logger.info("info");
  logger.debug("debug");
  for (const messageLevel of [
    "off",
    "error",
    "warn",
    "info",
    "debug",
  ] as const) {
    logger.log(messageLevel, "log");
    logger.group(messageLevel, "group");
    logger.groupCollapsed(messageLevel, "groupCollapsed");
    logger.groupEnd(messageLevel);
  }
}

describe("createLogger", () => {
  it("defaults to the info level", () => {
    expect(DEFAULT_LOG_LEVEL).toBe("info");
    expect(createLogger().level).toBe("info");
    expect(defaultLogger.level).toBe("info");
  });

  it("emits errors, warnings and info at the default level, but not debug", () => {
    const logger = createLogger();

    logger.error("boom");
    logger.warn("careful");
    logger.info("fyi");
    logger.debug("noisy");

    expect(spies.error).toHaveBeenCalledWith("boom");
    expect(spies.warn).toHaveBeenCalledWith("careful");
    expect(spies.log).toHaveBeenCalledWith("fyi");
    expect(spies.debug).not.toHaveBeenCalled();
  });

  it("emits nothing at all when off", () => {
    logEverything("off");

    expect(totalCalls()).toBe(0);
  });

  it("emits only errors at the error level", () => {
    const logger = createLogger("error");

    logger.error("boom");
    logger.warn("careful");
    logger.info("fyi");
    logger.debug("noisy");

    expect(spies.error).toHaveBeenCalledTimes(1);
    expect(spies.warn).not.toHaveBeenCalled();
    expect(spies.log).not.toHaveBeenCalled();
    expect(spies.debug).not.toHaveBeenCalled();
  });

  it("emits errors and warnings at the warn level", () => {
    const logger = createLogger("warn");

    logger.error("boom");
    logger.warn("careful");
    logger.info("fyi");
    logger.debug("noisy");

    expect(spies.error).toHaveBeenCalledTimes(1);
    expect(spies.warn).toHaveBeenCalledTimes(1);
    expect(spies.log).not.toHaveBeenCalled();
    expect(spies.debug).not.toHaveBeenCalled();
  });

  it("emits everything at the debug level", () => {
    const logger = createLogger("debug");

    logger.error("boom");
    logger.warn("careful");
    logger.info("fyi");
    logger.debug("noisy");

    expect(spies.error).toHaveBeenCalledTimes(1);
    expect(spies.warn).toHaveBeenCalledTimes(1);
    expect(spies.log).toHaveBeenCalledTimes(1);
    expect(spies.debug).toHaveBeenCalledTimes(1);
  });

  it("passes every argument through", () => {
    const logger = createLogger("debug");
    const details = { attempt: 2 };

    logger.warn("retrying:", details);

    expect(spies.warn).toHaveBeenCalledWith("retrying:", details);
  });

  it("reports which levels are enabled", () => {
    const logger = createLogger("warn");

    expect(logger.isEnabled("error")).toBe(true);
    expect(logger.isEnabled("warn")).toBe(true);
    expect(logger.isEnabled("info")).toBe(false);
    expect(logger.isEnabled("debug")).toBe(false);
    // `off` is never a level a message is emitted at.
    expect(logger.isEnabled("off")).toBe(false);
    expect(createLogger("debug").isEnabled("off")).toBe(false);
  });

  it("only opens and closes groups whose level is enabled", () => {
    const logger = createLogger("warn");

    logger.group("warn", "shown");
    logger.groupEnd("warn");
    logger.groupCollapsed("info", "hidden");
    logger.groupEnd("info");

    expect(spies.group).toHaveBeenCalledTimes(1);
    expect(spies.group).toHaveBeenCalledWith("shown");
    expect(spies.groupCollapsed).not.toHaveBeenCalled();
    expect(spies.groupEnd).toHaveBeenCalledTimes(1);
  });

  it("routes each level to its console method", () => {
    const logger = createLogger("debug");

    logger.log("error", "e");
    logger.log("warn", "w");
    logger.log("info", "i");
    logger.log("debug", "d");
    logger.log("off", "nothing");

    expect(spies.error).toHaveBeenCalledWith("e");
    expect(spies.warn).toHaveBeenCalledWith("w");
    expect(spies.log).toHaveBeenCalledWith("i");
    expect(spies.debug).toHaveBeenCalledWith("d");
    expect(totalCalls()).toBe(4);
  });
});
