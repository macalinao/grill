import type { Address, Blockhash, Instruction } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { COMPUTE_BUDGET_PROGRAM_ADDRESS } from "@solana-program/compute-budget";
import { address, generateKeyPairSigner } from "@solana/kit";
import { createTransaction } from "./create-transaction.js";

const FEE_PAYER = address("So11111111111111111111111111111111111111112");
const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const BLOCKHASH = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
} as const;

const memoIx = (): Instruction => ({
  data: new Uint8Array([1, 2]),
  programAddress: MEMO_PROGRAM,
});

/**
 * An instruction shaped like one that resolves through a lookup table. The
 * marker is not part of kit's `Instruction`, which is exactly why
 * `createTransaction` sniffs for it structurally.
 */
const lookupTableIx = (): Instruction =>
  ({
    ...memoIx(),
    addressTableLookups: [
      {
        lookupTableAddress: FEE_PAYER,
        readonlyIndexes: [],
        writableIndexes: [0],
      },
    ],
  }) as Instruction;

describe("createTransaction", () => {
  it("sets the fee payer from an address", () => {
    const tx = createTransaction({
      feePayer: FEE_PAYER,
      instructions: [memoIx()],
    });
    expect(tx.feePayer).toEqual({ address: FEE_PAYER });
    expect(tx.instructions).toHaveLength(1);
  });

  it("sets the fee payer from a signer", async () => {
    const signer = await generateKeyPairSigner();
    const tx = createTransaction({
      feePayer: signer,
      instructions: [memoIx()],
    });
    expect(tx.feePayer).toBe(signer);
  });

  it("applies a blockhash lifetime when one is given", () => {
    const tx = createTransaction({
      feePayer: FEE_PAYER,
      instructions: [memoIx()],
      latestBlockhash: BLOCKHASH,
      version: 0,
    });
    expect(tx.lifetimeConstraint).toEqual(BLOCKHASH);
  });

  it("leaves the message without a lifetime when none is given", () => {
    const tx = createTransaction({
      feePayer: FEE_PAYER,
      instructions: [memoIx()],
    });
    expect("lifetimeConstraint" in tx).toBe(false);
  });

  it("honours an explicit version", () => {
    expect(
      createTransaction({
        feePayer: FEE_PAYER,
        instructions: [memoIx()],
        version: 0,
      }).version,
    ).toBe(0);
    expect(
      createTransaction({
        feePayer: FEE_PAYER,
        instructions: [memoIx()],
        version: "legacy",
      }).version,
    ).toBe("legacy");
  });

  it("auto-selects legacy, or 0 for an instruction using a lookup table", () => {
    expect(
      createTransaction({
        feePayer: FEE_PAYER,
        instructions: [memoIx()],
        version: "auto",
      }).version,
    ).toBe("legacy");
    expect(
      createTransaction({
        feePayer: FEE_PAYER,
        instructions: [lookupTableIx()],
        version: "auto",
      }).version,
    ).toBe(0);
    // `auto` is also what an omitted version means.
    expect(
      createTransaction({
        feePayer: FEE_PAYER,
        instructions: [lookupTableIx()],
      }).version,
    ).toBe(0);
  });

  it("prepends the compute budget instructions that were asked for", () => {
    const programs = (instructions: readonly Instruction[]): Address[] =>
      instructions.map((ix) => ix.programAddress);

    expect(
      programs(
        createTransaction({
          computeUnitLimit: 200_000,
          feePayer: FEE_PAYER,
          instructions: [memoIx()],
          version: 0,
        }).instructions,
      ),
    ).toEqual([COMPUTE_BUDGET_PROGRAM_ADDRESS, MEMO_PROGRAM]);

    expect(
      programs(
        createTransaction({
          computeUnitLimit: 1n,
          computeUnitPrice: 2,
          feePayer: FEE_PAYER,
          instructions: [memoIx()],
          version: 0,
        }).instructions,
      ),
    ).toEqual([
      COMPUTE_BUDGET_PROGRAM_ADDRESS,
      COMPUTE_BUDGET_PROGRAM_ADDRESS,
      MEMO_PROGRAM,
    ]);

    expect(
      programs(
        createTransaction({
          feePayer: FEE_PAYER,
          instructions: [memoIx()],
          version: 0,
        }).instructions,
      ),
    ).toEqual([MEMO_PROGRAM]);
  });
});
