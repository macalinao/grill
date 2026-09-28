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
