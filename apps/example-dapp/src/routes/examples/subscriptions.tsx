import type {
  AccountData,
  AccountDecoder,
  SubscriptionManager,
  SubscriptionProviderProps,
} from "@macalinao/grill";
import type { Address } from "@solana/kit";
import type { ReactNode } from "react";
import { getPoolDecoder } from "@macalinao/clients-meteora-damm-v2";
import {
  createAccountDecoderFromDecoder,
  createSubscriptionManager,
  SubscriptionContext,
  SubscriptionProvider,
  useAccount,
  useAccountSubscription,
  useAccountsSubscription,
  useSolanaClient,
  useSubscriptionManager,
  useTokenAccounts,
} from "@macalinao/grill";
import { getTokenDecoder } from "@solana-program/token";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { SOL_USDC_POOL } from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/subscriptions")({
  component: SubscriptionsPage,
});

const poolDecoder = getPoolDecoder();

/**
 * The subscription hooks hand your decoder an `EncodedAccount`, not a raw byte
 * array, so a plain `Decoder` has to be adapted first. Built once at module
 * scope: `useAccountSubscription` requires a stable reference.
 */
const poolAccountDecoder: AccountDecoder<object> | undefined =
  createAccountDecoderFromDecoder(poolDecoder);

/** The pool's vaults are SPL token accounts, so they need the token decoder. */
const tokenAccountDecoder: AccountDecoder<object> | undefined =
  createAccountDecoderFromDecoder(getTokenDecoder());

/** Polls the manager's (non-reactive) debug counter so it can be rendered. */
const useLiveSubscriptionCount = (
  manager: SubscriptionManager,
  address: Address,
): number => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const tick = () => {
      setCount(manager.getSubscriptionCount(address));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => {
      clearInterval(id);
    };
  }, [manager, address]);

  return count;
};

/**
 * `useAccountSubscription` — subscribe by hand, read with a separate hook.
 *
 * `useAccount({ subscribeToUpdates: true })` is the shorthand for exactly this.
 * Doing it manually is what you want when the component that reads the account
 * is not the component that decides whether to subscribe.
 */
const ManualSubscriptionCard: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const manager = useSubscriptionManager();

  useAccountSubscription(SOL_USDC_POOL, poolAccountDecoder, enabled);

  // A plain read. The subscription above writes into this same cache entry.
  const { data: pool, dataUpdatedAt } = useAccount({
    address: SOL_USDC_POOL,
    decoder: poolDecoder,
  });

  const count = useLiveSubscriptionCount(manager, SOL_USDC_POOL);

  return (
    <Card>
      <CardHeader>
        <CardTitle>useAccountSubscription</CardTitle>
        <CardDescription>
          Subscribing and reading are separate concerns. Toggle the subscription
          and watch the manager’s reference count follow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            variant={enabled ? "default" : "outline"}
            onClick={() => {
              setEnabled((value) => !value);
            }}
          >
            <Radio className="mr-2 h-4 w-4" />
            {enabled ? "Unsubscribe" : "Subscribe"}
          </Button>
          <span className="text-sm text-muted-foreground">
            getSubscriptionCount:{" "}
            <span className="font-mono font-medium text-foreground">
              {count}
            </span>
          </span>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Pool liquidity</div>
          {pool ? (
            <div className="font-mono text-sm break-all">
              {pool.data.liquidity.toString()}
            </div>
          ) : (
            <Skeleton className="h-5 w-full" />
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            Cache last written:{" "}
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString()
              : "never"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * `useAccountsSubscription` — the plural form. The pool's vaults are token
 * accounts, so their balances move on every swap.
 */
const ManualSubscriptionsCard: React.FC = () => {
  const [enabled, setEnabled] = useState(true);

  const { data: pool } = useAccount({
    address: SOL_USDC_POOL,
    decoder: poolDecoder,
  });

  const vaults = useMemo(
    (): Address[] =>
      pool ? [pool.data.tokenAVault, pool.data.tokenBVault] : [],
    [pool],
  );

  // Subscribes to each address through the same de-duplicated manager.
  useAccountsSubscription(vaults, tokenAccountDecoder, enabled);

  const accounts = useTokenAccounts({ addresses: vaults });

  return (
    <Card>
      <CardHeader>
        <CardTitle>useAccountsSubscription</CardTitle>
        <CardDescription>
          One call subscribes to every address in the list, and is stable
          against fresh array references — re-rendering with an equal array does
          not tear the sockets down.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant={enabled ? "default" : "outline"}
          onClick={() => {
            setEnabled((value) => !value);
          }}
        >
          <Radio className="mr-2 h-4 w-4" />
          {enabled ? "Unsubscribe from vaults" : "Subscribe to vaults"}
        </Button>

        {accounts.isLoading || vaults.length === 0 ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="rounded-lg border p-3">
            {accounts.data.map((account, i) => (
              <div
                key={account?.address ?? i}
                className="flex justify-between border-b py-1.5 text-sm last:border-b-0"
              >
                <span className="text-muted-foreground">
                  {i === 0 ? "Vault A" : "Vault B"}
                </span>
                <span className="font-mono">
                  {account ? account.data.amount.toString() : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/** Reads whichever `SubscriptionManager` is nearest in the tree. */
const ScopedManagerReadout: React.FC<{ label: string }> = ({ label }) => {
  const manager = useSubscriptionManager();
  const count = useLiveSubscriptionCount(manager, SOL_USDC_POOL);

  useAccountSubscription(SOL_USDC_POOL, poolAccountDecoder, true);

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">refCount {count}</span>
    </div>
  );
};

/**
 * `createSubscriptionManager` + `SubscriptionContext` — what
 * `SubscriptionProvider` does internally, spelled out.
 *
 * The manager below is a fresh instance, so its reference count is independent
 * of the app-wide one from `GrillProvider`.
 */
const CustomManagerScope: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { rpcSubscriptions } = useSolanaClient();
  const queryClient = useQueryClient();

  const manager = useMemo(
    (): SubscriptionManager =>
      createSubscriptionManager(rpcSubscriptions, queryClient),
    [rpcSubscriptions, queryClient],
  );

  return (
    <SubscriptionContext.Provider value={manager}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/** Typed with grill's own props type. */
const ScopedSubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => <SubscriptionProvider>{children}</SubscriptionProvider>;

const ProvidersCard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Providing your own manager</CardTitle>
      <CardDescription>
        <code className="font-mono">GrillProvider</code> already mounts a
        <code className="font-mono"> SubscriptionProvider</code>, so you rarely
        need these. Both scopes below mount a fresh manager, which is why each
        keeps its own reference count for the same pool.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <ScopedManagerReadout label="App-wide manager (from GrillProvider)" />

      <CustomManagerScope>
        <ScopedManagerReadout label="createSubscriptionManager + SubscriptionContext" />
      </CustomManagerScope>

      <ScopedSubscriptionProvider>
        <ScopedManagerReadout label="Nested <SubscriptionProvider>" />
      </ScopedSubscriptionProvider>
    </CardContent>
  </Card>
);

/**
 * Demonstrates that `AccountData` is the constraint the subscription types are
 * generic over — any `object` or `Uint8Array` payload.
 */
const describeDecoder = <T extends AccountData>(
  decoder: AccountDecoder<T> | undefined,
): string => (decoder ? "decoder attached" : "raw bytes (no decoder)");

function SubscriptionsPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="WebSocket subscriptions"
        exports={[
          "useAccountSubscription",
          "useAccountsSubscription",
          "useSubscriptionManager",
          "createSubscriptionManager",
          "createAccountDecoderFromDecoder",
          "SubscriptionContext",
          "SubscriptionProvider",
          "AccountData",
          "AccountDecoder",
          "SubscriptionManager",
        ]}
      >
        Under <code className="font-mono">subscribeToUpdates</code> sits a
        reference-counted subscription manager: every component asking for the
        same account shares one WebSocket, and the socket closes when the last
        one unmounts. These are the pieces, exposed directly.
      </ExampleHeader>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ManualSubscriptionCard />
          <ManualSubscriptionsCard />
        </div>

        <ProvidersCard />

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Pool decoder status: {describeDecoder(poolAccountDecoder)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import {
  createAccountDecoderFromDecoder,
  useAccount,
  useAccountSubscription,
} from "@macalinao/grill";

// Adapt a byte-array Decoder into an EncodedAccount -> Account decoder, once.
const decoder = createAccountDecoderFromDecoder(poolDecoder);

function Pool() {
  // Subscribe...
  useAccountSubscription(POOL, decoder, true);
  // ...and read. Both touch the same react-query cache entry.
  const { data } = useAccount({ address: POOL, decoder: getPoolDecoder() });
}`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
