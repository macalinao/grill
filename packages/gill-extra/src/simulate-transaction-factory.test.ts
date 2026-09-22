import type { Blockhash, Rpc, SimulateTransactionApi } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { createTransaction } from "./create-transaction.js";
import { simulateTransactionFactory } from "./simulate-transaction-factory.js";

const FEE_PAYER = address("So11111111111111111111111111111111111111112");
const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const message = () =>
  createTransaction({
    feePayer: FEE_PAYER,
    instructions: [{ data: new Uint8Array([1]), programAddress: MEMO_PROGRAM }],
    latestBlockhash: {
      blockhash: "11111111111111111111111111111111" as Blockhash,
      lastValidBlockHeight: 100n,
    },
    version: 0,
  });

/** An rpc stub that records the arguments `simulateTransaction` was called with. */
const recordingRpc = (): {
  calls: unknown[][];
  rpc: Rpc<SimulateTransactionApi>;
} => {
  const calls: unknown[][] = [];
  const rpc = {
    simulateTransaction: (...args: unknown[]) => {
      calls.push(args);
      return { send: () => Promise.resolve({ value: { err: null } }) };
    },
  } as unknown as Rpc<SimulateTransactionApi>;
  return { calls, rpc };
};

describe("simulateTransactionFactory", () => {
  it("simulates without signature verification, replacing the blockhash", async () => {
    const { calls, rpc } = recordingRpc();
    await simulateTransactionFactory({ rpc })(message());

    expect(calls).toHaveLength(1);
    expect(calls[0]?.[1]).toEqual({
      encoding: "base64",
      replaceRecentBlockhash: true,
      sigVerify: false,
    });
    expect(typeof calls[0]?.[0]).toBe("string");
  });

  it("lets a caller override the defaults, but never the encoding or sigVerify", async () => {
    const { calls, rpc } = recordingRpc();
    await simulateTransactionFactory({ rpc })(message(), {
      commitment: "processed",
      replaceRecentBlockhash: false,
    });

    expect(calls[0]?.[1]).toEqual({
      commitment: "processed",
      encoding: "base64",
      replaceRecentBlockhash: false,
      sigVerify: false,
    });
  });
});
