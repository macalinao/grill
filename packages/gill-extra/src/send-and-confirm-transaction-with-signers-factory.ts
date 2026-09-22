import type {
  FullySignedTransaction,
  GetEpochInfoApi,
  GetLatestBlockhashApi,
  GetSignatureStatusesApi,
  Rpc,
  RpcSubscriptions,
  SendTransactionApi,
  Signature,
  SignatureNotificationsApi,
  SlotNotificationsApi,
  Transaction,
  TransactionMessage,
  TransactionMessageWithFeePayer,
  TransactionWithLifetime,
} from "@solana/kit";
import {
  assertIsFullySignedTransaction,
  assertIsSendableTransaction,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  assertIsTransactionWithinSizeLimit,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";

/**
 * A transaction, or a transaction message that still needs signing, that can
 * be handed to a {@link SendAndConfirmTransactionWithSignersFunction}.
 */
export type SendableTransactionOrMessage =
  | (Transaction & FullySignedTransaction & TransactionWithLifetime)
  | (TransactionMessage & TransactionMessageWithFeePayer);

/**
 * Configuration accepted when sending and confirming a transaction, minus the
 * pieces the function supplies itself.
 */
export type SendAndConfirmTransactionConfig = Parameters<
  ReturnType<typeof sendAndConfirmTransactionFactory>
>[1];

/**
 * Sends a transaction to the network and waits until it is confirmed, signing
 * it with its attached signers and applying a fresh blockhash first when it
 * does not already have them.
 */
export type SendAndConfirmTransactionWithSignersFunction = (
  transaction: SendableTransactionOrMessage,
  config?: SendAndConfirmTransactionConfig,
) => Promise<Signature>;

export interface SendAndConfirmTransactionWithSignersFactoryConfig {
  /**
   * An RPC client supporting the epoch, signature status, send transaction and
   * latest blockhash methods.
   */
  rpc: Rpc<
    GetEpochInfoApi &
      GetLatestBlockhashApi &
      GetSignatureStatusesApi &
      SendTransactionApi
  >;
  /** An RPC subscriptions client supporting signature and slot notifications. */
  rpcSubscriptions: RpcSubscriptions<
    SignatureNotificationsApi & SlotNotificationsApi
  >;
}

/**
 * Builds a function that sends and confirms transactions, taking care of
 * signing with the signers attached to a transaction message.
 *
 * A transaction message without a lifetime gets the latest blockhash applied
 * before it is signed. Default commitment level: `confirmed`.
 *
 * @param config - The RPC and RPC subscriptions clients to send through
 * @returns A function that sends and confirms a transaction
 */
export function sendAndConfirmTransactionWithSignersFactory({
  rpc,
  rpcSubscriptions,
}: SendAndConfirmTransactionWithSignersFactoryConfig): SendAndConfirmTransactionWithSignersFunction {
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  return async function sendAndConfirmTransactionWithSigners(
    transaction,
    config = { commitment: "confirmed" },
  ) {
    let signedTransaction: Transaction;

    if ("messageBytes" in transaction) {
      signedTransaction = transaction;
    } else {
      let message = transaction;
      if (!("lifetimeConstraint" in message)) {
        const { abortSignal } = config;
        const { value: latestBlockhash } = await rpc
          .getLatestBlockhash()
          .send(abortSignal === undefined ? undefined : { abortSignal });
        message = setTransactionMessageLifetimeUsingBlockhash(
          latestBlockhash,
          message,
        );
        assertIsTransactionMessageWithBlockhashLifetime(message);
      }

      if (!("feePayer" in message)) {
        throw new Error("Transaction must have a fee payer");
      }

      signedTransaction = await signTransactionMessageWithSigners(message);
    }

    assertIsTransactionWithBlockhashLifetime(signedTransaction);
    assertIsTransactionWithinSizeLimit(signedTransaction);
    assertIsFullySignedTransaction(signedTransaction);
    assertIsSendableTransaction(signedTransaction);

    await sendAndConfirmTransaction(signedTransaction, config);

    return getSignatureFromTransaction(signedTransaction);
  };
}
