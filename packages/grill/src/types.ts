import type { ReactNode } from "react";
import type { TransactionStatusEvent } from "./hooks/use-send-tx.js";

export type TransactionStatusEventCallback = (
  e: TransactionStatusEvent,
) => void;

/**
 * Props for the GrillProvider component
 */
export interface GrillProviderProps {
  children: ReactNode;
  /** Maximum number of accounts to batch in a single request. Defaults to 99. */
  maxBatchSize?: number;
  /** Duration in milliseconds to wait before sending a batch. Defaults to 10ms. */
  batchDurationMs?: number;
  onTransactionStatusEvent?: TransactionStatusEventCallback;
}
