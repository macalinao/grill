import type { ClientWithReactiveSigner } from "@macalinao/grill";
import { useClientCapability } from "@solana/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { install } from "@solana/webcrypto-ed25519-polyfill";
import { useLayoutEffect, useMemo } from "react";
import { createWalletTransactionSendingSigner } from "./wallet-transaction-sending-signer.js";

// Install the polyfill
install();

export interface WalletAdapterCompatProviderProps {
  children?: React.ReactNode;
}

/**
 * Bridges @solana/wallet-adapter to @solana/kit: creates a
 * `TransactionSendingSigner` from the connected wallet-adapter wallet and
 * writes it to the kit client's `payer` and `identity` with
 * `client.setSigner(...)`, clearing it when the wallet disconnects.
 *
 * Must be rendered inside `ClientProvider` from `@solana/react` (whose client
 * has grill's `reactiveSigner()` plugin installed) and inside wallet-adapter's
 * `ConnectionProvider` and `WalletProvider`. Read the signer with grill's
 * `useWalletSigner` / `useConnectedWallet`, or `usePayer` from
 * `@solana/react`.
 */
export const WalletAdapterCompatProvider: React.FC<
  WalletAdapterCompatProviderProps
> = ({ children }) => {
  const client = useClientCapability<ClientWithReactiveSigner>({
    capability: "setSigner",
    hookName: "WalletAdapterCompatProvider",
    providerHint:
      "Install `reactiveSigner()` from `@macalinao/grill` on the client passed to `ClientProvider`.",
  });
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction, connected } =
    useWallet();

  // Create the signer when wallet is connected
  const signer = useMemo(() => {
    if (!(connected && publicKey)) {
      return null;
    }

    try {
      return createWalletTransactionSendingSigner(
        { publicKey, sendTransaction, signTransaction },
        connection,
      );
    } catch (error) {
      console.error("Failed to create transaction sending signer:", error);
      return null;
    }
  }, [connected, publicKey, sendTransaction, signTransaction, connection]);

  // A layout effect so the signer is on the client before the browser paints.
  useLayoutEffect(() => {
    client.setSigner(signer);
    return () => {
      client.setSigner(null);
    };
  }, [client, signer]);

  return <>{children}</>;
};
