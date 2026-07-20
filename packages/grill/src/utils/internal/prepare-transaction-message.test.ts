import type {
  Address,
  Blockhash,
  Instruction,
  TransactionSigner,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import type { simulateTransactionFactory } from "gill";
import { beforeAll, describe, expect, it } from "bun:test";
import { address, generateKeyPairSigner, getBase58Encoder } from "@solana/kit";
import { prepareTransactionMessage } from "./prepare-transaction-message.js";

const BLOCKHASH = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

function makeIx(signerAddress: Address): Instruction {
  return {
    programAddress: MEMO_PROGRAM,
    accounts: [],
    data: getBase58Encoder().encode(signerAddress),
  };
}

function makeRpc(): {
  rpc: SolanaClient["rpc"];
  getLatestBlockhashCalls: () => number;
} {
  let calls = 0;
  const rpc = {
    getLatestBlockhash: () => ({
      send: () => {
        calls += 1;
        return Promise.resolve({ value: BLOCKHASH });
      },
    }),
  } as unknown as SolanaClient["rpc"];
  return { rpc, getLatestBlockhashCalls: () => calls };
}

/** A simulate fn that returns a fixed err value, spying on invocation. */
function makeSimulate(err: unknown): {
  simulate: ReturnType<typeof simulateTransactionFactory>;
  calls: () => number;
} {
  let calls = 0;
  const simulate = (() => {
    calls += 1;
    return Promise.resolve({ value: { err, logs: [] } });
  }) as unknown as ReturnType<typeof simulateTransactionFactory>;
  return { simulate, calls: () => calls };
}

describe("prepareTransactionMessage", () => {
  let signer: TransactionSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  const base = (rpc: SolanaClient["rpc"]) => ({
    signer,
    rpc,
    name: "Test",
    ixs: [makeIx(signer.address)],
    cluster: "mainnet-beta" as const,
    onSimulationError: () => {},
  });

  it("fetches the blockhash when not injected", async () => {
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const { simulate } = makeSimulate(null);

    const { latestBlockhash } = await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { skipPreflight: true },
    });

    expect(getLatestBlockhashCalls()).toBe(1);
    expect(latestBlockhash).toBe(BLOCKHASH);
  });

  it("skips simulation when skipPreflight is true", async () => {
    const { rpc } = makeRpc();
    const { simulate, calls } = makeSimulate(null);

    await prepareTransactionMessage({
      ...base(rpc),
      simulateTransaction: simulate,
      options: { skipPreflight: true },
    });

    expect(calls()).toBe(0);
  });

  it("runs simulation and throws + reports on simulation error", async () => {
    const { rpc } = makeRpc();
    const { simulate, calls } = makeSimulate({
      InstructionError: [0, "Custom"],
    });
    let reported: string | undefined;

    let caught: unknown;
    try {
      await prepareTransactionMessage({
        ...base(rpc),
        simulateTransaction: simulate,
        options: {},
        onSimulationError: (msg) => {
          reported = msg;
        },
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeDefined();
    expect(calls()).toBe(1);
    expect(reported).toBeDefined();
  });
});
