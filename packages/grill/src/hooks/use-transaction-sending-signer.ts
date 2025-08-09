import { useKitWallet } from "./use-kit-wallet.js";

/**
 * Hook to access the TransactionSendingSigner from context.
 * @returns The TransactionSendingSigner or null if wallet is not connected
 */
export function useTransactionSendingSigner() {
  const { signer } = useKitWallet();
  return signer;
}

/**
 * Hook that returns a non-null TransactionSendingSigner.
 * Throws an error if the wallet is not connected.
 * @returns The TransactionSendingSigner
 * @throws Error if wallet is not connected
 */
export function useRequiredTransactionSendingSigner() {
  const signer = useTransactionSendingSigner();
  if (!signer) {
    throw new Error("Wallet must be connected to use TransactionSendingSigner");
  }
  return signer;
}