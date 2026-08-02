import type { GetMultipleAccountsApi, Rpc } from "@solana/kit";
import { describe, expect, it, mock } from "bun:test";
import { address, getBase64Encoder, lamports } from "@solana/kit";
import { createBatchAccountsLoader } from "./createBatchAccountsLoader.js";

describe("createBatchAccountsLoader", () => {
  it("should batch multiple load requests", async () => {
    const sendMock = mock(() =>
      Promise.resolve({
        value: [
          {
            data: ["base64data1", "base64"],
            executable: false,
            lamports: 1000000n,
            owner: "11111111111111111111111111111111",
            rentEpoch: 100n,
            space: 100n,
          },
          {
            data: ["base64data2", "base64"],
            executable: true,
            lamports: 2000000n,
            owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            rentEpoch: 101n,
            space: 100n,
          },
          null, // Account doesn't exist
        ],
      }),
    );

    const getMultipleAccountsMock = mock(() => ({
      send: sendMock,
    }));

    const mockRpc = {
      getMultipleAccounts: getMultipleAccountsMock,
    };

    const loader = createBatchAccountsLoader({
      rpc: mockRpc as unknown as Rpc<GetMultipleAccountsApi>,
      commitment: "confirmed",
      maxBatchSize: 10,
    });

    // Make multiple load requests simultaneously
    const [account1, account2, account3] = await Promise.all([
      loader.load(address("11111111111111111111111111111111")),
      loader.load(address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")),
      loader.load(address("So11111111111111111111111111111111111111112")),
    ]);

    // Should batch into a single RPC call
    expect(getMultipleAccountsMock).toHaveBeenCalledTimes(1);
    expect(getMultipleAccountsMock).toHaveBeenCalledWith(
      [
        address("11111111111111111111111111111111"),
        address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        address("So11111111111111111111111111111111111111112"),
      ],
      {
        commitment: "confirmed",
        encoding: "base64",
      },
    );

    // Verify results - data should now be Uint8Array
    const encoder = getBase64Encoder();
    expect(account1).toEqual({
      address: address("11111111111111111111111111111111"),
      data: encoder.encode("base64data1"),
      executable: false,
      lamports: lamports(1000000n),
      programAddress: address("11111111111111111111111111111111"),
      space: 100n,
    });

    expect(account2).toEqual({
      address: address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      data: encoder.encode("base64data2"),
      executable: true,
      lamports: lamports(2000000n),
      programAddress: address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      space: 100n,
    });

    expect(account3).toBeNull();
  });

  it("does not memoize across separate loads by default", async () => {
    const sendMock = mock(() =>
      Promise.resolve({
        value: [
          {
            data: ["cached", "base64"],
            executable: false,
            lamports: 1000000n,
            owner: "11111111111111111111111111111111",
          },
        ],
      }),
    );

    const getMultipleAccountsMock = mock(() => ({
      send: sendMock,
    }));

    const mockRpc = {
      getMultipleAccounts: getMultipleAccountsMock,
    };

    const loader = createBatchAccountsLoader({
      rpc: mockRpc as unknown as Rpc<GetMultipleAccountsApi>,
    });

    const accountId = address("11111111111111111111111111111111");

    // Two sequential (non-concurrent) loads. With caching off, the loader is a
    // pure coalescer: nothing is retained between batches, so the second load
    // hits the RPC again and observes fresh on-chain state.
    await loader.load(accountId);
    await loader.load(accountId);

    expect(getMultipleAccountsMock).toHaveBeenCalledTimes(2);
  });

  it("still coalesces concurrent loads of the same address into one RPC slot", async () => {
    const sendMock = mock(() =>
      Promise.resolve({
        value: [
          {
            data: ["cached", "base64"],
            executable: false,
            lamports: 1000000n,
            owner: "11111111111111111111111111111111",
          },
        ],
      }),
    );

    const getMultipleAccountsMock = mock(() => ({
      send: sendMock,
    }));

    const mockRpc = {
      getMultipleAccounts: getMultipleAccountsMock,
    };

    const loader = createBatchAccountsLoader({
      rpc: mockRpc as unknown as Rpc<GetMultipleAccountsApi>,
    });

    const accountId = address("11111111111111111111111111111111");

    // Three concurrent loads of the SAME address within one batch window.
    const [result1, result2, result3] = await Promise.all([
      loader.load(accountId),
      loader.load(accountId),
      loader.load(accountId),
    ]);

    // Batching is unaffected by disabling the cache: one RPC call...
    expect(getMultipleAccountsMock).toHaveBeenCalledTimes(1);
    // ...and the duplicate keys are deduped, so the address is only requested
    // once rather than consuming three slots of the 99-account limit.
    expect(getMultipleAccountsMock).toHaveBeenCalledWith(
      [accountId],
      expect.anything(),
    );
    // Every caller still gets the value.
    expect(result1).not.toBeNull();
    expect(result2).toEqual(result1);
    expect(result3).toEqual(result1);
  });

  it("memoizes for the loader's lifetime when cache is enabled", async () => {
    const sendMock = mock(() =>
      Promise.resolve({
        value: [
          {
            data: ["cached", "base64"],
            executable: false,
            lamports: 1000000n,
            owner: "11111111111111111111111111111111",
          },
        ],
      }),
    );

    const getMultipleAccountsMock = mock(() => ({
      send: sendMock,
    }));

    const mockRpc = {
      getMultipleAccounts: getMultipleAccountsMock,
    };

    const loader = createBatchAccountsLoader({
      rpc: mockRpc as unknown as Rpc<GetMultipleAccountsApi>,
      cache: true,
    });

    const accountId = address("11111111111111111111111111111111");

    const result1 = await loader.load(accountId);
    const result2 = await loader.load(accountId);

    // Opt-in memoization: only one RPC call, same reference replayed.
    expect(getMultipleAccountsMock).toHaveBeenCalledTimes(1);
    expect(result1).toBe(result2);
  });

  it("should respect maxBatchSize", async () => {
    const sendMock = mock(() =>
      Promise.resolve({
        value: Array(5).fill({
          data: ["data", "base64"],
          executable: false,
          lamports: 1000000n,
          owner: "11111111111111111111111111111111",
        }),
      }),
    );

    const getMultipleAccountsMock = mock(() => ({
      send: sendMock,
    }));

    const mockRpc = {
      getMultipleAccounts: getMultipleAccountsMock,
    };

    const loader = createBatchAccountsLoader({
      rpc: mockRpc as unknown as Rpc<GetMultipleAccountsApi>,
      maxBatchSize: 2, // Small batch size
    });

    // Load 5 accounts
    const accountIds = [
      address("11111111111111111111111111111111"),
      address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      address("So11111111111111111111111111111111111111112"),
      address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
      address("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),
    ];

    await loader.loadMany(accountIds);

    // Should make 3 RPC calls (2 + 2 + 1)
    expect(getMultipleAccountsMock).toHaveBeenCalledTimes(3);
  });
});
