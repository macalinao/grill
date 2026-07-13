import type { WalletContextState, WalletProviderProps } from "@macalinao/grill";
import {
  useConnectedWallet,
  useKitWallet,
  WalletContext,
  WalletProvider,
} from "@macalinao/grill";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, CircleX, Wallet } from "lucide-react";
import { useContext } from "react";
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

/** `useKitWallet` — the nullable read. Safe to call whether or not a wallet is connected. */
const KitWalletCard: React.FC = () => {
  const state: WalletContextState = useKitWallet();

  // The context object is exported too. `undefined` outside a WalletProvider.
  const raw = useContext(WalletContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>useKitWallet</CardTitle>
        <CardDescription>
          Returns <code className="font-mono">{"{ signer }"}</code>, where
          signer is <code className="font-mono">null</code> when disconnected.
          Use this when your component has something to render either way.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          {state.signer ? (
            <CircleCheck className="h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <CircleX className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {state.signer ? "Connected" : "Not connected"}
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              signer: {state.signer ? state.signer.address : "null"}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          useContext(WalletContext) is{" "}
          <code className="font-mono">
            {raw === undefined ? "undefined (no provider)" : "the same state ✓"}
          </code>
        </p>

        {!state.signer && <WalletMultiButton />}
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

/** Typed with grill's exported props type. */
const NullSignerScope: React.FC<Omit<WalletProviderProps, "signer">> = ({
  children,
}) => <WalletProvider signer={null}>{children}</WalletProvider>;

/** What `useKitWallet` sees inside the nested provider. */
const NestedReadout: React.FC = () => {
  const { signer } = useKitWallet();
  return (
    <span className="font-mono text-xs">
      signer: {signer ? `${signer.address.slice(0, 12)}…` : "null"}
    </span>
  );
};

/**
 * `WalletProvider` is what supplies the signer. It is normally mounted once,
 * near the root — here a second one is nested to show that `useKitWallet` reads
 * from the nearest provider, not from a global.
 */
const ProviderCard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>WalletProvider</CardTitle>
      <CardDescription>
        The signer comes from context, so it can be scoped or overridden. In
        this app the root provider is fed by{" "}
        <code className="font-mono">@macalinao/wallet-adapter-compat</code>,
        which adapts a wallet-adapter wallet into a kit{" "}
        <code className="font-mono">TransactionSendingSigner</code>.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm text-muted-foreground">
          Root provider (the real wallet)
        </span>
        <NestedReadout />
      </div>

      <NullSignerScope>
        <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
          <span className="text-sm text-muted-foreground">
            Nested &lt;WalletProvider signer=&#123;null&#125;&gt;
          </span>
          <NestedReadout />
        </div>
      </NullSignerScope>
    </CardContent>
  </Card>
);

function WalletPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Wallet access"
        exports={[
          "useKitWallet",
          "useConnectedWallet",
          "WalletProvider",
          "WalletContext",
          "WalletContextState",
          "WalletProviderProps",
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
              <code className="font-mono">useKitWallet</code> for anything that
              renders in both states — a header, a balance, a connect button.{" "}
              <code className="font-mono">useConnectedWallet</code> for the code
              behind the gate, so you are not threading{" "}
              <code className="font-mono">signer!</code> through every function
              that builds an instruction.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <KitWalletCard />
          <ConnectedWalletCard />
        </div>

        <ProviderCard />

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { useConnectedWallet, useKitWallet } from "@macalinao/grill";

function Page() {
  const { signer } = useKitWallet();
  if (!signer) {
    return <ConnectButton />;
  }
  return <Transfer />; // everything below here has a wallet
}

function Transfer() {
  const signer = useConnectedWallet(); // TransactionSendingSigner, never null
  const ix = getTransferSolInstruction({ source: signer, ... });
}`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
