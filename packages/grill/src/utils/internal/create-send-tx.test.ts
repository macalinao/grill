import type {
  Address,
  Blockhash,
  BlockhashLifetimeConstraint,
  Instruction,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import { beforeAll, describe, expect, it, mock } from "bun:test";
import * as gillExtra from "@macalinao/gill-extra";
import { address, generateKeyPairSigner, getBase58Encoder } from "@solana/kit";

const BLOCKHASH: BlockhashLifetimeConstraint = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const INJECTED: BlockhashLifetimeConstraint = {
  blockhash: "So11111111111111111111111111111111111111112" as Blockhash,
  lastValidBlockHeight: 200n,
};

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

// A fixed 64-byte signature returned by the sending signer.
const SIG_BYTES = new Uint8Array(64).fill(7) as SignatureBytes;

/**
 * Captures the `lastValidBlockHeight` handed to `pollConfirmTransaction` so we
 * can assert which blockhash was baked into the transaction. The rest of the
 * gill-extra exports used by create-send-tx are preserved. A holder object is
 * used so control-flow narrowing does not collapse the value to `undefined`
 * across the awaited `sendTX` call.
 */
const polled: { lastValidBlockHeight?: bigint } = {};

await mock.module("@macalinao/gill-extra", () => ({
  ...gillExtra,
  pollConfirmTransaction: ({
    lastValidBlockHeight,
  }: {
    lastValidBlockHeight: bigint;
  }) => {
    polled.lastValidBlockHeight = lastValidBlockHeight;
    return Promise.resolve({
      transaction: { message: { accountKeys: [] } },
      meta: { logMessages: [] },
    });
  },
}));

// Imported after the module mock is installed so the mocked binding is used.
const { createSendTX } = await import("./create-send-tx.js");

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

function makeSendingSigner(addr: Address): TransactionSendingSigner {
  return {
    address: addr,
    signAndSendTransactions: () => Promise.resolve([SIG_BYTES]),
  };
}

describe("createSendTX blockhash injection", () => {
  let signer: TransactionSendingSigner;

  beforeAll(async () => {
    const kp = await generateKeyPairSigner();
    signer = makeSendingSigner(kp.address);
  });

  const params = (rpc: SolanaClient["rpc"]) => ({
    signer,
    rpc,
    refetchAccounts: () => Promise.resolve(),
    onTransactionStatusEvent: () => {},
    getExplorerLink: () => "https://example.com",
  });

  it("uses an injected blockhash without hitting the RPC", async () => {
    polled.lastValidBlockHeight = undefined;
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const sendTX = createSendTX(params(rpc));

    await sendTX("Test", [makeIx(signer.address)], {
      skipPreflight: true,
      latestBlockhash: INJECTED,
    });

    expect(getLatestBlockhashCalls()).toBe(0);
    expect<bigint | undefined>(polled.lastValidBlockHeight).toBe(
      INJECTED.lastValidBlockHeight,
    );
  });

  it("fetches the blockhash when not injected", async () => {
    polled.lastValidBlockHeight = undefined;
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const sendTX = createSendTX(params(rpc));

    await sendTX("Test", [makeIx(signer.address)], {
      skipPreflight: true,
    });

    expect(getLatestBlockhashCalls()).toBe(1);
    expect<bigint | undefined>(polled.lastValidBlockHeight).toBe(
      BLOCKHASH.lastValidBlockHeight,
    );
  });
});
