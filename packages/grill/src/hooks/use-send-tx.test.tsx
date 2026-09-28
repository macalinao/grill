import type { SendTXFunction, SolanaClient } from "@macalinao/gill-extra";
import type { FC } from "react";
import type { TransactionStatusEvent } from "../types.js";
import { describe, expect, it } from "bun:test";
import { address } from "@solana/kit";
import { QueryClient } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { GrillHeadlessProvider } from "../providers/grill-headless-provider.js";
import { SolanaProvider } from "../providers/solana-provider.js";
import { WalletProvider } from "../providers/wallet-provider.js";
import { useSendTX } from "./use-send-tx.js";

const MEMO_PROGRAM = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

interface CaptureProps {
  onRender: (sendTX: SendTXFunction) => void;
}

/** Hands whatever `useSendTX` returned to the test. */
const Capture: FC<CaptureProps> = ({ onRender }) => {
  onRender(useSendTX());
  return null;
};

/** Renders `useSendTX` under `GrillHeadlessProvider` and returns what it gave. */
function renderUseSendTX(
  onTransactionStatusEvent: (event: TransactionStatusEvent) => void,
): SendTXFunction {
  // Nothing here touches the network: the tests below only exercise paths
  // that finish before any RPC call is made.
  const client = { rpc: {}, rpcSubscriptions: {} } as unknown as SolanaClient;
  const captured: { sendTX?: SendTXFunction } = {};

  renderToString(
    <SolanaProvider client={client} queryClient={new QueryClient()}>
      <WalletProvider signer={null}>
        <GrillHeadlessProvider
          onTransactionStatusEvent={onTransactionStatusEvent}
          logLevel="off"
        >
          <Capture
            onRender={(sendTX) => {
              captured.sendTX = sendTX;
            }}
          />
        </GrillHeadlessProvider>
      </WalletProvider>
    </SolanaProvider>,
  );

  if (!captured.sendTX) {
    throw new Error("useSendTX did not render");
  }
  return captured.sendTX;
}

describe("useSendTX", () => {
  it("builds a send function under GrillHeadlessProvider", () => {
    const sendTX = renderUseSendTX(() => {});
    expect(typeof sendTX).toBe("function");
  });

  it("reports through the provider's onTransactionStatusEvent", async () => {
    const events: TransactionStatusEvent[] = [];
    const sendTX = renderUseSendTX((event) => {
      events.push(event);
    });

    const error = await sendTX("No wallet", [
      { programAddress: MEMO_PROGRAM, accounts: [], data: new Uint8Array() },
    ]).then(
      () => null,
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(Error);
    expect(events.map((e) => e.type)).toEqual(["error-wallet-not-connected"]);
    expect(events[0]?.title).toBe("No wallet");
  });
});
