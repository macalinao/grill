import type {
  Address,
  TransactionPartialSigner,
  TransactionSendingSigner,
} from "@solana/kit";
import { createContext } from "react";

/**
 * A signer usable by grill. It can always send transactions
 * ({@link TransactionSendingSigner}) and, when the underlying wallet supports
 * signing without sending, it can also sign them
 * ({@link TransactionPartialSigner}) — enabling `useSignTX`.
 */
export type GrillSigner = TransactionSendingSigner<Address> &
  Partial<Pick<TransactionPartialSigner<Address>, "signTransactions">>;

/**
 * Context state for providing Solana Kit wallet utilities throughout the app.
 */
export interface WalletContextState {
  /** The transaction signer, null when wallet is not connected */
  signer: GrillSigner | null;
}

/**
 * React context for wallet-related functionality
 */
export const WalletContext: React.Context<WalletContextState | undefined> =
  createContext<WalletContextState | undefined>(undefined);
