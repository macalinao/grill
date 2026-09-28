import type {
  Address,
  ClientWithIdentity,
  ClientWithPayer,
  ClientWithSubscribeToIdentity,
  ClientWithSubscribeToPayer,
  ExtendedClient,
  TransactionSendingSigner,
} from "@solana/kit";
import {
  extendClient,
  SOLANA_ERROR__WALLET__NO_SIGNER_CONNECTED,
  SolanaError,
} from "@solana/kit";

/**
 * A kit client whose `payer` and `identity` are a signer that can change at
 * runtime -- typically the connected wallet. Installed by
 * {@link reactiveSigner}.
 *
 * `payer` and `identity` are the same signer. Reading either while no signer
 * is set throws a `SolanaError` with code
 * `SOLANA_ERROR__WALLET__NO_SIGNER_CONNECTED`, matching
 * `@solana/kit-plugin-wallet`; `usePayer` / `useIdentity` from `@solana/react`
 * turn that into `undefined`.
 */
export interface ClientWithReactiveSigner
  extends
    ClientWithPayer,
    ClientWithIdentity,
    ClientWithSubscribeToPayer,
    ClientWithSubscribeToIdentity {
  readonly payer: TransactionSendingSigner<Address>;
  readonly identity: TransactionSendingSigner<Address>;
  /**
   * Replaces the signer exposed as `payer` and `identity`, or clears it with
   * `null` when the wallet disconnects. Notifies `subscribeToPayer` and
   * `subscribeToIdentity` listeners when the signer changes.
   */
  readonly setSigner: (
    signer: TransactionSendingSigner<Address> | null,
  ) => void;
}

/**
 * Kit plugin that installs a mutable signer as the client's `payer` and
 * `identity`, plus the `subscribeToPayer` / `subscribeToIdentity` hooks from
 * `@solana/plugin-interfaces`, so `usePayer` / `useIdentity` from
 * `@solana/react` (and grill's `useWalletSigner`) re-render when it changes.
 *
 * Something outside the client -- usually a wallet bridge such as
 * `WalletAdapterCompatProvider` from `@macalinao/wallet-adapter-compat` --
 * calls `client.setSigner(...)` as the wallet connects and disconnects.
 *
 * @param initialSigner - The signer to start with. Defaults to `null` (no
 * wallet connected).
 *
 * @example
 * ```ts
 * const client = createClient()
 *   .use(solanaRpcConnection({ rpcUrl }))
 *   .use(reactiveSigner());
 *
 * client.setSigner(walletSigner); // on connect
 * client.setSigner(null); // on disconnect
 * ```
 */
export function reactiveSigner(
  initialSigner: TransactionSendingSigner<Address> | null = null,
): <T extends object>(
  client: T,
) => ExtendedClient<T, ClientWithReactiveSigner> {
  return <T extends object>(client: T) => {
    let current = initialSigner;
    const listeners = new Set<() => void>();

    const subscribe = (listener: () => void): (() => void) => {
      // Wrap so that subscribing the same function twice (e.g. to both payer
      // and identity) yields two independent subscriptions.
      const entry = (): void => {
        listener();
      };
      listeners.add(entry);
      return () => {
        listeners.delete(entry);
      };
    };

    const getSigner = (): TransactionSendingSigner<Address> => {
      if (!current) {
        throw new SolanaError(SOLANA_ERROR__WALLET__NO_SIGNER_CONNECTED, {
          status: "disconnected",
        });
      }
      return current;
    };

    const setSigner = (
      signer: TransactionSendingSigner<Address> | null,
    ): void => {
      if (signer === current) {
        return;
      }
      current = signer;
      for (const listener of listeners) {
        listener();
      }
    };

    const additions = {
      subscribeToPayer: subscribe,
      subscribeToIdentity: subscribe,
      setSigner,
    };
    // Non-enumerable getters, as in `@solana/kit-plugin-wallet`: they throw
    // while disconnected, so `Object.entries(client)` must not read them.
    Object.defineProperties(additions, {
      payer: { configurable: true, enumerable: false, get: getSigner },
      identity: { configurable: true, enumerable: false, get: getSigner },
    });

    return extendClient(client, additions as ClientWithReactiveSigner);
  };
}
