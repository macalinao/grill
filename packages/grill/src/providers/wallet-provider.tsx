import type { Address, TransactionSendingSigner } from "@solana/kit";
import type { FC, ReactNode } from "react";
import { WalletContext } from "../contexts/wallet-context.js";

export interface WalletProviderProps {
  children: ReactNode;
  /** The transaction sending signer, or null if wallet is not connected */
  signer: TransactionSendingSigner<Address> | null;
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
