import type {
  Address,
  SignatureBytes,
  Transaction,
  TransactionPartialSigner,
  TransactionSendingSigner,
} from "@solana/kit";
import type {
  SendTransactionOptions,
  SignerWalletAdapterProps,
  SupportedTransactionVersions,
  TransactionOrVersionedTransaction,
} from "@solana/wallet-adapter-base";
import type { Connection, TransactionSignature } from "@solana/web3.js";
import { address, getBase58Encoder } from "@solana/kit";
import {
  PublicKey,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export interface WalletAdapter {
  publicKey: PublicKey | null;
  supportedTransactionVersions?: SupportedTransactionVersions;
  sendTransaction: (
    transaction: TransactionOrVersionedTransaction<
      this["supportedTransactionVersions"]
    >,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Promise<TransactionSignature>;
  /**
   * Signs a transaction without sending it. Present only when the underlying
   * wallet supports separate signing (a `SignerWalletAdapter`). When available,
   * the created signer additionally implements {@link TransactionPartialSigner},
   * enabling sign-without-send flows.
   */
  signTransaction?: SignerWalletAdapterProps["signTransaction"];
}

/**
 * A signer created from a wallet adapter. It can always send transactions
 * (via {@link TransactionSendingSigner}), and — when the wallet supports
 * signing without sending — it can also sign them
 * (via {@link TransactionPartialSigner}).
 */
export type WalletAdapterSigner = TransactionSendingSigner<Address> &
  Partial<Pick<TransactionPartialSigner<Address>, "signTransactions">>;

/**
 * Deserializes a @solana/kit transaction into a web3.js VersionedTransaction,
 * re-attaching any signatures that are already present.
 */
function toVersionedTransaction(
  transaction: Transaction,
): VersionedTransaction {
  const message = VersionedMessage.deserialize(
    Uint8Array.from(transaction.messageBytes),
  );
  const vt = new VersionedTransaction(message);
  for (const [publicKey, signature] of Object.entries(transaction.signatures)) {
    if (signature) {
      vt.addSignature(new PublicKey(publicKey), signature);
    }
  }
  return vt;
}

/**
 * Creates a signer from a Solana wallet adapter.
 *
 * The returned signer always implements {@link TransactionSendingSigner}
 * (sign + send atomically, via the wallet adapter's `sendTransaction`). When
 * the wallet adapter also exposes `signTransaction`, the signer additionally
 * implements {@link TransactionPartialSigner} so callers can sign a transaction
 * without broadcasting it.
 *
 * Note: modeling `signTransaction` as a partial signer is correct as long as the
 * wallet does not rewrite the transaction message while signing (legacy wallet
 * adapters do not); the returned signature is for the exact message we passed in.
 *
 * @param walletAdapter - The wallet adapter instance
 * @param connection - The Solana connection
 * @returns A signer, or null when the wallet is not connected
 */
export function createWalletTransactionSendingSigner(
  walletAdapter: WalletAdapter,
  connection: Connection,
): WalletAdapterSigner | null {
  if (!walletAdapter.publicKey) {
    return null;
  }

  const { publicKey } = walletAdapter;
  const signerAddress = address(publicKey.toBase58());

  const signAndSendTransactions: TransactionSendingSigner<Address>["signAndSendTransactions"] =
    async (transactions) => {
      if (!walletAdapter.publicKey) {
        throw new Error("Wallet is not connected");
      }

      const signatures: SignatureBytes[] = [];

      // Process each transaction
      for (const transaction of transactions) {
        try {
          const vt = toVersionedTransaction(transaction);
          const sig = await walletAdapter.sendTransaction(vt, connection);
          const sigBytes = getBase58Encoder().encode(sig) as SignatureBytes;
          signatures.push(sigBytes);
        } catch (error) {
          console.error("Failed to send transaction:", error);
          throw new Error(
            `Failed to send transaction: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      return signatures;
    };

  // Only expose partial signing when the wallet supports signing without sending.
  const { signTransaction } = walletAdapter;
  const signTransactions:
    | TransactionPartialSigner<Address>["signTransactions"]
    | undefined = signTransaction
    ? async (transactions) => {
        if (!walletAdapter.publicKey) {
          throw new Error("Wallet is not connected");
        }

        return Promise.all(
          transactions.map(async (transaction) => {
            try {
              const vt = toVersionedTransaction(transaction);
              const signedVt = await signTransaction(vt);

              // Find our signature within the signed transaction. Signatures are
              // aligned to the first `numRequiredSignatures` static account keys.
              const signerIndex = signedVt.message.staticAccountKeys.findIndex(
                (key) => key.equals(publicKey),
              );
              const sigBytes = signedVt.signatures[signerIndex] as
                | SignatureBytes
                | undefined;
              if (signerIndex === -1 || !sigBytes) {
                throw new Error(
                  "Wallet did not return a signature for the fee payer.",
                );
              }

              return { [signerAddress]: sigBytes };
            } catch (error) {
              console.error("Failed to sign transaction:", error);
              throw new Error(
                `Failed to sign transaction: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }),
        );
      }
    : undefined;

  return {
    address: signerAddress,
    signAndSendTransactions,
    ...(signTransactions ? { signTransactions } : {}),
  };
}
