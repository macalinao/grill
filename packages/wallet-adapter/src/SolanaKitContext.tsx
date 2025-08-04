import type {
  Address,
  Rpc,
  SolanaRpcApi,
  TransactionSendingSigner,
} from "@solana/kit";
import { createSolanaRpc } from "@solana/kit";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { install } from "@solana/webcrypto-ed25519-polyfill";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import { createWalletTransactionSendingSigner } from "../signers/walletTransactionSendingSigner.js";

install();

/**
 * Context for providing Solana Kit utilities throughout the app.
 */
export interface SolanaKitContextState {
  signer: TransactionSendingSigner<Address> | null;
  rpc: Rpc<SolanaRpcApi>;
  rpcEndpoint: string;
}

const SolanaKitContext = createContext<SolanaKitContextState | undefined>(
  undefined,
);

/**
 * Provider component that creates and provides Solana Kit utilities.
 */
export function SolanaKitProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const rpcEndpoint = connection.rpcEndpoint;

  // Create RPC client
  const rpc = useMemo(() => {
    return createSolanaRpc(rpcEndpoint);
  }, [rpcEndpoint]);

  // Create the signer when wallet is connected
  const signer = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    try {
      return createWalletTransactionSendingSigner(wallet, connection);
    } catch (error) {
      console.error("Failed to create transaction sending signer:", error);
      return null;
    }
  }, [wallet, connection]);

  const value = useMemo(
    () => ({
      signer,
      rpc,
      rpcEndpoint,
    }),
    [signer, rpc, rpcEndpoint],
  );

  return (
    <SolanaKitContext.Provider value={value}>
      {children}
    </SolanaKitContext.Provider>
  );
}

/**
 * Hook to access Solana Kit utilities from context.
 * @returns Object containing signer (nullable) and rpc (always available)
 * @throws Error if not within SolanaKitProvider
 */
export function useSolanaKit() {
  const context = useContext(SolanaKitContext);
  if (!context) {
    throw new Error("useSolanaKit must be used within SolanaKitProvider");
  }
  return context;
}

/**
 * Hook to access the TransactionSendingSigner from context.
 * @returns The TransactionSendingSigner or null if wallet is not connected
 */
export function useTransactionSendingSigner() {
  const { signer } = useSolanaKit();
  return signer;
}

/**
 * Hook that returns a non-null TransactionSendingSigner.
 * Throws an error if the wallet is not connected.
 * @returns The TransactionSendingSigner
 */
export function useRequiredTransactionSendingSigner() {
  const signer = useTransactionSendingSigner();
  if (!signer) {
    throw new Error("Wallet must be connected to use TransactionSendingSigner");
  }
  return signer;
}
