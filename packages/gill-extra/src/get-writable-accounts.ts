import type {
  Address,
  TransactionMessage,
  TransactionMessageWithFeePayer,
} from "@solana/kit";
import { isWritableRole } from "@solana/kit";

/**
 * The addresses a transaction message may write to: its fee payer, whose
 * lamport balance always changes, plus every instruction account marked
 * writable.
 *
 * This is the same set the cluster reports as writable in a confirmed
 * transaction, derived locally so that reloading the accounts a transaction
 * touched does not need a `getTransaction` round trip.
 *
 * Safe to call before or after
 * `compressTransactionMessageUsingAddressLookupTables`: compression only
 * rewrites an account's `AccountMeta` into an `AccountLookupMeta`, carrying the
 * address and role across untouched.
 *
 * @param transactionMessage - The transaction message to inspect.
 * @returns The writable addresses, deduplicated, fee payer first.
 */
export function getWritableAccounts(
  transactionMessage: TransactionMessage & TransactionMessageWithFeePayer,
): Address[] {
  const writable = new Set<Address>([transactionMessage.feePayer.address]);

  for (const instruction of transactionMessage.instructions) {
    for (const account of instruction.accounts ?? []) {
      if (isWritableRole(account.role)) {
        writable.add(account.address);
      }
    }
  }

  return [...writable];
}
