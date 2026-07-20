import type {
  Address,
  Blockhash,
  BlockhashLifetimeConstraint,
  Instruction,
  SignatureBytes,
  TransactionSendingSigner,
} from "@solana/kit";
import type { SolanaClient } from "gill";
import type { TransactionStatusEvent } from "../../types.js";
import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
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

const WRITABLE_ACCOUNT = address("SysvarC1ock11111111111111111111111111111111");
const READONLY_ACCOUNT = address("SysvarRent111111111111111111111111111111111");

// A fixed 64-byte signature returned by the sending signer.
const SIG_BYTES = new Uint8Array(64).fill(7) as SignatureBytes;

interface PollResult {
  transaction: {
    message: {
      accountKeys: { writable: boolean; pubkey: Address }[];
    };
  };
  meta?: { logMessages?: string[] };
}

/**
 * Drives the mocked `pollConfirmTransaction`. `polled` captures the
 * `lastValidBlockHeight` baked into the transaction; `result`/`error` let each
 * test choose whether confirmation resolves (and with which writable accounts)
 * or rejects. Holder objects are used so control-flow narrowing does not
 * collapse the values across the awaited `sendTX` call.
 */
const polled: { lastValidBlockHeight?: bigint } = {};
const pollControl: { result?: PollResult; error?: Error } = {};

const EMPTY_RESULT: PollResult = {
  transaction: { message: { accountKeys: [] } },
  meta: { logMessages: [] },
};

await mock.module("@macalinao/gill-extra", () => ({
  ...gillExtra,
  pollConfirmTransaction: ({
    lastValidBlockHeight,
  }: {
    lastValidBlockHeight: bigint;
  }): Promise<PollResult> => {
    polled.lastValidBlockHeight = lastValidBlockHeight;
    if (pollControl.error !== undefined) {
      throw pollControl.error;
    }
    return Promise.resolve(pollControl.result ?? EMPTY_RESULT);
  },
}));

/** Finds an emitted event and narrows it to its discriminated variant. */
function findEvent<T extends TransactionStatusEvent["type"]>(
  events: TransactionStatusEvent[],
  type: T,
): Extract<TransactionStatusEvent, { type: T }> | undefined {
  return events.find(
    (e): e is Extract<TransactionStatusEvent, { type: T }> => e.type === type,
  );
}

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

/** A sending signer whose broadcast always rejects. */
function makeFailingSigner(
  addr: Address,
  error: Error,
): TransactionSendingSigner {
  return {
    address: addr,
    signAndSendTransactions: () => Promise.reject(error),
  };
}

/** Records the addresses handed to refetchAccounts and lets a test block it. */
function makeRefetch(neverResolves = false): {
  refetchAccounts: (addresses: Address[]) => Promise<void>;
  calls: () => Address[][];
} {
  const calls: Address[][] = [];
  const refetchAccounts = (addresses: Address[]): Promise<void> => {
    calls.push(addresses);
    return neverResolves ? new Promise<void>(() => {}) : Promise.resolve();
  };
  return { refetchAccounts, calls: () => calls };
}

describe("createSendTX", () => {
  let signer: TransactionSendingSigner;

  beforeAll(async () => {
    const kp = await generateKeyPairSigner();
    signer = makeSendingSigner(kp.address);
  });

  beforeEach(() => {
    polled.lastValidBlockHeight = undefined;
    pollControl.result = undefined;
    pollControl.error = undefined;
  });

  const params = (
    rpc: SolanaClient["rpc"],
    overrides: Partial<Parameters<typeof createSendTX>[0]> = {},
  ) => ({
    signer,
    rpc,
    refetchAccounts: () => Promise.resolve(),
    onTransactionStatusEvent: () => {},
    getExplorerLink: () => "https://example.com",
    ...overrides,
  });

  describe("blockhash injection", () => {
    it("uses an injected blockhash without hitting the RPC", async () => {
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

  describe("happy path", () => {
    it("returns the signature and emits the full lifecycle", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      const explorerLinks: string[] = [];
      const sendTX = createSendTX(
        params(rpc, {
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
          getExplorerLink: () => {
            const link = "https://explorer.example/tx";
            explorerLinks.push(link);
            return link;
          },
        }),
      );

      const sig = await sendTX("Send", [makeIx(signer.address)], {
        skipPreflight: true,
      });

      // A base58 signature string is returned.
      expect(typeof sig).toBe("string");
      expect(sig.length).toBeGreaterThan(0);

      // Lifecycle events fire in order, ending in confirmation.
      expect(events.map((e) => e.type)).toEqual([
        "preparing",
        "awaiting-wallet-signature",
        "waiting-for-confirmation",
        "confirmed",
      ]);

      // The explorer link is attached to the post-send events.
      const confirmed = findEvent(events, "confirmed");
      expect(confirmed).toBeDefined();
      expect(confirmed?.sig).toBe(sig);
      expect(confirmed?.explorerLink).toBe("https://explorer.example/tx");
      expect(explorerLinks.length).toBeGreaterThan(0);
    });
  });

  describe("wallet not connected", () => {
    it("emits an error event and throws when there is no signer", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      const sendTX = createSendTX(
        params(rpc, {
          signer: null,
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
        }),
      );

      let caught: unknown;
      try {
        await sendTX("No wallet", [makeIx(signer.address)], {
          skipPreflight: true,
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain("Wallet not connected");
      expect(events.map((e) => e.type)).toEqual(["error-wallet-not-connected"]);
    });
  });

  describe("send failure", () => {
    it("emits error-transaction-send-failed and rethrows", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      const failingSigner = makeFailingSigner(
        signer.address,
        new Error("user rejected the request"),
      );
      const sendTX = createSendTX(
        params(rpc, {
          signer: failingSigner,
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
        }),
      );

      let caught: unknown;
      try {
        await sendTX("Rejected", [makeIx(signer.address)], {
          skipPreflight: true,
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain("user rejected");

      const sendFailed = findEvent(events, "error-transaction-send-failed");
      expect(sendFailed).toBeDefined();
      expect(sendFailed?.errorMessage).toContain("user rejected");
      // Never reaches confirmation.
      expect(events.map((e) => e.type)).not.toContain(
        "waiting-for-confirmation",
      );
    });
  });

  describe("account refetching", () => {
    it("refetches only writable accounts after confirmation", async () => {
      const { rpc } = makeRpc();
      const { refetchAccounts, calls } = makeRefetch();
      pollControl.result = {
        transaction: {
          message: {
            accountKeys: [
              { writable: true, pubkey: WRITABLE_ACCOUNT },
              { writable: false, pubkey: READONLY_ACCOUNT },
            ],
          },
        },
        meta: { logMessages: [] },
      };
      const sendTX = createSendTX(params(rpc, { refetchAccounts }));

      await sendTX("Refetch", [makeIx(signer.address)], {
        skipPreflight: true,
      });

      expect(calls()).toEqual([[WRITABLE_ACCOUNT]]);
    });

    it("does not call refetch when there are no writable accounts", async () => {
      const { rpc } = makeRpc();
      const { refetchAccounts, calls } = makeRefetch();
      const sendTX = createSendTX(params(rpc, { refetchAccounts }));

      await sendTX("No writable", [makeIx(signer.address)], {
        skipPreflight: true,
      });

      expect(calls()).toEqual([]);
    });

    it("resolves without waiting when waitForAccountRefetch is false", async () => {
      const { rpc } = makeRpc();
      // A refetch that never resolves would hang the call if it were awaited.
      const { refetchAccounts, calls } = makeRefetch(true);
      pollControl.result = {
        transaction: {
          message: {
            accountKeys: [{ writable: true, pubkey: WRITABLE_ACCOUNT }],
          },
        },
        meta: { logMessages: [] },
      };
      const sendTX = createSendTX(params(rpc, { refetchAccounts }));

      const sig = await sendTX("Background", [makeIx(signer.address)], {
        skipPreflight: true,
        waitForAccountRefetch: false,
      });

      expect(typeof sig).toBe("string");
      // Refetch was still kicked off, just not awaited.
      expect(calls()).toEqual([[WRITABLE_ACCOUNT]]);
    });
  });

  describe("confirmation failure", () => {
    it("emits error-transaction-failed and rethrows", async () => {
      const { rpc } = makeRpc();
      const events: TransactionStatusEvent[] = [];
      // A Solana-style error carrying logs in a nested context.
      pollControl.error = Object.assign(new Error("Transaction expired"), {
        context: { logs: ["Program log: boom"] },
      });
      const sendTX = createSendTX(
        params(rpc, {
          onTransactionStatusEvent: (e) => {
            events.push(e);
          },
        }),
      );

      let caught: unknown;
      try {
        await sendTX("Expired", [makeIx(signer.address)], {
          skipPreflight: true,
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(Error);
      expect((caught as Error).message).toContain("Transaction expired");

      const failed = findEvent(events, "error-transaction-failed");
      expect(failed).toBeDefined();
      expect(failed?.errorMessage).toContain("Transaction expired");
      expect(failed?.sig).toBeTruthy();
      // It did reach the send/confirmation stage before failing.
      expect(events.map((e) => e.type)).toContain("waiting-for-confirmation");
      expect(events.map((e) => e.type)).not.toContain("confirmed");
    });
  });
});
