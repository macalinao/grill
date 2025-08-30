import { WalletProvider } from "@macalinao/grill";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { install } from "@solana/webcrypto-ed25519-polyfill";
import { useMemo } from "react";
import { createWalletTransactionSendingSigner } from "./walletTransactionSendingSigner.js";

// Install the polyfill
install();

export interface WalletAdapterCompatProviderProps {
  children: React.ReactNode;
}

/**
 * A compatibility provider that creates a TransactionSendingSigner from
 * wallet-adapter and provides it through grill's WalletProvider.
 *
 * This bridges the gap between @solana/wallet-adapter and @solana/kit.
 */
export const WalletAdapterCompatProvider: React.FC<
  WalletAdapterCompatProviderProps
> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Create the signer when wallet is connected
  const signer = useMemo(() => {
    if (!(wallet.connected && wallet.publicKey && wallet.signTransaction)) {
      return null;
    }

    try {
      return createWalletTransactionSendingSigner(wallet, connection);
    } catch (error) {
      console.error("Failed to create transaction sending signer:", error);
      return null;
    }
  }, [wallet, connection]);

  return <WalletProvider signer={signer}>{children}</WalletProvider>;
};
