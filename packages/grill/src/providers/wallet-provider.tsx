import type { FC, ReactNode } from "react";
import type { GrillSigner } from "../contexts/wallet-context.js";
import { WalletContext } from "../contexts/wallet-context.js";

export interface WalletProviderProps {
  children: ReactNode;
  /**
   * The transaction signer, or null if wallet is not connected.
   * When the wallet supports signing without sending, the signer also enables
   * `useSignTX`.
   */
  signer: GrillSigner | null;
}

/**
 * Provider component that provides Solana Kit wallet utilities.
 * This provider accepts a TransactionSendingSigner and RPC endpoint.
 */
export const WalletProvider: FC<WalletProviderProps> = ({
  children,
  signer,
}) => {
  return (
    <WalletContext.Provider value={{ signer }}>
      {children}
    </WalletContext.Provider>
  );
};
