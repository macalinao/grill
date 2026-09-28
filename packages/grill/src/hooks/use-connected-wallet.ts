import type { Address, TransactionSendingSigner } from "@solana/kit";
import { useWalletSigner } from "./use-wallet-signer.js";

/**
 * Get the connected wallet's signer (the kit client's `payer`), throwing an
 * error if no wallet is connected.
 *
 * Use {@link useWalletSigner} for the nullable read.
 *
 * @throws Error if no wallet is connected.
 * @returns The connected wallet's signer.
 */
export const useConnectedWallet = (): TransactionSendingSigner<Address> => {
  const signer = useWalletSigner();
  if (!signer) {
    throw new Error("Wallet is not connected");
  }
  return signer;
};
