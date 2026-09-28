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
import {
  address,
  getBase58Encoder,
  getTransactionVersionDecoder,
} from "@solana/kit";
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
  signTransaction?: SignerWalletAdapterProps["signTransaction"] | undefined;
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
 * Throws when any of the transactions is version 1. Wallet adapters take
 * `@solana/web3.js` transactions, and web3.js can parse version 1 messages but
 * not serialize them, so a v1 transaction would otherwise fail inside the
 * wallet. Checked up front so nothing in a batch is signed or sent.
 */
function assertNoV1Transactions(transactions: readonly Transaction[]): void {
  const versionDecoder = getTransactionVersionDecoder();
  for (const transaction of transactions) {
    // Throws for versions kit does not know (> 1).
    const version = versionDecoder.decode(transaction.messageBytes);
    if (version === 1) {
      throw new Error(
        `Version ${version} transactions cannot be sent through a wallet adapter: @solana/web3.js cannot serialize them. Use a legacy or version 0 transaction, or a Wallet Standard / @solana/kit signer.`,
      );
    }
  }
}

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
 * Only legacy and version 0 transactions are supported: web3.js can parse
 * version 1 messages but not serialize them, so a version 1 transaction is
 * rejected with a clear error rather than failing inside the wallet.
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
      assertNoV1Transactions(transactions);

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
        assertNoV1Transactions(transactions);

        // Sign sequentially: wallet adapters expect one signing prompt at a time.
        const signatureDictionaries: Record<Address, SignatureBytes>[] = [];
        for (const transaction of transactions) {
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

            signatureDictionaries.push({ [signerAddress]: sigBytes });
          } catch (error) {
            console.error("Failed to sign transaction:", error);
            throw new Error(
              `Failed to sign transaction: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }
        return signatureDictionaries;
      }
    : undefined;

  return {
    address: signerAddress,
    signAndSendTransactions,
    ...(signTransactions ? { signTransactions } : {}),
  };
}
