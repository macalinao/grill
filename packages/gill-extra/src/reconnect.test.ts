import { describe, expect, it, spyOn } from "bun:test";
import {
  DEFAULT_RECONNECT_BASE_DELAY_MS,
  DEFAULT_RECONNECT_MAX_DELAY_MS,
  DEFAULT_STABLE_CONNECTION_MS,
  getReconnectDelayMs,
  resolveReconnectConfig,
  waitBeforeReconnect,
  waitForDelay,
} from "./reconnect.js";

const BASE = 500;
const MAX = 30_000;

/**
 * Bun's `globalThis` declares `addEventListener` but not `dispatchEvent`, so
 * firing an `online` event needs the `EventTarget` view of it.
 */
const globalEvents = globalThis as unknown as EventTarget;

/** The window equal jitter is allowed to land in for a given exponential. */
function jitterBounds(exponential: number): [number, number] {
  return [exponential / 2, exponential];
}

describe("resolveReconnectConfig", () => {
  it("fills in the defaults", () => {
    expect(resolveReconnectConfig(undefined)).toEqual({
      baseDelayMs: DEFAULT_RECONNECT_BASE_DELAY_MS,
      maxDelayMs: DEFAULT_RECONNECT_MAX_DELAY_MS,
      stableConnectionMs: DEFAULT_STABLE_CONNECTION_MS,
    });
    expect(resolveReconnectConfig({})).toEqual({
      baseDelayMs: DEFAULT_RECONNECT_BASE_DELAY_MS,
      maxDelayMs: DEFAULT_RECONNECT_MAX_DELAY_MS,
      stableConnectionMs: DEFAULT_STABLE_CONNECTION_MS,
    });
  });

  it("keeps the fields the caller set", () => {
    expect(
      resolveReconnectConfig({ baseDelayMs: 1, stableConnectionMs: 0 }),
    ).toEqual({
      baseDelayMs: 1,
      maxDelayMs: DEFAULT_RECONNECT_MAX_DELAY_MS,
      stableConnectionMs: 0,
    });
  });
});

describe("getReconnectDelayMs", () => {
  it("doubles the window on each consecutive failure", () => {
    for (const attempts of [0, 1, 2, 3, 4]) {
      const [low, high] = jitterBounds(BASE * 2 ** attempts);
      const delay = getReconnectDelayMs(attempts, BASE, MAX);
      expect(delay).toBeGreaterThanOrEqual(low);
      expect(delay).toBeLessThan(high);
    }
  });

  it("stays inside the equal-jitter window across many samples", () => {
    const [low, high] = jitterBounds(BASE * 2 ** 3);
    const samples = Array.from({ length: 200 }, () =>
      getReconnectDelayMs(3, BASE, MAX),
    );
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(low);
      expect(sample).toBeLessThan(high);
    }
    // Jitter that never moves would defeat the point of having it.
    expect(new Set(samples).size).toBeGreaterThan(1);
  });

  it("clamps at the maximum delay", () => {
    const [low, high] = jitterBounds(MAX);
    for (const attempts of [20, 100, 1000]) {
      const delay = getReconnectDelayMs(attempts, BASE, MAX);
      expect(delay).toBeGreaterThanOrEqual(low);
      expect(delay).toBeLessThan(high);
    }
  });

  it("does not overflow on an absurd number of attempts", () => {
    expect(
      Number.isFinite(getReconnectDelayMs(Number.MAX_SAFE_INTEGER, BASE, MAX)),
    ).toBe(true);
  });
});

describe("waitBeforeReconnect", () => {
  it("waits out the delay", async () => {
    const startedAt = Date.now();
    await waitBeforeReconnect(30, new AbortController().signal);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(25);
  });

  it("wakes early when the wait is aborted", async () => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const waited = waitBeforeReconnect(5000, controller.signal);
    controller.abort();
    await waited;
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });

  it("resolves immediately when the signal is already aborted", async () => {
    const startedAt = Date.now();
    await waitBeforeReconnect(5000, AbortSignal.abort());
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });

  it("wakes early when the browser comes back online", async () => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const waited = waitBeforeReconnect(5000, controller.signal);
    globalEvents.dispatchEvent(new Event("online"));
    await waited;
    controller.abort();
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });

  it("removes its `online` listener once it has resolved", async () => {
    const added = spyOn(globalThis, "addEventListener");
    const removed = spyOn(globalThis, "removeEventListener");

    try {
      const controller = new AbortController();
      const waited = waitBeforeReconnect(5000, controller.signal);
      controller.abort();
      await waited;

      // A listener left behind would keep the wait's closure -- and the 5s
      // timer it captured -- alive for every future `online` event.
      const countFor = (spy: typeof added): number =>
        spy.mock.calls.filter(([type]) => type === "online").length;
      expect(countFor(added)).toBe(1);
      expect(countFor(removed)).toBe(1);
    } finally {
      added.mockRestore();
      removed.mockRestore();
    }
  });
});

describe("waitForDelay", () => {
  it("waits out the delay", async () => {
    const startedAt = Date.now();
    await waitForDelay(30, new AbortController().signal);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(25);
  });

  it("wakes early when aborted", async () => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const waited = waitForDelay(5000, controller.signal);
    controller.abort();
    await waited;
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });

  it("resolves immediately when the signal is already aborted", async () => {
    const startedAt = Date.now();
    await waitForDelay(5000, AbortSignal.abort());
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });

  it("ignores the `online` event", async () => {
    const controller = new AbortController();
    let resolved = false;
    const waited = waitForDelay(5000, controller.signal).then(() => {
      resolved = true;
    });

    globalEvents.dispatchEvent(new Event("online"));
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(resolved).toBe(false);

    controller.abort();
    await waited;
  });
});
