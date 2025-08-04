import type { Address, TransactionSigner } from "@solana/kit";
import { address } from "@solana/kit";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

export interface WalletTransactionSignerConfig {
  wallet: WalletAdapter;
  publicKey: Address;
}

export class WalletTransactionSigner implements TransactionSigner {
  readonly address: Address;
  private wallet: WalletAdapter;

  constructor(config: WalletTransactionSignerConfig) {
    this.address = config.publicKey;
    this.wallet = config.wallet;
  }

  async signTransactionMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.wallet.signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }

    // The wallet adapter expects a versioned transaction
    // We need to convert the message bytes to a transaction format the wallet can sign
    // This is handled by the wallet adapter's signTransaction method
    const signedTx = await this.wallet.signTransaction({
      message,
      signatures: [],
    } as any);

    // Extract the signature for this signer
    const signatureIndex = signedTx.message.staticAccountKeys.findIndex(
      (key: any) => key.toBase58() === this.address,
    );

    if (signatureIndex === -1) {
      throw new Error("Could not find signature for wallet public key");
    }

    return signedTx.signatures[signatureIndex];
  }
}

export function createWalletTransactionSigner(
  wallet: WalletAdapter,
): TransactionSigner | null {
  if (!wallet.publicKey) {
    return null;
  }

  return new WalletTransactionSigner({
    wallet,
    publicKey: address(wallet.publicKey.toBase58()),
  });
}