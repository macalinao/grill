import type { TransactionSendingSigner } from "gill";
import { useKitWallet } from "./use-kit-wallet.js";

/**
 * Get the connected wallet, throwing an error if no wallet is connected.
 * @throws Error if no wallet is connected.
 * @returns The connected wallet.
 */
export const useConnectedWallet = (): TransactionSendingSigner => {
  const { signer } = useKitWallet();
  if (!signer) {
    throw new Error("Wallet is not connected");
  }
  return signer;
};
