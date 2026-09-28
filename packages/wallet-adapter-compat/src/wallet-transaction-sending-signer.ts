import type {
  Address,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import type {
  SendTransactionOptions,
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

/** Versioned messages start with `0x80 | version`. */
const VERSION_PREFIX_MASK = 0x7f;

/**
 * Returns the transaction version encoded in the first byte of a compiled
 * message: `"legacy"` when the high bit is clear, otherwise the version
 * number.
 */
const getMessageVersion = (
  messageBytes: ArrayLike<number>,
): "legacy" | number => {
  const prefix = messageBytes[0] ?? 0;
  return (prefix & 0x80) === 0 ? "legacy" : prefix & VERSION_PREFIX_MASK;
};

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
}

/**
 * Creates a TransactionSendingSigner from a Solana wallet adapter.
 * This signer can send transactions using the wallet adapter's capabilities.
 *
 * Note: Wallet adapters don't sign transactions separately - they sign and send in one operation.
 * This implementation uses the sendTransaction method which signs and sends atomically.
 *
 * Only legacy and version 0 transactions are supported. Wallet adapters take
 * `@solana/web3.js` transactions, and web3.js can parse version 1 messages but
 * not serialize them, so a version 1 transaction is rejected with a clear error
 * rather than failing inside the wallet.
 *
 * @param wallet - The wallet adapter instance
 * @param connection - The Solana connection
 * @returns TransactionSendingSigner - A signer that can send transactions
 */
export function createWalletTransactionSendingSigner(
  walletAdapter: WalletAdapter,
  connection: Connection,
): TransactionSendingSigner<Address> | null {
  if (!walletAdapter.publicKey) {
    return null;
  }

  const signerAddress = address(walletAdapter.publicKey.toBase58());

  // Create the TransactionSendingSigner
  const signer: TransactionSendingSigner<Address> = {
    address: signerAddress,
    signAndSendTransactions: async (transactions) => {
      if (!walletAdapter.publicKey) {
        throw new Error("Wallet is not connected");
      }

      const signatures: SignatureBytes[] = [];

      for (const transaction of transactions) {
        const version = getMessageVersion(transaction.messageBytes);
        if (version !== "legacy" && version !== 0) {
          throw new Error(
            `Version ${String(version)} transactions cannot be sent through a wallet adapter: @solana/web3.js cannot serialize them. Use a legacy or version 0 transaction, or a Wallet Standard / @solana/kit signer.`,
          );
        }
      }

      // Process each transaction
      for (const transaction of transactions) {
        try {
          const msg = VersionedMessage.deserialize(
            Uint8Array.from(transaction.messageBytes),
          );
          const vt = new VersionedTransaction(msg);
          for (const [publicKey, signature] of Object.entries(
            transaction.signatures,
          )) {
            if (signature) {
              vt.addSignature(new PublicKey(publicKey), signature);
            }
          }
          const sig = await walletAdapter.sendTransaction(vt, connection);
          const sigBytes = getBase58Encoder().encode(sig) as SignatureBytes;

          // also send here
          // vt.addSignature(new PublicKey(signerAddress), sigBytes);
          // await connection.sendRawTransaction(vt.serialize());

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
    },
  };

  return signer;
}
