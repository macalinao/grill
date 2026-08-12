import type { GrillSigner } from "../types.js";
import { createContext } from "react";

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
