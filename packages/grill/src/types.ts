import type { ReactNode } from "react";

/**
 * Props for the GrillProvider component
 */
export interface GrillProviderProps {
  children: ReactNode;
  /** Maximum number of accounts to batch in a single request. Defaults to 99. */
  maxBatchSize?: number;
  /** Duration in milliseconds to wait before sending a batch. Defaults to 10ms. */
  batchDurationMs?: number;
}
