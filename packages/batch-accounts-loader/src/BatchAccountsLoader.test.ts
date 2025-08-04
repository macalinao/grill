import { describe, it, expect, vi } from "vitest";
import { address } from "@solana/kit";
import { BatchAccountsLoader } from "./BatchAccountsLoader";

describe("BatchAccountsLoader", () => {
  it("should batch multiple load requests", async () => {
    const mockRpc = {
      getMultipleAccounts: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({
          value: [
            {
              data: ["base64data1", "base64"],
              executable: false,
              lamports: 1000000n,
              owner: "11111111111111111111111111111111",
              rentEpoch: 100n,
            },
            {
              data: ["base64data2", "base64"],
              executable: true,
              lamports: 2000000n,
              owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              rentEpoch: 101n,
            },
            null, // Account doesn't exist
          ],
        }),
      }),
    };

    const loader = new BatchAccountsLoader({
      rpc: mockRpc as any,
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
    expect(mockRpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
    expect(mockRpc.getMultipleAccounts).toHaveBeenCalledWith(
      [
        address("11111111111111111111111111111111"),
        address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        address("So11111111111111111111111111111111111111112"),
      ],
      {
        commitment: "confirmed",
        encoding: "base64",
      }
    );

    // Verify results
    expect(account1).toEqual({
      data: "base64data1",
      executable: false,
      lamports: 1000000n,
      owner: address("11111111111111111111111111111111"),
      rentEpoch: 100n,
    });

    expect(account2).toEqual({
      data: "base64data2",
      executable: true,
      lamports: 2000000n,
      owner: address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      rentEpoch: 101n,
    });

    expect(account3).toBeNull();
  });

  it("should cache results", async () => {
    const mockRpc = {
      getMultipleAccounts: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({
          value: [
            {
              data: ["cached", "base64"],
              executable: false,
              lamports: 1000000n,
              owner: "11111111111111111111111111111111",
            },
          ],
        }),
      }),
    };

    const loader = new BatchAccountsLoader({
      rpc: mockRpc as any,
    });

    const accountId = address("11111111111111111111111111111111");

    // First load
    const result1 = await loader.load(accountId);
    
    // Second load (should use cache)
    const result2 = await loader.load(accountId);

    // Should only call RPC once
    expect(mockRpc.getMultipleAccounts).toHaveBeenCalledTimes(1);
    expect(result1).toBe(result2); // Same reference
  });

  it("should respect maxBatchSize", async () => {
    const mockRpc = {
      getMultipleAccounts: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({
          value: Array(5).fill({
            data: ["data", "base64"],
            executable: false,
            lamports: 1000000n,
            owner: "11111111111111111111111111111111",
          }),
        }),
      }),
    };

    const loader = new BatchAccountsLoader({
      rpc: mockRpc as any,
      maxBatchSize: 2, // Small batch size
    });

    // Load 5 accounts
    const accountIds = Array.from({ length: 5 }, (_, i) =>
      address(`1111111111111111111111111111111${i}`)
    );

    await loader.loadMany(accountIds);

    // Should make 3 RPC calls (2 + 2 + 1)
    expect(mockRpc.getMultipleAccounts).toHaveBeenCalledTimes(3);
  });
});