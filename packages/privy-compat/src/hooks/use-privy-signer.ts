import type { ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana";
import type { Address, TransactionSendingSigner } from "@solana/kit";
import type {
  PrivySignAndSendTransactionOptions,
  PrivySolanaChain,
} from "../types.js";
import {
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { useEffect, useMemo, useRef } from "react";
import { createPrivyTransactionSendingSigner } from "../create-privy-transaction-sending-signer.js";

export interface UsePrivySignerOptions {
  /**
   * Address of the Privy wallet to sign with.
   *
   * Defaults to the user's first connected Solana wallet, which is the common
   * case for apps with a single embedded wallet.
   */
  address?: string;
  /**
   * The cluster transactions are sent to.
   *
   * @defaultValue "solana:mainnet"
   */
  chain?: PrivySolanaChain;
  /**
   * Options forwarded to Privy on every transaction.
   *
   * Memoize this object: a new object on every render produces a new signer on
   * every render.
   */
  options?: PrivySignAndSendTransactionOptions;
}

/**
 * Builds a Kit {@link TransactionSendingSigner} from the user's Privy Solana
 * wallet.
 *
 * Returns `null` while Privy is still loading, when the user is not
 * authenticated, or when they have no Solana wallet -- so a `null` signer means
 * "no wallet to sign with yet", the same convention grill's `WalletProvider`
 * uses.
 *
 * Must be called inside Privy's `PrivyProvider`.
 *
 * @param options - Which wallet to use, and how to send its transactions.
 * @returns The signer, or `null` if no wallet is available.
 *
 * @example
 * ```tsx
 * const signer = usePrivySigner({ chain: "solana:devnet" });
 * ```
 */
export function usePrivySigner({
  address: walletAddress,
  chain = "solana:mainnet",
  options,
}: UsePrivySignerOptions = {}): TransactionSendingSigner<Address> | null {
  const { ready, wallets } = useWallets();
  const privy = useSignAndSendTransaction();

  // Privy returns a brand new `signAndSendTransaction` closure on every render.
  // Reading it through a ref keeps the signer's identity stable, so grill does
  // not rebuild its transaction pipeline every time this component renders.
  const privyRef = useRef(privy);
  useEffect(() => {
    privyRef.current = privy;
  }, [privy]);

  const wallet = useMemo<ConnectedStandardSolanaWallet | null>(() => {
    if (!ready) {
      return null;
    }
    if (walletAddress === undefined) {
      return wallets[0] ?? null;
    }
    return wallets.find(({ address }) => address === walletAddress) ?? null;
  }, [ready, wallets, walletAddress]);

  return useMemo(() => {
    if (!wallet) {
      return null;
    }
    // The ref is read when the signer sends a transaction, never while rendering.
    // eslint-disable-next-line react-hooks/refs -- read outside of render
    return createPrivyTransactionSendingSigner({
      wallet,
      chain,
      options,
      signAndSendTransaction: (input) =>
        privyRef.current.signAndSendTransaction(input),
    });
  }, [wallet, chain, options]);
}
