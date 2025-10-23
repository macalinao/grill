import type { TransactionSendingSigner } from "@solana/kit";
import { createContext } from "react";

/**
 * Context state for providing Solana Kit wallet utilities throughout the app.
 */
export interface WalletContextState {
  /** The transaction sending signer, null when wallet is not connected */
  signer: TransactionSendingSigner | null;
}

/**
 * React context for wallet-related functionality
 */
export const WalletContext: React.Context<WalletContextState | undefined> =
  createContext<WalletContextState | undefined>(undefined);
