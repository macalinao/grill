import type {
  GrillHeadlessProviderProps,
  GrillProviderProps,
  TransactionId,
  TransactionStatusEvent,
  TransactionStatusEventCallback,
} from "@macalinao/grill";
import {
  GrillHeadlessProvider,
  getSolscanExplorerLink,
  useConnectedWallet,
  useSendTX,
} from "@macalinao/grill";
import { getTransferSolInstruction } from "@solana-program/system";
import { lamports } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { BellOff, Send } from "lucide-react";
import { useCallback, useState } from "react";
import { CodeBlock } from "@/components/examples/code-block";
import { ConnectWalletGate } from "@/components/examples/connect-wallet-gate";
import { ExampleHeader } from "@/components/examples/example-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/examples/headless-provider")({
  component: HeadlessProviderPage,
});

/** Every arm of the `TransactionStatusEvent` union, with what it means. */
const EVENT_TYPES: { type: TransactionStatusEvent["type"]; when: string }[] = [
  { type: "preparing", when: "Building and simulating the transaction" },
  { type: "awaiting-wallet-signature", when: "Waiting on the user's wallet" },
  {
    type: "waiting-for-confirmation",
    when: "Submitted; awaiting confirmation",
  },
  { type: "confirmed", when: "Landed successfully" },
  { type: "error-wallet-not-connected", when: "No signer available" },
  { type: "error-simulation-failed", when: "Simulation rejected it" },
  { type: "error-transaction-send-failed", when: "The RPC refused it" },
  { type: "error-transaction-failed", when: "It landed, but reverted" },
];

const isErrorEvent = (event: TransactionStatusEvent): boolean =>
  event.type.startsWith("error-");

/** Sends a zero-lamport self-transfer purely to produce a real event stream. */
const SendButton: React.FC = () => {
  const signer = useConnectedWallet();
  const sendTX = useSendTX();
  const [busy, setBusy] = useState(false);

  const send = useCallback(async () => {
    setBusy(true);
    try {
      await sendTX("Headless provider demo", [
        getTransferSolInstruction({
          source: signer,
          destination: signer.address,
          amount: lamports(0n),
        }),
      ]);
    } finally {
      setBusy(false);
    }
  }, [sendTX, signer]);

  return (
    <div className="space-y-2">
      <Button
        disabled={busy}
        onClick={() => {
          void send();
        }}
      >
        <Send className="mr-2 h-4 w-4" />
        {busy ? "Sending…" : "Send a 0 SOL self-transfer"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Transfers 0 SOL to yourself, so the only cost is the network fee (~5000
        lamports). Your wallet will ask you to sign.
      </p>
    </div>
  );
};

const EventLog: React.FC<{ events: TransactionStatusEvent[] }> = ({
  events,
}) => {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No events yet. Send a transaction to populate the log.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div
          key={`${event.id}-${event.type}-${String(i)}`}
          className={`rounded-lg border p-3 ${
            isErrorEvent(event) ? "border-destructive/50" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <code className="font-mono text-sm font-medium">{event.type}</code>
            <span className="font-mono text-xs text-muted-foreground">
              id {event.id.slice(0, 8)}…
            </span>
          </div>
          <div className="mt-1 text-sm">{event.title}</div>
          {"errorMessage" in event && (
            <div className="mt-1 font-mono text-xs text-destructive">
              {event.errorMessage}
            </div>
          )}
          {"explorerLink" in event && (
            <a
              href={event.explorerLink}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-mono text-xs underline"
            >
              View on explorer
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * The nested provider. `GrillHeadlessProvider` is the whole of grill minus the
 * toasts: it hands every transaction status event to your callback and renders
 * nothing itself. `GrillProvider` is this plus a sonner subscriber.
 */
const HeadlessScope: React.FC = () => {
  const [events, setEvents] = useState<TransactionStatusEvent[]>([]);
  const [ids, setIds] = useState<Set<TransactionId>>(new Set());

  const onTransactionStatusEvent: TransactionStatusEventCallback = useCallback(
    (event) => {
      setEvents((prev) => [...prev, event]);
      setIds((prev) => new Set(prev).add(event.id));
    },
    [],
  );

  // Typed with grill's own props type.
  const providerProps: Omit<GrillHeadlessProviderProps, "children"> = {
    onTransactionStatusEvent,
    getExplorerLink: getSolscanExplorerLink,
  };

  return (
    <GrillHeadlessProvider {...providerProps}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            <CardTitle>Live event stream (no toasts)</CardTitle>
          </div>
          <CardDescription>
            This card is wrapped in its own{" "}
            <code className="font-mono">GrillHeadlessProvider</code>, so{" "}
            <code className="font-mono">useSendTX</code> below reports into the
            log instead of the toaster. {events.length} event(s) across{" "}
            {ids.size} transaction(s).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConnectWalletGate reason="sign a transaction">
            <SendButton />
          </ConnectWalletGate>

          <EventLog events={events} />

          {events.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEvents([]);
                setIds(new Set());
              }}
            >
              Clear log
            </Button>
          )}
        </CardContent>
      </Card>
    </GrillHeadlessProvider>
  );
};

/** The toast knobs `GrillProvider` adds on top of the headless provider. */
const TOAST_DEFAULTS: Required<
  Pick<
    GrillProviderProps,
    "showToasts" | "successToastDuration" | "errorToastDuration"
  >
> = {
  showToasts: true,
  successToastDuration: 5000,
  errorToastDuration: 7000,
};

function HeadlessProviderPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Headless provider and transaction events"
        exports={[
          "GrillHeadlessProvider",
          "GrillHeadlessProviderProps",
          "GrillProviderProps",
          "TransactionStatusEvent",
          "TransactionStatusEventCallback",
          "TransactionId",
          "useSendTX",
        ]}
      >
        <code className="font-mono">GrillProvider</code> renders sonner toasts
        for you. <code className="font-mono">GrillHeadlessProvider</code> is the
        same thing with the toasts taken out — it hands you the raw event stream
        and lets you build your own transaction UI.
      </ExampleHeader>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <HeadlessScope />

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>TransactionStatusEvent</CardTitle>
                <CardDescription>
                  A discriminated union. Every event carries a{" "}
                  <code className="font-mono">title</code> and a{" "}
                  <code className="font-mono">TransactionId</code>, so you can
                  group a transaction’s events together — that is exactly how{" "}
                  <code className="font-mono">GrillProvider</code> keeps one
                  toast per transaction and mutates it in place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {EVENT_TYPES.map(({ type, when }) => (
                    <div
                      key={type}
                      className="flex flex-col gap-0.5 border-b py-2 last:border-b-0 sm:flex-row sm:justify-between sm:gap-4"
                    >
                      <code
                        className={`font-mono text-xs ${
                          type.startsWith("error-") ? "text-destructive" : ""
                        }`}
                      >
                        {type}
                      </code>
                      <span className="text-xs text-muted-foreground sm:text-right">
                        {when}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GrillProvider’s toast options</CardTitle>
                <CardDescription>
                  If you want toasts but not <em>these</em> toasts, pass{" "}
                  <code className="font-mono">showToasts: false</code> and your
                  own{" "}
                  <code className="font-mono">onTransactionStatusEvent</code>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {Object.entries(TOAST_DEFAULTS).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b py-1.5 last:border-b-0"
                    >
                      <code className="font-mono text-xs">{key}</code>
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { GrillHeadlessProvider } from "@macalinao/grill";
import type { TransactionStatusEventCallback } from "@macalinao/grill";

const onTransactionStatusEvent: TransactionStatusEventCallback = (event) => {
  switch (event.type) {
    case "confirmed":
      myUi.success(event.title, event.explorerLink);
      break;
    case "error-simulation-failed":
      myUi.error(event.errorMessage);
      break;
    // ...
  }
};

<GrillHeadlessProvider onTransactionStatusEvent={onTransactionStatusEvent}>
  <App />
</GrillHeadlessProvider>;`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
