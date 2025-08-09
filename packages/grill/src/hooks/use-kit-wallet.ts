import { useContext } from "react";
import type { WalletContextState } from "../contexts/wallet-context.js";
import { WalletContext } from "../contexts/wallet-context.js";

/**
 * Hook to access Solana Kit wallet utilities from context.
 * @returns Object containing signer (nullable), rpc, and rpcEndpoint
 * @throws Error if not within WalletProvider
 */
export function useKitWallet(): WalletContextState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useKitWallet must be used within WalletProvider");
  }
  return context;
}
