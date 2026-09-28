import type {
  Address,
  Signature,
  TransactionPartialSigner,
  TransactionSendingSigner,
} from "@solana/kit";

/**
 * A signer usable by grill. It can always send transactions
 * ({@link TransactionSendingSigner}) and, when the underlying wallet supports
 * signing without sending, it can also sign them
 * ({@link TransactionPartialSigner}) — enabling `useSignTX`.
 */
export type GrillSigner = TransactionSendingSigner<Address> &
  Partial<Pick<TransactionPartialSigner<Address>, "signTransactions">>;

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
      type: "signed";
    }
  | {
      type: "error-transaction-send-failed";
      errorMessage: string;
    }
  | {
      type: "error-transaction-sign-failed";
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
  | {
      type: "error-simulation-failed";
      errorMessage: string;
    }
);

export type TransactionStatusEventCallback = (
  e: TransactionStatusEvent,
) => void;
