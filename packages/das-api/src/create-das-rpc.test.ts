import type { RpcResponse, RpcTransport } from "@solana/kit";
import type { DasRpc } from "./create-das-rpc.js";
import type { DasApiErrorObject } from "./das-api-error.js";
import type { JsonObject, JsonValue } from "./types/json-value.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { createDasRpc, createDasRpcFromTransport } from "./create-das-rpc.js";
import { DasApiError } from "./das-api-error.js";

const ID = address("So11111111111111111111111111111111111111112");
const OWNER = address("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");
const CREATOR = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const AUTHORITY = address("11111111111111111111111111111111");

interface CapturedPayload {
  jsonrpc: string;
  id: number;
  method: string;
  params: JsonValue;
}

type JsonRpcEnvelope =
  | { jsonrpc: "2.0"; id: number; result: JsonValue }
  | { jsonrpc: "2.0"; id: number; error: DasApiErrorObject };

interface MockTransport {
  transport: RpcTransport;
  payloads: CapturedPayload[];
}

/**
 * Builds a mock transport that records every payload it receives and produces a
 * JSON-RPC envelope from the given responder.
 */
function makeMockTransport(
  respond: (payload: CapturedPayload) => JsonRpcEnvelope,
): MockTransport {
  const payloads: CapturedPayload[] = [];
  const transport: RpcTransport = <TResponse>({
    payload,
  }: Parameters<RpcTransport>[0]): Promise<RpcResponse<TResponse>> => {
    const captured = payload as CapturedPayload;
    payloads.push(captured);
    return Promise.resolve(respond(captured) as RpcResponse<TResponse>);
  };
  return { transport, payloads };
}

/**
 * A mock transport that echoes `{ method, params }` back as the result.
 */
function makeEchoTransport(): MockTransport {
  return makeMockTransport((payload) => ({
    jsonrpc: "2.0",
    id: payload.id,
    result: { method: payload.method, params: payload.params },
  }));
}

describe("createDasRpcFromTransport", () => {
  it("sends the method name and unwrapped params, returning the result", async () => {
    const { transport, payloads } = makeEchoTransport();
    const das = createDasRpcFromTransport(transport);

    const result = await das.getAsset({ id: ID }).send();

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.jsonrpc).toBe("2.0");
    expect(payloads[0]?.method).toBe("getAsset");
    expect(payloads[0]?.params).toEqual({ id: ID });
    // `.send()` resolves to the unwrapped `result`, not the JSON-RPC envelope.
    // The echo transport returns a `{ method, params }` sentinel there; the
    // exact unwrapping is asserted directly in response-transformer.test.ts.
    expect(result).toBeDefined();
    expect(Object.keys(result)).toEqual(["method", "params"]);
  });

  it("sends the correct wire method name and params for every DAS method", async () => {
    const { transport, payloads } = makeEchoTransport();
    const das = createDasRpcFromTransport(transport);

    const calls: {
      method: string;
      params: JsonObject;
      run: () => Promise<void>;
    }[] = [
      {
        method: "getAsset",
        params: { id: ID },
        run: async () => {
          await das.getAsset({ id: ID }).send();
        },
      },
      {
        method: "getAssetBatch",
        params: { ids: [ID] },
        run: async () => {
          await das.getAssetBatch({ ids: [ID] }).send();
        },
      },
      {
        method: "getAssetProof",
        params: { id: ID },
        run: async () => {
          await das.getAssetProof({ id: ID }).send();
        },
      },
      {
        method: "getAssetProofBatch",
        params: { ids: [ID] },
        run: async () => {
          await das.getAssetProofBatch({ ids: [ID] }).send();
        },
      },
      {
        method: "getAssetsByOwner",
        params: { ownerAddress: OWNER, page: 1 },
        run: async () => {
          await das.getAssetsByOwner({ ownerAddress: OWNER, page: 1 }).send();
        },
      },
      {
        method: "getAssetsByAuthority",
        params: { authorityAddress: AUTHORITY },
        run: async () => {
          await das
            .getAssetsByAuthority({ authorityAddress: AUTHORITY })
            .send();
        },
      },
      {
        method: "getAssetsByCreator",
        params: { creatorAddress: CREATOR, onlyVerified: true },
        run: async () => {
          await das
            .getAssetsByCreator({ creatorAddress: CREATOR, onlyVerified: true })
            .send();
        },
      },
      {
        method: "getAssetsByGroup",
        params: { groupKey: "collection", groupValue: "col" },
        run: async () => {
          await das
            .getAssetsByGroup({ groupKey: "collection", groupValue: "col" })
            .send();
        },
      },
      {
        method: "searchAssets",
        params: { ownerAddress: OWNER, tokenType: "fungible" },
        run: async () => {
          await das
            .searchAssets({ ownerAddress: OWNER, tokenType: "fungible" })
            .send();
        },
      },
      {
        method: "getSignaturesForAsset",
        params: { id: ID, page: 1 },
        run: async () => {
          await das.getSignaturesForAsset({ id: ID, page: 1 }).send();
        },
      },
      {
        method: "getTokenAccounts",
        params: { owner: OWNER, options: { showZeroBalance: true } },
        run: async () => {
          await das
            .getTokenAccounts({
              owner: OWNER,
              options: { showZeroBalance: true },
            })
            .send();
        },
      },
      {
        method: "getNftEditions",
        params: { mint: ID, limit: 10 },
        run: async () => {
          await das.getNftEditions({ mint: ID, limit: 10 }).send();
        },
      },
    ];

    for (const call of calls) {
      await call.run();
    }

    calls.forEach((call, index) => {
      const payload = payloads[index];
      expect(payload?.method).toBe(call.method);
      expect(payload?.params).toEqual(call.params);
    });
  });

  it("throws a DasApiError when the endpoint returns an error", async () => {
    const { transport } = makeMockTransport((payload) => ({
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32000, message: "Asset not found", data: { id: "x" } },
    }));
    const das = createDasRpcFromTransport(transport);

    let caught: DasApiError | undefined;
    try {
      await das.getAsset({ id: ID }).send();
    } catch (error) {
      caught = error as DasApiError;
    }

    expect(caught).toBeInstanceOf(DasApiError);
    expect(caught?.code).toBe(-32000);
    expect(caught?.message).toBe("Asset not found");
  });

  it("supports the tree/leafIndex variant of getSignaturesForAsset", async () => {
    const { transport, payloads } = makeEchoTransport();
    const das = createDasRpcFromTransport(transport);

    await das
      .getSignaturesForAsset({ tree: AUTHORITY, leafIndex: 3, limit: 5 })
      .send();

    expect(payloads[0]?.params).toEqual({
      tree: AUTHORITY,
      leafIndex: 3,
      limit: 5,
    });
  });
});

describe("createDasRpc", () => {
  const assertClient = (das: DasRpc): void => {
    expect(typeof das.getAsset).toBe("function");
    const pending = das.getAsset({ id: ID });
    expect(typeof pending.send).toBe("function");
  };

  it("creates a client from a URL string", () => {
    assertClient(createDasRpc("https://example.com/das"));
  });

  it("creates a client from a URL with extra transport config", () => {
    assertClient(
      createDasRpc("https://example.com/das", {
        headers: { "x-api-key": "test" },
      }),
    );
  });
});
