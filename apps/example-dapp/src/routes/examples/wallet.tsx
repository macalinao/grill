import type { ClientWithReactiveSigner } from "@macalinao/grill";
import {
  reactiveSigner,
  useConnectedWallet,
  useWalletSigner,
} from "@macalinao/grill";
import { createClient } from "@solana/kit";
import {
  ClientProvider,
  useClient,
  useIdentity,
  usePayer,
} from "@solana/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, CircleX, Wallet } from "lucide-react";
import { CodeBlock } from "@/components/examples/code-block";
import { ErrorBoundary } from "@/components/examples/error-boundary";
import { ExampleHeader } from "@/components/examples/example-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/examples/wallet")({
  component: WalletPage,
});

/** `useWalletSigner` — the nullable read. Safe to call whether or not a wallet is connected. */
const WalletSignerCard: React.FC = () => {
  const signer = useWalletSigner();

  // The signer lives on the kit client, so @solana/react's own hooks see it
  // too. The app installs `reactiveSigner()`, which sets payer and identity.
  const client = useClient<ClientWithReactiveSigner>();
  const payer = usePayer(client);
  const identity = useIdentity(client);

  return (
    <Card>
      <CardHeader>
        <CardTitle>useWalletSigner</CardTitle>
        <CardDescription>
          Returns the kit client&apos;s <code className="font-mono">payer</code>
          , or <code className="font-mono">null</code> when disconnected. Use
          this when your component has something to render either way.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          {signer ? (
            <CircleCheck className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <CircleX className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {signer ? "Connected" : "Not connected"}
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              signer: {signer ? signer.address : "null"}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          usePayer(client) / useIdentity(client) from @solana/react:{" "}
          <code className="font-mono">
            {(payer ?? null) === signer && (identity ?? null) === signer
              ? "the same signer ✓"
              : "differ"}
          </code>
        </p>

        {!signer && <WalletMultiButton />}
      </CardContent>
    </Card>
  );
};

/** The body of the `useConnectedWallet` card — throws when no wallet is connected. */
const ConnectedWalletReadout: React.FC = () => {
  const signer = useConnectedWallet();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
      <CircleCheck className="h-5 w-5 shrink-0 text-green-600" />
      <div className="min-w-0">
        <div className="text-sm font-medium">Signer available</div>
        <div className="truncate font-mono text-xs text-muted-foreground">
          {signer.address}
        </div>
      </div>
    </div>
  );
};

/**
 * `useConnectedWallet` — the non-nullable read. It *throws* when disconnected,
 * so the signer is simply always there. Below it is wrapped in an error boundary
 * so you can see the throw rather than take our word for it.
 */
const ConnectedWalletCard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>useConnectedWallet</CardTitle>
      <CardDescription>
        Returns a non-nullable{" "}
        <code className="font-mono">TransactionSendingSigner</code> and throws
        if there isn’t one. Reach for it below a connect-wallet gate, where a
        missing wallet is a bug rather than a state to render.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ErrorBoundary
        fallback={(error) => (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 p-3">
            <CircleX className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <div className="text-sm font-medium text-destructive">
                Threw during render
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {error.message}
              </div>
            </div>
          </div>
        )}
      >
        <ConnectedWalletReadout />
      </ErrorBoundary>
    </CardContent>
  </Card>
);

/**
 * A second kit client with its own, empty `reactiveSigner()`. Hooks read the
 * signer from the nearest `ClientProvider`, so under it no wallet is connected.
 */
const signerlessClient = createClient().use(reactiveSigner());

/** What `useWalletSigner` sees inside a given `ClientProvider`. */
const NestedReadout: React.FC = () => {
  const signer = useWalletSigner();
  return (
    <span className="font-mono text-xs">
      signer: {signer ? `${signer.address.slice(0, 12)}…` : "null"}
    </span>
  );
};

/**
 * `reactiveSigner()` is the kit plugin that holds the signer. It is installed
 * once on the app's client — here a second client is nested to show that
 * `useWalletSigner` reads from the nearest `ClientProvider`, not from a global.
 */
const ClientSignerCard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>reactiveSigner</CardTitle>
      <CardDescription>
        The signer is the kit client&apos;s{" "}
        <code className="font-mono">payer</code> and{" "}
        <code className="font-mono">identity</code>. In this app it is set by{" "}
        <code className="font-mono">WalletAdapterCompatProvider</code> from{" "}
        <code className="font-mono">@macalinao/wallet-adapter-compat</code>,
        which adapts a wallet-adapter wallet into a kit{" "}
        <code className="font-mono">TransactionSendingSigner</code> and calls{" "}
        <code className="font-mono">client.setSigner(...)</code> as it connects
        and disconnects.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm text-muted-foreground">
          App client (the real wallet)
        </span>
        <NestedReadout />
      </div>

      <ClientProvider client={signerlessClient}>
        <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
          <span className="text-sm text-muted-foreground">
            Nested &lt;ClientProvider&gt; with an empty reactiveSigner()
          </span>
          <NestedReadout />
        </div>
      </ClientProvider>
    </CardContent>
  </Card>
);

function WalletPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Wallet access"
        exports={[
          "useWalletSigner",
          "useConnectedWallet",
          "reactiveSigner",
          "ClientWithReactiveSigner",
        ]}
      >
        Two hooks read the wallet, and the difference is what they do when there
        isn’t one. Connect and disconnect a wallet to watch every card below
        react.
      </ExampleHeader>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Which one do I want?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <code className="font-mono">useWalletSigner</code> for anything
              that renders in both states — a header, a balance, a connect
              button. <code className="font-mono">useConnectedWallet</code> for
              the code behind the gate, so you are not threading{" "}
              <code className="font-mono">signer!</code> through every function
              that builds an instruction.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <WalletSignerCard />
          <ConnectedWalletCard />
        </div>

        <ClientSignerCard />

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { reactiveSigner, useConnectedWallet, useWalletSigner } from "@macalinao/grill";

// Once, where the client is built:
const client = createClient()
  .use(solanaRpcConnection({ rpcUrl }))
  .use(reactiveSigner());

function Page() {
  const signer = useWalletSigner();
  if (!signer) {
    return <ConnectButton />;
  }
  return <Transfer />; // everything below here has a wallet
}

function Transfer() {
  const signer = useConnectedWallet(); // GrillSigner, never null
  const ix = getTransferSolInstruction({ source: signer, ... });
}`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
