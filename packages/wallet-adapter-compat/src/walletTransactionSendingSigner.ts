import type {
  Address,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import {
  address,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
} from "@solana/kit";
import type {
  SendTransactionOptions,
  SupportedTransactionVersions,
  TransactionOrVersionedTransaction,
} from "@solana/wallet-adapter-base";
import type { Connection, TransactionSignature } from "@solana/web3.js";
import {
  PublicKey,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export interface WalletAdapter {
  publicKey: PublicKey | null;
  supportedTransactionVersions?: SupportedTransactionVersions;
  sendTransaction(
    transaction: TransactionOrVersionedTransaction<
      this["supportedTransactionVersions"]
    >,
    connection: Connection,
    options?: SendTransactionOptions,
  ): Promise<TransactionSignature>;
}

/**
 * Creates a TransactionSendingSigner from a Solana wallet adapter.
 * This signer can send transactions using the wallet adapter's capabilities.
 *
 * Note: Wallet adapters don't sign transactions separately - they sign and send in one operation.
 * This implementation uses the sendTransaction method which signs and sends atomically.
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

      // Process each transaction
      for (const transaction of transactions) {
        try {
          console.log("TX", getBase64EncodedWireTransaction(transaction));
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
          // console.log("v1", Buffer.from(vt.serialize()).toString("base64"));
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
