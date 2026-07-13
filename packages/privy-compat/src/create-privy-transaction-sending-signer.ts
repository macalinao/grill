import type {
  Address,
  SignatureBytes,
  Transaction,
  TransactionSendingSigner,
  TransactionSendingSignerConfig,
} from "@solana/kit";
import type {
  PrivySignAndSendTransactionFn,
  PrivySignAndSendTransactionOptions,
  PrivySolanaChain,
  PrivySolanaWallet,
} from "./types.js";
import { address, getTransactionEncoder } from "@solana/kit";

/** Length in bytes of an ed25519 transaction signature. */
const SIGNATURE_LENGTH = 64;

export interface CreatePrivyTransactionSendingSignerParams<
  TWallet extends PrivySolanaWallet = PrivySolanaWallet,
> {
  /**
   * The connected Privy Solana wallet, e.g. an element of the `wallets` array
   * returned by Privy's `useWallets` hook.
   */
  wallet: TWallet;
  /**
   * Privy's `signAndSendTransaction`, from its `useSignAndSendTransaction` hook.
   */
  signAndSendTransaction: PrivySignAndSendTransactionFn<TWallet>;
  /**
   * The cluster transactions are sent to.
   *
   * @defaultValue "solana:mainnet"
   */
  chain?: PrivySolanaChain;
  /**
   * Options forwarded to Privy on every transaction, e.g. `skipPreflight` or
   * `sponsor`.
   */
  options?: PrivySignAndSendTransactionOptions;
}

/**
 * Creates a Kit {@link TransactionSendingSigner} backed by a Privy Solana wallet.
 *
 * Privy signs and submits in a single operation, which is exactly the contract
 * of a `TransactionSendingSigner`: each transaction is serialized to its wire
 * format, handed to Privy, and the resulting signature is returned.
 *
 * Transactions are processed sequentially so that signatures come back in the
 * same order they were passed in, and so that an aborted signal stops the
 * remaining transactions from being sent.
 *
 * @param params - The wallet, Privy's send function, and per-transaction options.
 * @returns A signer that can be passed to grill's `WalletProvider`.
 * @throws Error if the wallet address is not a valid Solana address.
 *
 * @example
 * ```ts
 * const signer = createPrivyTransactionSendingSigner({
 *   wallet: wallets[0],
 *   signAndSendTransaction,
 *   chain: "solana:mainnet",
 * });
 * ```
 */
export function createPrivyTransactionSendingSigner<
  TWallet extends PrivySolanaWallet,
>({
  wallet,
  signAndSendTransaction,
  chain = "solana:mainnet",
  options,
}: CreatePrivyTransactionSendingSignerParams<TWallet>): TransactionSendingSigner<Address> {
  const signerAddress = address(wallet.address);
  const transactionEncoder = getTransactionEncoder();

  return {
    address: signerAddress,
    signAndSendTransactions: async (
      transactions: readonly Transaction[],
      config?: TransactionSendingSignerConfig,
    ): Promise<readonly SignatureBytes[]> => {
      const signatures: SignatureBytes[] = [];

      for (const transaction of transactions) {
        config?.abortSignal?.throwIfAborted();

        const { signature } = await signAndSendTransaction({
          transaction: Uint8Array.from(transactionEncoder.encode(transaction)),
          wallet,
          chain,
          ...(options ? { options } : {}),
        });

        if (signature.length !== SIGNATURE_LENGTH) {
          throw new Error(
            `Privy returned a ${signature.length.toString()}-byte signature; expected ${SIGNATURE_LENGTH.toString()} bytes.`,
          );
        }

        signatures.push(signature as SignatureBytes);
      }

      return signatures;
    },
  };
}
