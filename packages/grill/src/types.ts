import type { Signature } from "@solana/kit";

export type TransactionId = string;

export type TransactionStatusEvent = {
  title: string;
  id: TransactionId;
} & (
  | {
      type: "error-wallet-not-connected";
    }
  | {
      type: "preparing";
    }
  | {
      type: "awaiting-wallet-signature";
    }
  | {
      type: "error-transaction-send-failed";
      errorMessage: string;
    }
  | {
      type: "waiting-for-confirmation";
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "confirmed";
      sig: Signature;
      explorerLink: string;
    }
  | {
      type: "error-transaction-failed";
      errorMessage: string;
      sig: Signature;
      explorerLink: string;
    }
);

export type TransactionStatusEventCallback = (
  e: TransactionStatusEvent,
) => void;
