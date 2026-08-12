import type { Address, Lamports } from "@solana/kit";
import type { RpcSubscriptions, SolanaRpcSubscriptionsApi } from "gill";
import type { AccountDecoder } from "./subscription-context.js";
import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { address, getBase64Decoder, lamports } from "@solana/kit";
import { QueryClient } from "@tanstack/react-query";
import { createAccountQueryKey } from "../query-keys.js";
import { createSubscriptionManager } from "./subscription-context.js";

const ACCOUNT = address("SysvarC1ock11111111111111111111111111111111");
const OWNER = address("11111111111111111111111111111111");

/** Reconnect fast enough that the tests do not have to wait on real backoff. */
const FAST_RECONNECT = {
  reconnect: { baseDelayMs: 1, maxDelayMs: 2, stableConnectionMs: 0 },
};

interface NotificationValue {
  lamports: Lamports;
  data: readonly [string, string];
  owner: Address;
  executable: boolean;
  space: bigint;
}

interface Notification {
  value: NotificationValue;
}

/** Builds an `accountNotifications` payload whose data decodes to `bytes`. */
function makeNotification(bytes: Uint8Array, sol = 1n): Notification {
  return {
    value: {
      lamports: lamports(sol),
      data: [getBase64Decoder().decode(bytes), "base64"] as const,
      owner: OWNER,
      executable: false,
      space: BigInt(bytes.length),
    },
  };
}

/**
 * One WebSocket subscription's notification stream, driven by the test: push
 * notifications, then either close it (server hung up) or fail it (socket
 * error).
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
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  /** Every channel handed out, in the order they were subscribed. */
  channels: FakeChannel[];
  /** Errors to reject the next `subscribe()` calls with, one per entry. */
  subscribeErrors: Error[];
}

function createFakeRpcSubscriptions(): FakeRpcSubscriptions {
  const channels: FakeChannel[] = [];
  const subscribeErrors: Error[] = [];

  const rpcSubscriptions = {
    accountNotifications: () => ({
      subscribe: ({
        abortSignal,
      }: {
        abortSignal: AbortSignal;
      }): Promise<AsyncIterable<Notification>> => {
        const error = subscribeErrors.shift();
        if (error) {
          return Promise.reject(error);
        }
        const channel = createFakeChannel(abortSignal);
        channels.push(channel);
        return Promise.resolve(channel.iterable);
      },
    }),
  };

  return {
    rpcSubscriptions:
      rpcSubscriptions as unknown as RpcSubscriptions<SolanaRpcSubscriptionsApi>,
    channels,
    subscribeErrors,
  };
}

interface DecodedAccount {
  address: Address;
  bytes: number[];
}

const decoder: AccountDecoder<DecodedAccount> = (encodedAccount) => ({
  ...encodedAccount,
  data: {
    address: encodedAccount.address,
    bytes: [...encodedAccount.data],
  },
});

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

const queryKey = createAccountQueryKey(ACCOUNT);

function readCachedBytes(queryClient: QueryClient): number[] | undefined {
  const cached = queryClient.getQueryData<{ data: DecodedAccount }>(queryKey);
  return cached?.data.bytes;
}

describe("createSubscriptionManager", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("writes decoded notifications into the account query cache", async () => {
    const rpc = createFakeRpcSubscriptions();
    const manager = createSubscriptionManager(
      rpc.rpcSubscriptions,
      queryClient,
      FAST_RECONNECT,
    );

    const unsubscribe = manager.subscribe(ACCOUNT, decoder);
    await waitFor(() => rpc.channels.length === 1, "the first subscription");

    rpc.channels[0]?.push(makeNotification(new Uint8Array([1, 2, 3])));
    await waitFor(
      () => readCachedBytes(queryClient) !== undefined,
      "an update",
    );

    expect(readCachedBytes(queryClient)).toEqual([1, 2, 3]);
    expect(manager.getSubscriptionStatus(ACCOUNT)).toBe("connected");

    unsubscribe();
  });

  it("clears the cache entry when the account is closed on-chain", async () => {
    const rpc = createFakeRpcSubscriptions();
    const manager = createSubscriptionManager(
      rpc.rpcSubscriptions,
      queryClient,
      FAST_RECONNECT,
    );

    const unsubscribe = manager.subscribe(ACCOUNT, decoder);
    await waitFor(() => rpc.channels.length === 1, "the first subscription");

    rpc.channels[0]?.push(makeNotification(new Uint8Array([9]), 0n));
    await waitFor(
      () => queryClient.getQueryData(queryKey) === null,
      "the closure to land",
    );

    unsubscribe();
  });

  it("re-opens the subscription when the server closes the stream", async () => {
    const rpc = createFakeRpcSubscriptions();
    const manager = createSubscriptionManager(
      rpc.rpcSubscriptions,
      queryClient,
      FAST_RECONNECT,
    );

    const unsubscribe = manager.subscribe(ACCOUNT, decoder);
    await waitFor(() => rpc.channels.length === 1, "the first subscription");

    // The server hangs up. Previously this ended the subscription for good.
    rpc.channels[0]?.close();
    await waitFor(() => rpc.channels.length === 2, "a reconnect");

    // The replacement stream feeds the same cache entry.
    rpc.channels[1]?.push(makeNotification(new Uint8Array([7, 7])));
    await waitFor(
      () => readCachedBytes(queryClient) !== undefined,
      "an update after reconnecting",
    );
    expect(readCachedBytes(queryClient)).toEqual([7, 7]);

    unsubscribe();
  });

  it("re-opens the subscription when the stream errors", async () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {
      // The manager logs the dropped connection; keep the test output clean.
    });

    try {
      const rpc = createFakeRpcSubscriptions();
      const manager = createSubscriptionManager(
        rpc.rpcSubscriptions,
        queryClient,
        FAST_RECONNECT,
      );

      const unsubscribe = manager.subscribe(ACCOUNT, decoder);
      await waitFor(() => rpc.channels.length === 1, "the first subscription");

      rpc.channels[0]?.fail(new Error("socket closed unexpectedly"));
      await waitFor(() => rpc.channels.length === 2, "a reconnect");

      rpc.channels[1]?.push(makeNotification(new Uint8Array([4])));
      await waitFor(
        () => readCachedBytes(queryClient) !== undefined,
        "an update after reconnecting",
      );

      unsubscribe();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("keeps retrying when the subscribe call itself fails", async () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {
      // Expected: two failed connection attempts are logged.
    });

    try {
      const rpc = createFakeRpcSubscriptions();
      rpc.subscribeErrors.push(
        new Error("connect failed"),
        new Error("connect failed again"),
      );

      const manager = createSubscriptionManager(
        rpc.rpcSubscriptions,
        queryClient,
        FAST_RECONNECT,
      );
      const unsubscribe = manager.subscribe(ACCOUNT, decoder);

      await waitFor(
        () => rpc.channels.length === 1,
        "a connection after two failures",
      );

      rpc.channels[0]?.push(makeNotification(new Uint8Array([5])));
      await waitFor(
        () => readCachedBytes(queryClient) !== undefined,
        "an update once connected",
      );

      unsubscribe();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("invalidates the cached account after reconnecting", async () => {
    const rpc = createFakeRpcSubscriptions();
    const manager = createSubscriptionManager(
      rpc.rpcSubscriptions,
      queryClient,
      FAST_RECONNECT,
    );

    // Stand in for the read that `useAccount` would have populated.
    queryClient.setQueryData(queryKey, {
      data: { address: ACCOUNT, bytes: [] },
    });

    const unsubscribe = manager.subscribe(ACCOUNT, decoder);
    await waitFor(() => rpc.channels.length === 1, "the first subscription");
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(false);

    rpc.channels[0]?.close();
    await waitFor(() => rpc.channels.length === 2, "a reconnect");

    // Updates published while the socket was down are unrecoverable, so the
    // cached account has to be refetched.
    await waitFor(
      () => queryClient.getQueryState(queryKey)?.isInvalidated === true,
      "the account query to be invalidated",
    );

    unsubscribe();
  });

  it("stops reconnecting once the last subscriber unsubscribes", async () => {
    const rpc = createFakeRpcSubscriptions();
    const manager = createSubscriptionManager(
      rpc.rpcSubscriptions,
      queryClient,
      FAST_RECONNECT,
    );

    const unsubscribe = manager.subscribe(ACCOUNT, decoder);
    await waitFor(() => rpc.channels.length === 1, "the first subscription");

    unsubscribe();
    expect(rpc.channels[0]?.abortSignal.aborted).toBe(true);
    expect(manager.getSubscriptionCount(ACCOUNT)).toBe(0);
    expect(manager.getSubscriptionStatus(ACCOUNT)).toBeUndefined();

    rpc.channels[0]?.close();
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 25);
    });
    expect(rpc.channels).toHaveLength(1);
  });

  it("shares one subscription and tolerates repeated unsubscribes", async () => {
    const rpc = createFakeRpcSubscriptions();
    const manager = createSubscriptionManager(
      rpc.rpcSubscriptions,
      queryClient,
      FAST_RECONNECT,
    );

    const first = manager.subscribe(ACCOUNT, decoder);
    const second = manager.subscribe(ACCOUNT, decoder);
    await waitFor(() => rpc.channels.length === 1, "the first subscription");
    expect(manager.getSubscriptionCount(ACCOUNT)).toBe(2);

    // A double release must not drop the reference the other subscriber holds.
    first();
    first();
    expect(manager.getSubscriptionCount(ACCOUNT)).toBe(1);
    expect(rpc.channels[0]?.abortSignal.aborted).toBe(false);

    second();
    expect(manager.getSubscriptionCount(ACCOUNT)).toBe(0);
    expect(rpc.channels[0]?.abortSignal.aborted).toBe(true);
  });
});
