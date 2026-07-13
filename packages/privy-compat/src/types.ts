/**
 * CAIP-2 chain identifiers for the Solana clusters that Privy supports.
 */
export type PrivySolanaChain =
  | "solana:devnet"
  | "solana:mainnet"
  | "solana:testnet";

/**
 * Commitment levels accepted by Privy when signing and sending transactions.
 */
export type PrivyTransactionCommitment =
  | "confirmed"
  | "finalized"
  | "processed";

/**
 * Options forwarded to Privy's `signAndSendTransaction`.
 *
 * These mirror the options accepted by `@privy-io/react-auth/solana`, narrowed
 * to the fields that are meaningful when Privy submits the transaction on the
 * app's behalf.
 */
export interface PrivySignAndSendTransactionOptions {
  /** Commitment level to wait for after the transaction is submitted. */
  commitment?: PrivyTransactionCommitment;
  /** Commitment level used for the RPC's preflight simulation. */
  preflightCommitment?: PrivyTransactionCommitment;
  /** Minimum slot at which the RPC may evaluate the request. */
  minContextSlot?: number;
  /** Skip the RPC's preflight simulation. */
  skipPreflight?: boolean;
  /** Maximum number of times the RPC node retries sending to the leader. */
  maxRetries?: number;
  /** Have Privy sponsor the transaction fees, if gas sponsorship is enabled. */
  sponsor?: boolean;
}

/**
 * The minimal shape of a connected Privy Solana wallet that this package needs.
 *
 * `ConnectedStandardSolanaWallet` from `@privy-io/react-auth/solana` satisfies
 * this interface.
 */
export interface PrivySolanaWallet {
  /** Base58-encoded address of the wallet. */
  readonly address: string;
}

/**
 * Input to Privy's `signAndSendTransaction`.
 */
export interface PrivySignAndSendTransactionInput<
  TWallet extends PrivySolanaWallet = PrivySolanaWallet,
> {
  /** The serialized wire transaction to sign and send. */
  transaction: Uint8Array;
  /** The wallet that signs and sends the transaction. */
  wallet: TWallet;
  /** The cluster the transaction is sent to. */
  chain?: PrivySolanaChain;
  /** Options forwarded to Privy. */
  options?: PrivySignAndSendTransactionOptions;
}

/**
 * Output of Privy's `signAndSendTransaction`.
 */
export interface PrivySignAndSendTransactionOutput {
  /** The 64-byte transaction signature. */
  signature: Uint8Array;
}

/**
 * The `signAndSendTransaction` function returned by Privy's
 * `useSignAndSendTransaction` hook.
 */
export type PrivySignAndSendTransactionFn<
  TWallet extends PrivySolanaWallet = PrivySolanaWallet,
> = (
  input: PrivySignAndSendTransactionInput<TWallet>,
) => Promise<PrivySignAndSendTransactionOutput>;
