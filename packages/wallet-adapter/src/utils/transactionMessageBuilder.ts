import type {
  Address,
  AddressesByLookupTableAddress,
  Blockhash,
  ITransactionMessageWithBlockhashLifetime,
  Instruction,
  TransactionSigner,
} from "@solana/kit";
import {
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  transactionMessage,
} from "@solana/kit";

export interface BuildTransactionMessageOptions {
  feePayer: Address;
  blockhash: Blockhash;
  lastValidBlockHeight: bigint;
  instructions: readonly Instruction[];
  addressLookupTables?: AddressesByLookupTableAddress;
  additionalSigners?: TransactionSigner[];
}

export async function buildTransactionMessage({
  feePayer,
  blockhash,
  lastValidBlockHeight,
  instructions,
  addressLookupTables,
  additionalSigners,
}: BuildTransactionMessageOptions): Promise<ITransactionMessageWithBlockhashLifetime> {
  let message = pipe(
    transactionMessage({ version: 0 }),
    (msg) => {
      // Add instructions
      instructions.forEach((ix) => {
        msg.instructions.push(ix);
      });
      return msg;
    },
    (msg) => setTransactionMessageFeePayer(feePayer, msg),
    (msg) =>
      setTransactionMessageLifetimeUsingBlockhash(
        { blockhash, lastValidBlockHeight },
        msg,
      ),
  );

  // Add address lookup tables if provided
  if (addressLookupTables) {
    Object.entries(addressLookupTables).forEach(([tableAddress, addresses]) => {
      message.addressTableLookups.push({
        lookupTableAddress: tableAddress as Address,
        readableIndices: [],
        writableIndices: addresses.map((_, i) => i),
      });
    });
  }

  // Sign with additional signers if provided
  if (additionalSigners && additionalSigners.length > 0) {
    message = await signTransactionMessageWithSigners(
      additionalSigners,
      message,
    );
  }

  return message;
}