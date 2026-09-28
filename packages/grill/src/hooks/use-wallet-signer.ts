import type { ClientWithPayer, ClientWithSubscribeToPayer } from "@solana/kit";
import type { GrillSigner } from "../types.js";
import { isTransactionSendingSigner } from "@solana/kit";
import { useClient, usePayer } from "@solana/react";

/**
 * Returns the connected wallet's signer: the `payer` of the kit client from
 * `@solana/react`'s `ClientProvider`, or `null` when no wallet is connected.
 *
 * Re-renders when the payer changes, as long as the client advertises
 * `subscribeToPayer` -- which {@link reactiveSigner} and
 * `@solana/kit-plugin-wallet` both do.
 *
 * Grill sends transactions with this signer as the fee payer, so it must be a
 * `TransactionSendingSigner`. A payer that cannot send (for example a
 * keypair signer installed with `@solana/kit-plugin-signer`) is treated as no
 * wallet. A client with no payer capability at all also yields `null`, so
 * read-only apps need no signer plugin.
 *
 * @returns The signer, or `null` when not connected
 */
export function useWalletSigner(): GrillSigner | null {
  const client =
    useClient<Partial<ClientWithPayer & ClientWithSubscribeToPayer>>();
  // `usePayer` reads `client.payer` inside a try/catch, so a client without a
  // payer (or whose payer getter throws while disconnected) yields undefined.
  const payer = usePayer(
    client as ClientWithPayer & Partial<ClientWithSubscribeToPayer>,
  );
  return payer && isTransactionSendingSigner(payer) ? payer : null;
}
