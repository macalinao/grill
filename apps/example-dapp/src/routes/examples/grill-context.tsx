import type {
  AccountQueryKey,
  GrillContextValue,
  PdaQueryKey,
  TokenInfoQueryKey,
} from "@macalinao/grill";
import {
  createAccountQueryKey,
  createPdaQueryKey,
  createTokenInfoQueryKey,
  GRILL_REACT_QUERY_NAMESPACE,
  GrillContext,
  refetchAccounts,
  useAccount,
  useGrillContext,
} from "@macalinao/grill";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, RefreshCw } from "lucide-react";
import { useContext, useState } from "react";
import { CodeBlock } from "@/components/examples/code-block";
import { ExampleHeader } from "@/components/examples/example-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_MINTS, DEMO_TOKENS } from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/grill-context")({
  component: GrillContextPage,
});

const SAMPLE_SIGNATURE =
  "5wHu1qwD4kLpe6JuNTLnZ1yBuvUFXBqjHNzUvsZzJTLGmqAkeAcyBmzhbz5xNYFCJmY9tPCPGrHfg7yqDpVzhVcH";

/**
 * `useGrillContext` exposes everything `GrillProvider` was configured with.
 * `GrillContext` itself is exported too, for the rare case you want to read it
 * with `useContext` (it is `null` outside a provider, rather than throwing).
 */
const ContextCard: React.FC = () => {
  const context: GrillContextValue = useGrillContext();

  // The raw context, read directly. Same object — this just shows it is exported.
  const raw = useContext(GrillContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>useGrillContext</CardTitle>
        <CardDescription>
          The provider’s configuration, available anywhere in the tree.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {[
          {
            label: "accountLoader",
            value: "DataLoader (batches up to 99 accounts/call)",
          },
          {
            label: "staticTokenInfo",
            value: `${context.staticTokenInfo.size.toString()} preloaded token(s)`,
          },
          {
            label: "fetchFromCertifiedTokenList",
            value: String(context.fetchFromCertifiedTokenList),
          },
          {
            label: "getExplorerLink",
            value: context.getExplorerLink({ transaction: SAMPLE_SIGNATURE }),
          },
          {
            label: "useContext(GrillContext)",
            value: raw === context ? "same object ✓" : "different",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b py-1.5 last:border-b-0"
          >
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {label}
            </span>
            <span className="truncate text-right text-xs">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

/**
 * Query keys are constructed, not stringly-typed. Building the same key lets you
 * read or write grill's cache entries with plain react-query APIs.
 */
const QueryKeysCard: React.FC = () => {
  const queryClient = useQueryClient();
  const mint = DEMO_TOKENS[0]?.mint;

  // Warm the cache so there is something to inspect.
  useAccount({ address: mint });

  const accountKey: AccountQueryKey | null = mint
    ? createAccountQueryKey(mint)
    : null;
  const tokenInfoKey: TokenInfoQueryKey = createTokenInfoQueryKey(mint);
  const pdaKey: PdaQueryKey<{ mint: typeof mint }> = createPdaQueryKey(
    "associatedTokenPda",
    { mint },
  );

  const accountState = accountKey
    ? queryClient.getQueryState(accountKey)
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query keys</CardTitle>
        <CardDescription>
          Every grill cache entry lives under the{" "}
          <code className="font-mono">“{GRILL_REACT_QUERY_NAMESPACE}”</code>{" "}
          namespace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { label: "createAccountQueryKey", key: accountKey },
          { label: "createTokenInfoQueryKey", key: tokenInfoKey },
          { label: "createPdaQueryKey", key: pdaKey },
        ].map(({ label, key }) => (
          <div key={label}>
            <div className="text-xs font-medium text-muted-foreground">
              {label}
            </div>
            <div className="mt-0.5 overflow-x-auto rounded border bg-muted/50 p-2 font-mono text-xs">
              {JSON.stringify(key)}
            </div>
          </div>
        ))}

        <div className="rounded-lg border p-3 text-sm">
          <div className="text-xs font-medium text-muted-foreground">
            Live cache state for the account key
          </div>
          <div className="mt-1 font-mono text-xs">
            status: {accountState?.status ?? "—"} · updated:{" "}
            {accountState?.dataUpdatedAt
              ? new Date(accountState.dataUpdatedAt).toLocaleTimeString()
              : "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * `refetchAccounts` clears the DataLoader's memo *and* refetches the react-query
 * entries. Invalidating react-query alone is not enough: the loader would just
 * serve its cached value straight back.
 */
const RefetchCard: React.FC = () => {
  const { accountLoader, refetchAccounts: refetchFromContext } =
    useGrillContext();
  const queryClient = useQueryClient();
  const [lastRefetch, setLastRefetch] = useState<string | null>(null);

  const mint = DEMO_TOKENS[0]?.mint;
  const { data, dataUpdatedAt } = useAccount({ address: mint });

  const viaUtil = async () => {
    await refetchAccounts({
      queryClient,
      accountLoader,
      addresses: DEMO_MINTS,
    });
    setLastRefetch(`refetchAccounts() · ${new Date().toLocaleTimeString()}`);
  };

  const viaContext = async () => {
    await refetchFromContext(DEMO_MINTS);
    setLastRefetch(
      `context.refetchAccounts() · ${new Date().toLocaleTimeString()}`,
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual refetch</CardTitle>
        <CardDescription>
          Two ways to force {DEMO_MINTS.length} accounts to be re-read from
          chain. Watch the timestamp move.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              void viaUtil();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            refetchAccounts(&#123;...&#125;)
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void viaContext();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            useGrillContext().refetchAccounts()
          </Button>
        </div>

        <div className="space-y-1 rounded-lg border p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {DEMO_TOKENS[0]?.symbol} account lamports
            </span>
            <span className="font-mono">
              {data ? data.lamports.toString() : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cache written at</span>
            <span className="font-mono">
              {dataUpdatedAt
                ? new Date(dataUpdatedAt).toLocaleTimeString()
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last action</span>
            <span className="font-mono text-xs">{lastRefetch ?? "none"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function GrillContextPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Context, query keys, and cache control"
        exports={[
          "useGrillContext",
          "GrillContext",
          "GrillContextValue",
          "refetchAccounts",
          "createAccountQueryKey",
          "createTokenInfoQueryKey",
          "createPdaQueryKey",
          "GRILL_REACT_QUERY_NAMESPACE",
          "AccountQueryKey",
          "TokenInfoQueryKey",
          "PdaQueryKey",
        ]}
      >
        Grill is a thin layer over react-query, and it does not hide the seams.
        The context, the cache keys, and the loader are all yours to read and
        invalidate.
      </ExampleHeader>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">
                Why refetching needs two steps
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              An account read passes through two caches: react-query’s, and the
              DataLoader’s per-address memo.{" "}
              <code className="font-mono">refetchAccounts</code> clears the
              loader before refetching the queries, so the second read actually
              reaches the network. Calling{" "}
              <code className="font-mono">queryClient.invalidateQueries</code>{" "}
              on its own would hand you the stale value back.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <ContextCard />
          <QueryKeysCard />
        </div>

        <RefetchCard />

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { refetchAccounts, useGrillContext } from "@macalinao/grill";

// The bound version, if you are already inside a component.
const { refetchAccounts } = useGrillContext();
await refetchAccounts([mintA, mintB]);

// The standalone util, if you have a queryClient and loader in hand
// (e.g. after a transaction lands, outside of React).
await refetchAccounts({ queryClient, accountLoader, addresses });`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
