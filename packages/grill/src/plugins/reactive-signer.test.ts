import type { Address, TransactionSendingSigner } from "@solana/kit";
import { describe, expect, it } from "bun:test";
import {
  address,
  createClient,
  isSolanaError,
  SOLANA_ERROR__WALLET__NO_SIGNER_CONNECTED,
} from "@solana/kit";
import { reactiveSigner } from "./reactive-signer.js";

function makeSigner(addr: string): TransactionSendingSigner<Address> {
  return {
    address: address(addr),
    signAndSendTransactions: () => Promise.resolve([]),
  };
}

const ALICE = makeSigner("11111111111111111111111111111111");
const BOB = makeSigner("SysvarC1ock11111111111111111111111111111111");

describe("reactiveSigner", () => {
  it("throws NO_SIGNER_CONNECTED while no signer is set", () => {
    const client = createClient().use(reactiveSigner());
    let error: unknown;
    try {
      void client.payer;
    } catch (e: unknown) {
      error = e;
    }
    expect(
      isSolanaError(error, SOLANA_ERROR__WALLET__NO_SIGNER_CONNECTED),
    ).toBe(true);
    expect(() => client.identity).toThrow();
  });

  it("exposes the initial signer as payer and identity", () => {
    const client = createClient().use(reactiveSigner(ALICE));
    expect(client.payer).toBe(ALICE);
    expect(client.identity).toBe(ALICE);
  });

  it("keeps the payer and identity getters non-enumerable", () => {
    const client = createClient().use(reactiveSigner());
    expect(Object.keys(client)).not.toContain("payer");
    expect(Object.keys(client)).not.toContain("identity");
    // Spreading must not trigger the throwing getters.
    expect(() => ({ ...client })).not.toThrow();
  });

  it("updates the signer and notifies subscribers", () => {
    const client = createClient().use(reactiveSigner());
    let payerCalls = 0;
    let identityCalls = 0;
    const unsubPayer = client.subscribeToPayer(() => {
      payerCalls += 1;
    });
    client.subscribeToIdentity(() => {
      identityCalls += 1;
    });

    client.setSigner(ALICE);
    expect(client.payer).toBe(ALICE);
    expect(payerCalls).toBe(1);
    expect(identityCalls).toBe(1);

    // Setting the same signer again is a no-op.
    client.setSigner(ALICE);
    expect(payerCalls).toBe(1);

    unsubPayer();
    client.setSigner(BOB);
    expect(client.identity).toBe(BOB);
    expect(payerCalls).toBe(1);
    expect(identityCalls).toBe(2);

    client.setSigner(null);
    expect(() => client.payer).toThrow();
    expect(identityCalls).toBe(3);
  });

  it("treats the same listener subscribed twice as two subscriptions", () => {
    const client = createClient().use(reactiveSigner());
    let calls = 0;
    const listener = (): void => {
      calls += 1;
    };
    const unsubPayer = client.subscribeToPayer(listener);
    client.subscribeToIdentity(listener);
    unsubPayer();
    client.setSigner(ALICE);
    expect(calls).toBe(1);
  });

  it("preserves the capabilities of earlier plugins", () => {
    const client = createClient({ rpc: "fake-rpc" }).use(reactiveSigner(ALICE));
    expect(client.rpc).toBe("fake-rpc");
    expect(client.payer).toBe(ALICE);
  });
});
