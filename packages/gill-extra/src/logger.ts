/**
 * How much console output the library is allowed to emit.
 *
 * Levels are ordered by severity: each level enables itself and everything
 * more severe. `"off"` silences the library entirely -- nothing reaches the
 * console.
 *
 * - `"off"` -- no output at all.
 * - `"error"` -- failures only.
 * - `"warn"` -- failures and recoverable problems.
 * - `"info"` -- the above plus notable lifecycle information. The default.
 * - `"debug"` -- everything, including verbose per-event dumps.
 */
export type LogLevel = "off" | "error" | "warn" | "info" | "debug";

/**
 * The log level used when none is configured.
 */
export const DEFAULT_LOG_LEVEL: LogLevel = "info";

/**
 * Severity ranking used to decide whether a message passes the configured
 * level. `off` is 0 so that nothing is ever emitted at or below it.
 */
const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  off: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

/**
 * A level-aware console.
 *
 * Every message carries the level it should be emitted at; the logger drops
 * the ones the configured level does not allow. Grouping takes a level too, so
 * a group is only opened (and only closed) when its contents would be printed.
 */
export interface Logger {
  /**
   * The level this logger was created with.
   */
  readonly level: LogLevel;
  /**
   * Whether messages at `level` are emitted. Useful for skipping expensive
   * work that only exists to produce a log line.
   */
  isEnabled: (level: LogLevel) => boolean;
  /**
   * Emits `args` at an explicit level.
   */
  log: (level: LogLevel, ...args: unknown[]) => void;
  /**
   * Emits `args` at the `"error"` level.
   */
  error: (...args: unknown[]) => void;
  /**
   * Emits `args` at the `"warn"` level.
   */
  warn: (...args: unknown[]) => void;
  /**
   * Emits `args` at the `"info"` level.
   */
  info: (...args: unknown[]) => void;
  /**
   * Emits `args` at the `"debug"` level.
   */
  debug: (...args: unknown[]) => void;
  /**
   * Opens a console group when `level` is enabled.
   */
  group: (level: LogLevel, ...args: unknown[]) => void;
  /**
   * Opens a collapsed console group when `level` is enabled.
   */
  groupCollapsed: (level: LogLevel, ...args: unknown[]) => void;
  /**
   * Closes a group opened at `level`. Takes the level so that a group which
   * was never opened is never closed.
   */
  groupEnd: (level: LogLevel) => void;
}

/**
 * Creates a {@link Logger} that writes to the console, dropping anything less
 * severe than `level`.
 *
 * @param level - The maximum verbosity to emit. Defaults to
 *   {@link DEFAULT_LOG_LEVEL}.
 *
 * @example
 * ```ts
 * const logger = createLogger("warn");
 * logger.warn("this prints");
 * logger.info("this does not");
 * ```
 */
export function createLogger(level: LogLevel = DEFAULT_LOG_LEVEL): Logger {
  const threshold = LOG_LEVEL_SEVERITY[level];

  const isEnabled = (messageLevel: LogLevel): boolean => {
    const severity = LOG_LEVEL_SEVERITY[messageLevel];
    // `off` is not a level a message can be emitted at, only one that silences.
    return severity > 0 && severity <= threshold;
  };

  const log = (messageLevel: LogLevel, ...args: unknown[]): void => {
    if (!isEnabled(messageLevel)) {
      return;
    }
    switch (messageLevel) {
      case "error": {
        console.error(...args);
        break;
      }
      case "warn": {
        console.warn(...args);
        break;
      }
      case "debug": {
        console.debug(...args);
        break;
      }
      default: {
        console.log(...args);
        break;
      }
    }
  };

  return {
    level,
    isEnabled,
    log,
    error: (...args: unknown[]) => {
      log("error", ...args);
    },
    warn: (...args: unknown[]) => {
      log("warn", ...args);
    },
    info: (...args: unknown[]) => {
      log("info", ...args);
    },
    debug: (...args: unknown[]) => {
      log("debug", ...args);
    },
    group: (messageLevel: LogLevel, ...args: unknown[]) => {
      if (isEnabled(messageLevel)) {
        console.group(...args);
      }
    },
    groupCollapsed: (messageLevel: LogLevel, ...args: unknown[]) => {
      if (isEnabled(messageLevel)) {
        console.groupCollapsed(...args);
      }
    },
    groupEnd: (messageLevel: LogLevel) => {
      if (isEnabled(messageLevel)) {
        console.groupEnd();
      }
    },
  };
}

/**
 * The logger used by functions that are not given one. Emits at
 * {@link DEFAULT_LOG_LEVEL}.
 *
 * Prefer passing the logger configured on `GrillProvider` /
 * `GrillHeadlessProvider` so that a single `logLevel` controls all output.
 */
export const defaultLogger: Logger = createLogger(DEFAULT_LOG_LEVEL);
