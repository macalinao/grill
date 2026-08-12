import type { Logger } from "@macalinao/gill-extra";
import { useGrillContext } from "../contexts/grill-context.js";

/**
 * Hook for accessing the logger configured on `GrillProvider` /
 * `GrillHeadlessProvider` via their `logLevel` prop.
 *
 * Use it for app-level logging that should be silenced along with the
 * library's own output.
 *
 * @example
 * ```tsx
 * const logger = useLogger();
 * logger.debug("swap quote", quote);
 * ```
 */
export function useLogger(): Logger {
  return useGrillContext().logger;
}
