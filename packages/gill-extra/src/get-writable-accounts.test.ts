import type { AddressesByLookupTableAddress, Instruction } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  compressTransactionMessageUsingAddressLookupTables,
  createTransactionMessage,
  setTransactionMessageFeePayer,
} from "@solana/kit";
import { getWritableAccounts } from "./get-writable-accounts.js";

const FEE_PAYER = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const PROGRAM = address("11111111111111111111111111111111");
const WRITABLE = address("SysvarC1ock11111111111111111111111111111111");
const READONLY = address("SysvarRent111111111111111111111111111111111");
const WRITABLE_SIGNER = address("SysvarS1otHashes111111111111111111111111111");
const READONLY_SIGNER = address("SysvarS1otHistory11111111111111111111111111");
const LOOKUP_TABLE = address("So11111111111111111111111111111111111111112");

// Deliberately not annotated: `compressTransactionMessageUsingAddressLookupTables`
// needs the concrete version-0 message type to infer against, and widening this
// to `TransactionMessage & TransactionMessageWithFeePayer` loses that.
function makeMessage(instructions: Instruction[]) {
  return appendTransactionMessageInstructions(
    instructions,
    setTransactionMessageFeePayer(
      FEE_PAYER,
      createTransactionMessage({ version: 0 }),
    ),
  );
}

describe("getWritableAccounts", () => {
  it("always includes the fee payer", () => {
    expect(getWritableAccounts(makeMessage([]))).toEqual([FEE_PAYER]);
  });

  it("includes writable accounts and excludes readonly ones", () => {
    const message = makeMessage([
      {
        programAddress: PROGRAM,
        accounts: [
          { address: WRITABLE, role: AccountRole.WRITABLE },
          { address: READONLY, role: AccountRole.READONLY },
        ],
      },
    ]);

    expect(getWritableAccounts(message)).toEqual([FEE_PAYER, WRITABLE]);
  });

  it("distinguishes writable signers from readonly signers", () => {
    const message = makeMessage([
      {
        programAddress: PROGRAM,
        accounts: [
          { address: WRITABLE_SIGNER, role: AccountRole.WRITABLE_SIGNER },
          { address: READONLY_SIGNER, role: AccountRole.READONLY_SIGNER },
        ],
      },
    ]);

    expect(getWritableAccounts(message)).toEqual([FEE_PAYER, WRITABLE_SIGNER]);
  });

  it("deduplicates accounts written by more than one instruction", () => {
    const message = makeMessage([
      {
        programAddress: PROGRAM,
        accounts: [
          { address: WRITABLE, role: AccountRole.WRITABLE },
          { address: FEE_PAYER, role: AccountRole.WRITABLE_SIGNER },
        ],
      },
      {
        programAddress: PROGRAM,
        accounts: [{ address: WRITABLE, role: AccountRole.WRITABLE }],
      },
    ]);

    expect(getWritableAccounts(message)).toEqual([FEE_PAYER, WRITABLE]);
  });

  it("tolerates instructions with no accounts", () => {
    const message = makeMessage([
      { programAddress: PROGRAM },
      {
        programAddress: PROGRAM,
        accounts: [{ address: WRITABLE, role: AccountRole.WRITABLE }],
      },
    ]);

    expect(getWritableAccounts(message)).toEqual([FEE_PAYER, WRITABLE]);
  });

  it("sees through address lookup table compression", () => {
    const message = makeMessage([
      {
        programAddress: PROGRAM,
        accounts: [
          { address: WRITABLE, role: AccountRole.WRITABLE },
          { address: READONLY, role: AccountRole.READONLY },
          { address: WRITABLE_SIGNER, role: AccountRole.WRITABLE_SIGNER },
        ],
      },
    ]);

    const lookupTables: AddressesByLookupTableAddress = {
      [LOOKUP_TABLE]: [WRITABLE, READONLY, WRITABLE_SIGNER],
    };
    const compressed = compressTransactionMessageUsingAddressLookupTables(
      message,
      lookupTables,
    );

    // Compression really did move the non-signer accounts into the table --
    // otherwise this would prove nothing.
    const [instruction] = compressed.instructions;
    expect(instruction?.accounts?.[0]).toHaveProperty(
      "lookupTableAddress",
      LOOKUP_TABLE,
    );

    expect(getWritableAccounts(compressed)).toEqual(
      getWritableAccounts(message),
    );
    expect(getWritableAccounts(compressed)).toEqual([
      FEE_PAYER,
      WRITABLE,
      WRITABLE_SIGNER,
    ]);
  });
});
