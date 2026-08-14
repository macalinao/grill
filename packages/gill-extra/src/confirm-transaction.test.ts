import type { Signature, TransactionError } from "@solana/kit";
import type { ConfirmationRpcSubscriptions } from "./confirm-transaction.js";
import type { ConfirmationRpc } from "./poll-transaction-confirmation.js";
import { describe, expect, it } from "bun:test";
import { getSolanaErrorFromTransactionError, SolanaError } from "@solana/kit";
import { confirmTransaction } from "./confirm-transaction.js";
import { createLogger } from "./logger.js";
import {
  pollTransactionConfirmation,
  TRANSACTION_CONFIRMATION_TIMEOUT_MESSAGE,
  TRANSACTION_EXPIRED_MESSAGE,
} from "./poll-transaction-confirmation.js";

const SIGNATURE =
  "4Xk6xLLDKKMEbnHqRLbXNPGVYLZBWPPkFDZfnCzQXVfHRvhTB1RfL4WSCJnfLBFVYhcKtqfPJmc4EPjKqPzPa1eR" as Signature;
const LAST_VALID_BLOCK_HEIGHT = 100n;

/** Quiet: the paths under test log warnings and errors on purpose. */
const LOGGER = createLogger("off");

/** Reconnect fast enough that the tests do not wait on real backoff. */
const FAST_RECONNECT = {
  baseDelayMs: 1,
  maxDelayMs: 2,
  stableConnectionMs: 0,
};

const ON_CHAIN_ERROR: TransactionError = {
  InstructionError: [0, { Custom: 6000 }],
};

interface SignatureStatus {
  confirmationStatus: "processed" | "confirmed" | "finalized" | null;
  err: TransactionError | null;
}

interface FakeRpc {
  rpc: ConfirmationRpc;
  /** The status `getSignatureStatuses` reports; `null` means "unknown". */
  setStatus: (status: SignatureStatus | null) => void;
  setBlockHeight: (blockHeight: bigint) => void;
  /** Makes the next `getSignatureStatuses` call reject. */
  failNextStatus: (error: Error) => void;
  statusCalls: () => number;
  blockHeightCalls: () => number;
}

function createFakeRpc(initialStatus: SignatureStatus | null = null): FakeRpc {
  let status = initialStatus;
  let blockHeight = 0n;
  let statusFailure: Error | null = null;
  let statusCalls = 0;
  let blockHeightCalls = 0;

  const rpc = {
    getSignatureStatuses: () => ({
      send: () => {
        statusCalls++;
        const failure = statusFailure;
        statusFailure = null;
        if (failure) {
          return Promise.reject(failure);
        }
        return Promise.resolve({ value: [status] });
      },
    }),
    getBlockHeight: () => ({
      send: () => {
        blockHeightCalls++;
        return Promise.resolve(blockHeight);
      },
    }),
  } as unknown as ConfirmationRpc;

  return {
    rpc,
    setStatus: (next) => {
      status = next;
    },
    setBlockHeight: (next) => {
      blockHeight = next;
    },
    failNextStatus: (error) => {
      statusFailure = error;
    },
    statusCalls: () => statusCalls,
    blockHeightCalls: () => blockHeightCalls,
  };
}

interface Notification {
  value: { err: TransactionError | null };
}

/**
 * One signature subscription's notification stream, driven by the test: push a
 * notification, or close/fail the stream the way a dropped socket would.
 */
interface FakeChannel {
  abortSignal: AbortSignal;
  push: (notification: Notification) => void;
  close: () => void;
  fail: (error: Error) => void;
  iterable: AsyncIterable<Notification>;
}

function createFakeChannel(abortSignal: AbortSignal): FakeChannel {
  const queue: Notification[] = [];
  let wake: (() => void) | null = null;
  let closed = false;
  let failure: Error | null = null;

  const flush = (): void => {
    const resolve = wake;
    wake = null;
    resolve?.();
  };

  const iterable: AsyncIterable<Notification> = {
    async *[Symbol.asyncIterator]() {
      for (;;) {
        const next = queue.shift();
        if (next !== undefined) {
          yield next;
          continue;
        }
        if (failure) {
          throw failure;
        }
        if (closed || abortSignal.aborted) {
          return;
        }
        await new Promise<void>((resolve) => {
          wake = resolve;
          abortSignal.addEventListener("abort", flush, { once: true });
        });
      }
    },
  };

  return {
    abortSignal,
    iterable,
    push: (notification) => {
      queue.push(notification);
      flush();
    },
    close: () => {
      closed = true;
      flush();
    },
    fail: (error) => {
      failure = error;
      flush();
    },
  };
}

interface FakeRpcSubscriptions {
  rpcSubscriptions: ConfirmationRpcSubscriptions;
  /** Every channel handed out, in the order they were subscribed. */
  channels: FakeChannel[];
  /** Errors to reject the next `subscribe()` calls with, one per entry. */
  subscribeErrors: Error[];
  /** Every commitment the subscription was opened with. */
  commitments: (string | undefined)[];
}

function createFakeRpcSubscriptions(): FakeRpcSubscriptions {
  const channels: FakeChannel[] = [];
  const subscribeErrors: Error[] = [];
  const commitments: (string | undefined)[] = [];

  const rpcSubscriptions = {
    signatureNotifications: (
      _signature: Signature,
      config?: { commitment?: string },
    ) => {
      commitments.push(config?.commitment);
      return {
        subscribe: ({
          abortSignal,
        }: {
          abortSignal: AbortSignal;
        }): Promise<AsyncIterable<Notification>> => {
          const failure = subscribeErrors.shift();
          if (failure) {
            return Promise.reject(failure);
          }
          const channel = createFakeChannel(abortSignal);
          channels.push(channel);
          return Promise.resolve(channel.iterable);
        },
      };
    },
  };

  return {
    rpcSubscriptions:
      rpcSubscriptions as unknown as ConfirmationRpcSubscriptions,
    channels,
    subscribeErrors,
    commitments,
  };
}

async function waitFor(
  predicate: () => boolean,
  message: string,
  timeoutMs = 2000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for ${message}`);
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2);
    });
  }
}

function confirmed(err: TransactionError | null = null): SignatureStatus {
  return { confirmationStatus: "confirmed", err };
}

/**
 * Asserts that `pending` rejects and hands back the error.
 *
 * `expect(...).rejects` is typed as returning `void` by bun-types even though
 * it is asynchronous, which makes awaiting it a lint error. Catching by hand
 * keeps the assertion honest.
 */
async function expectRejection(pending: Promise<unknown>): Promise<Error> {
  let caught: unknown;
  let rejected = false;
  try {
    await pending;
  } catch (error) {
    rejected = true;
    caught = error;
  }
  expect(rejected).toBe(true);
  expect(caught).toBeInstanceOf(Error);
  return caught instanceof Error ? caught : new Error("unreachable");
}

/**
 * Base options shared by the WebSocket tests: a block height watch slow enough
 * that it never fires unless a test wants it to.
 */
const IDLE_EXPIRY_WATCH = { blockHeightIntervalMs: 10_000 };

describe("confirmTransaction over WebSockets", () => {
  it("resolves on the first notification", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");
    subs.channels[0]?.push({ value: { err: null } });

    expect(await pending).toEqual({ err: null });
    expect(subs.commitments).toEqual(["confirmed"]);
    // The subscription is torn down once the verdict is in.
    expect(subs.channels[0]?.abortSignal.aborted).toBe(true);
  });

  it("reports an on-chain failure rather than throwing", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");
    subs.channels[0]?.push({ value: { err: ON_CHAIN_ERROR } });

    expect(await pending).toEqual({ err: ON_CHAIN_ERROR });
  });

  it("catches up on a transaction that confirmed before it subscribed", async () => {
    // `signatureNotifications` never replays events, so nothing will ever
    // arrive on this channel. Without the catch-up check this would hang.
    const rpc = createFakeRpc(confirmed());
    const subs = createFakeRpcSubscriptions();

    const result = await confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      ...IDLE_EXPIRY_WATCH,
    });

    expect(result).toEqual({ err: null });
    expect(subs.channels).toHaveLength(1);
    expect(subs.channels[0]?.abortSignal.aborted).toBe(true);
  });

  it("catches up on a transaction that confirmed during a reconnect", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");

    // The socket dies, and the transaction lands while nothing is listening.
    rpc.setStatus(confirmed(ON_CHAIN_ERROR));
    subs.channels[0]?.fail(new Error("socket closed unexpectedly"));

    // The replacement subscription will never be notified about it, so only
    // the catch-up check can settle this.
    expect(await pending).toEqual({ err: ON_CHAIN_ERROR });
    expect(subs.channels.length).toBeGreaterThanOrEqual(2);
  });

  it("reconnects after a socket error and resolves on the new stream", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");
    subs.channels[0]?.fail(new Error("socket closed unexpectedly"));

    await waitFor(() => subs.channels.length === 2, "a reconnect");
    subs.channels[1]?.push({ value: { err: null } });

    expect(await pending).toEqual({ err: null });
  });

  it("reconnects after the server closes the stream", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");
    subs.channels[0]?.close();

    await waitFor(() => subs.channels.length === 2, "a reconnect");
    subs.channels[1]?.push({ value: { err: null } });

    expect(await pending).toEqual({ err: null });
  });

  it("gives up when the blockhash expires", async () => {
    const rpc = createFakeRpc();
    rpc.setBlockHeight(LAST_VALID_BLOCK_HEIGHT + 1n);
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      blockHeightIntervalMs: 5,
    });

    const error = await expectRejection(pending);
    expect(error.message).toBe(TRANSACTION_EXPIRED_MESSAGE);

    // Expiry has to tear the subscription down too.
    await waitFor(
      () => subs.channels[0]?.abortSignal.aborted === true,
      "the subscription to be torn down",
    );
  });

  it("takes a landed transaction over an expired blockhash", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      blockHeightIntervalMs: 5,
    });

    // Nothing was confirmed when the subscription's catch-up check ran, so
    // only the expiry watch's own last-chance check can settle this.
    await waitFor(() => rpc.statusCalls() >= 1, "the catch-up check");
    rpc.setStatus(confirmed());
    rpc.setBlockHeight(LAST_VALID_BLOCK_HEIGHT + 1n);

    expect(await pending).toEqual({ err: null });
  });

  it("stops checking the block height once it has a verdict", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      blockHeightIntervalMs: 5,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");
    subs.channels[0]?.push({ value: { err: null } });
    await pending;

    const callsAtResolution = rpc.blockHeightCalls();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 40);
    });
    expect(rpc.blockHeightCalls()).toBe(callsAtResolution);
  });

  it("rejects and tears everything down when aborted", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();
    const controller = new AbortController();

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      abortSignal: controller.signal,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "the subscription");
    controller.abort();

    await expectRejection(pending);
    expect(subs.channels[0]?.abortSignal.aborted).toBe(true);

    // Nothing keeps running after the teardown.
    const callsAtAbort = rpc.statusCalls();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 40);
    });
    expect(rpc.statusCalls()).toBe(callsAtAbort);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();

    await expectRejection(
      confirmTransaction({
        signature: SIGNATURE,
        lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
        rpc: rpc.rpc,
        rpcSubscriptions: subs.rpcSubscriptions,
        logger: LOGGER,
        abortSignal: AbortSignal.abort(),
        ...IDLE_EXPIRY_WATCH,
      }),
    );

    expect(subs.channels).toHaveLength(0);
  });
});

describe("confirmTransaction falling back to polling", () => {
  it("polls when no subscriptions client is given", async () => {
    const rpc = createFakeRpc(confirmed());

    const result = await confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      logger: LOGGER,
    });

    expect(result).toEqual({ err: null });
    expect(rpc.statusCalls()).toBe(1);
  });

  it("polls when subscribing fails in a way that will not fix itself", async () => {
    const rpc = createFakeRpc(confirmed(ON_CHAIN_ERROR));
    const subs = createFakeRpcSubscriptions();
    // What an endpoint without `signatureSubscribe` support looks like.
    subs.subscribeErrors.push(new Error("Method not found (-32601)"));

    const result = await confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      ...IDLE_EXPIRY_WATCH,
    });

    expect(result).toEqual({ err: ON_CHAIN_ERROR });
    // It did not keep retrying a subscription that will never work.
    expect(subs.channels).toHaveLength(0);
  });

  it("polls when the subscriptions client is not one at all", async () => {
    const rpc = createFakeRpc(confirmed());
    const notASubscriptionsClient = {} as ConfirmationRpcSubscriptions;

    const result = await confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: notASubscriptionsClient,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      ...IDLE_EXPIRY_WATCH,
    });

    expect(result).toEqual({ err: null });
  });

  it("polls after the configured number of transient subscribe failures", async () => {
    const rpc = createFakeRpc(confirmed());
    const subs = createFakeRpcSubscriptions();
    subs.subscribeErrors.push(
      new Error("connect ECONNREFUSED"),
      new Error("connect ECONNREFUSED"),
    );

    const result = await confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      maxSubscribeAttempts: 2,
      ...IDLE_EXPIRY_WATCH,
    });

    expect(result).toEqual({ err: null });
    expect(subs.channels).toHaveLength(0);
  });

  it("retries a transient subscribe failure before falling back", async () => {
    const rpc = createFakeRpc();
    const subs = createFakeRpcSubscriptions();
    subs.subscribeErrors.push(new Error("connect ECONNREFUSED"));

    const pending = confirmTransaction({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      rpcSubscriptions: subs.rpcSubscriptions,
      logger: LOGGER,
      reconnect: FAST_RECONNECT,
      maxSubscribeAttempts: 3,
      ...IDLE_EXPIRY_WATCH,
    });

    await waitFor(() => subs.channels.length === 1, "a retried subscription");
    subs.channels[0]?.push({ value: { err: null } });

    expect(await pending).toEqual({ err: null });
  });
});

describe("pollTransactionConfirmation", () => {
  it("returns the on-chain error instead of throwing", async () => {
    const rpc = createFakeRpc(confirmed(ON_CHAIN_ERROR));

    expect(
      await pollTransactionConfirmation({
        signature: SIGNATURE,
        lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
        rpc: rpc.rpc,
        logger: LOGGER,
      }),
    ).toEqual({ err: ON_CHAIN_ERROR });
  });

  it("keeps polling until the transaction is confirmed", async () => {
    const rpc = createFakeRpc({ confirmationStatus: "processed", err: null });

    const pending = pollTransactionConfirmation({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      retryInterval: 5,
      logger: LOGGER,
    });

    await waitFor(() => rpc.statusCalls() >= 2, "a second status check");
    rpc.setStatus(confirmed());

    expect(await pending).toEqual({ err: null });
  });

  it("throws when the blockhash expires", async () => {
    const rpc = createFakeRpc();
    rpc.setBlockHeight(LAST_VALID_BLOCK_HEIGHT + 1n);

    const error = await expectRejection(
      pollTransactionConfirmation({
        signature: SIGNATURE,
        lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
        rpc: rpc.rpc,
        retryInterval: 5,
        logger: LOGGER,
      }),
    );
    expect(error.message).toBe(TRANSACTION_EXPIRED_MESSAGE);
  });

  it("throws when it runs out of attempts", async () => {
    const rpc = createFakeRpc();

    const error = await expectRejection(
      pollTransactionConfirmation({
        signature: SIGNATURE,
        lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
        rpc: rpc.rpc,
        maxRetries: 2,
        retryInterval: 1,
        logger: LOGGER,
      }),
    );
    expect(error.message).toBe(TRANSACTION_CONFIRMATION_TIMEOUT_MESSAGE);
  });

  it("propagates a failed status check", async () => {
    const rpc = createFakeRpc();
    rpc.failNextStatus(new Error("rpc unavailable"));

    const error = await expectRejection(
      pollTransactionConfirmation({
        signature: SIGNATURE,
        lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
        rpc: rpc.rpc,
        retryInterval: 1,
        logger: LOGGER,
      }),
    );
    expect(error.message).toBe("rpc unavailable");
  });

  it("stops polling when aborted", async () => {
    const rpc = createFakeRpc();
    const controller = new AbortController();

    const pending = pollTransactionConfirmation({
      signature: SIGNATURE,
      lastValidBlockHeight: LAST_VALID_BLOCK_HEIGHT,
      rpc: rpc.rpc,
      retryInterval: 5,
      abortSignal: controller.signal,
      logger: LOGGER,
    });

    await waitFor(() => rpc.statusCalls() >= 1, "the first status check");
    controller.abort();

    await expectRejection(pending);

    const callsAtAbort = rpc.statusCalls();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 40);
    });
    expect(rpc.statusCalls()).toBe(callsAtAbort);
  });
});

describe("on-chain errors", () => {
  it("convert to a SolanaError", () => {
    // What callers are expected to do with a non-null `err`, rather than the
    // generic `new Error("Transaction failed on-chain")` this used to raise.
    const error = getSolanaErrorFromTransactionError(ON_CHAIN_ERROR);
    expect(error).toBeInstanceOf(SolanaError);
    expect(error.message).not.toBe("Transaction failed on-chain");
  });
});
