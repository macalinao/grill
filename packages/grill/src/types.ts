import type { TransactionStatusEvent } from "./hooks/use-send-tx.js";

export type TransactionStatusEventCallback = (
  e: TransactionStatusEvent,
) => void;
