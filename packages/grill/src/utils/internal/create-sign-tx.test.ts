import type { Address, Blockhash, Instruction } from "@solana/kit";
import type { SolanaClient } from "gill";
import type { GrillSigner } from "../../contexts/wallet-context.js";
import type { TransactionStatusEvent } from "../../types.js";
import { beforeAll, describe, expect, it } from "bun:test";
import { address, generateKeyPairSigner, getBase58Encoder } from "@solana/kit";
import { createSignTX } from "./create-sign-tx.js";

const BLOCKHASH = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 100n,
};

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

/**
 * A no-op instruction so the transaction message compiles. `data` carries the
 * signer's address bytes so the message is non-trivial.
 */
function makeIx(signerAddress: Address): Instruction {
  return {
    programAddress: MEMO_PROGRAM,
    accounts: [],
    data: getBase58Encoder().encode(signerAddress),
  };
}

/** Builds a fake RPC whose getLatestBlockhash records how often it is called. */
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

describe("createSignTX", () => {
  let signer: GrillSigner;

  beforeAll(async () => {
    // A realistic composite signer: a real keypair (partial signer) plus a stub
    // sending capability, matching the wallet-adapter-compat composite signer.
    const kp = await generateKeyPairSigner();
    signer = {
      address: kp.address,
      signTransactions: kp.signTransactions.bind(kp),
      signAndSendTransactions: () => Promise.resolve([]),
    };
  });

  it("returns a signed transaction without broadcasting it", async () => {
    const { rpc } = makeRpc();
    const events: TransactionStatusEvent[] = [];
    const signTX = createSignTX({
      signer,
      rpc,
      onTransactionStatusEvent: (e) => {
        events.push(e);
      },
    });

    const signed = await signTX("Test sign", [makeIx(signer.address)], {
      skipPreflight: true,
    });

    // The fee payer signature is present.
    const sig = signed.signatures[signer.address];
    expect(sig).toBeTruthy();
    expect((sig as Uint8Array).length).toBe(64);
    expect(signed.messageBytes.length).toBeGreaterThan(0);

    // Emits the sign lifecycle, and never a send/confirm event.
    const types = events.map((e) => e.type);
    expect(types).toContain("signed");
    expect(types).not.toContain("waiting-for-confirmation");
    expect(types).not.toContain("confirmed");
  });

  it("uses an injected blockhash without hitting the RPC", async () => {
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const signTX = createSignTX({
      signer,
      rpc,
      onTransactionStatusEvent: () => {},
    });

    await signTX("Injected", [makeIx(signer.address)], {
      skipPreflight: true,
      latestBlockhash: BLOCKHASH,
    });

    expect(getLatestBlockhashCalls()).toBe(0);
  });

  it("fetches the blockhash when not injected", async () => {
    const { rpc, getLatestBlockhashCalls } = makeRpc();
    const signTX = createSignTX({
      signer,
      rpc,
      onTransactionStatusEvent: () => {},
    });

    await signTX("Fetched", [makeIx(signer.address)], { skipPreflight: true });

    expect(getLatestBlockhashCalls()).toBe(1);
  });

  it("throws when no wallet is connected", async () => {
    const { rpc } = makeRpc();
    const events: TransactionStatusEvent[] = [];
    const signTX = createSignTX({
      signer: null,
      rpc,
      onTransactionStatusEvent: (e) => {
        events.push(e);
      },
    });

    let caught: unknown;
    try {
      await signTX("No wallet", [makeIx(signer.address)], {
        skipPreflight: true,
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain("Wallet not connected");
    expect(events.map((e) => e.type)).toContain("error-wallet-not-connected");
  });

  it("throws when the signer cannot sign without sending", async () => {
    const { rpc } = makeRpc();
    const events: TransactionStatusEvent[] = [];
    // A sending-only signer: no signTransactions method.
    const sendingOnly: GrillSigner = {
      address: signer.address,
      signAndSendTransactions: () => Promise.resolve([]),
    };
    const signTX = createSignTX({
      signer: sendingOnly,
      rpc,
      onTransactionStatusEvent: (e) => {
        events.push(e);
      },
    });

    let caught: unknown;
    try {
      await signTX("Unsupported", [makeIx(signer.address)], {
        skipPreflight: true,
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain("does not support signing");
    expect(events.map((e) => e.type)).toContain(
      "error-transaction-sign-failed",
    );
  });
});
