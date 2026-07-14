import {
  useMplTokenMetadataAccount,
  useMplTokenMetadataAccounts,
  useTokenMetadataAccount,
  useTokenMetadataAccounts,
  useTokenMetadataPda,
  useTokenMetadataPdas,
} from "@macalinao/grill";
import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/examples/code-block";
import { ExampleHeader } from "@/components/examples/example-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_MINTS, DEMO_TOKENS } from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/token-metadata")({
  component: TokenMetadataPage,
});

/** Metaplex pads its fixed-size strings with NUL bytes. */
const NUL = "\u0000";
const trim = (value: string): string => {
  let end = value.length;
  while (end > 0 && value[end - 1] === NUL) {
    end -= 1;
  }
  return value.slice(0, end);
};

/**
 * `useTokenMetadataAccount` takes a *mint* and does the PDA derivation for you.
 * `useMplTokenMetadataAccount` takes the *metadata PDA* directly — useful when
 * you already have the address in hand.
 */
const SingularCard: React.FC = () => {
  const mint = DEMO_TOKENS[0]?.mint;

  // Path A: mint in, metadata out.
  const byMint = useTokenMetadataAccount({ mint });

  // Path B: derive the PDA yourself, then read the account at that address.
  const pda = useTokenMetadataPda(mint ? { mint } : null);
  const byPda = useMplTokenMetadataAccount({ address: pda });

  const metadata = byMint.data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>One mint, two ways</CardTitle>
        <CardDescription>
          Both hooks land on the same account. The address they resolve to is
          shown below — they match, and they share a single cache entry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {byMint.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : metadata ? (
          <div className="space-y-1 rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{trim(metadata.data.name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-medium">{trim(metadata.data.symbol)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">URI</span>
              <span className="truncate font-mono text-xs">
                {trim(metadata.data.uri) || "(none)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mutable</span>
              <span className="font-mono">
                {metadata.isMutable ? "yes" : "no"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No metadata account for this mint.
          </p>
        )}

        <div className="space-y-1 rounded-lg border bg-muted/50 p-3 text-xs">
          <div className="flex justify-between gap-2">
            <span className="shrink-0 text-muted-foreground">
              useTokenMetadataAccount resolved
            </span>
            <span className="truncate font-mono">{byMint.address ?? "…"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="shrink-0 text-muted-foreground">
              useMplTokenMetadataAccount resolved
            </span>
            <span className="truncate font-mono">{byPda.address ?? "…"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/** The plural forms, `useTokenMetadataAccounts` and `useMplTokenMetadataAccounts`. */
const PluralCard: React.FC = () => {
  // Mints in — derives every PDA, then batches every read.
  const byMints = useTokenMetadataAccounts({ mints: DEMO_MINTS });

  // PDAs in — same batching, but you supply the addresses.
  const pdas = useTokenMetadataPdas(DEMO_MINTS.map((mint) => ({ mint })));
  const byPdas = useMplTokenMetadataAccounts({ addresses: pdas ?? [] });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Many mints, one batch</CardTitle>
        <CardDescription>
          <code className="font-mono">useTokenMetadataAccounts</code> derives{" "}
          {DEMO_MINTS.length} PDAs and reads them all in a single RPC call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {byMints.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="rounded-lg border p-3">
            {byMints.data.map((account, i) => (
              <div
                key={DEMO_TOKENS[i]?.mint ?? i}
                className="flex items-center justify-between gap-4 border-b py-2 text-sm last:border-b-0"
              >
                <span className="font-medium">{DEMO_TOKENS[i]?.symbol}</span>
                <span className="truncate text-muted-foreground">
                  {account
                    ? `${trim(account.data.data.name)} (${trim(account.data.data.symbol)})`
                    : "no metadata account"}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          <code className="font-mono">useMplTokenMetadataAccounts</code> loaded
          the same {byPdas.isLoading ? "…" : byPdas.data.length} accounts from
          the pre-derived PDAs, hitting the cache rather than the network.
        </p>
      </CardContent>
    </Card>
  );
};

function TokenMetadataPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Token metadata accounts"
        exports={[
          "useTokenMetadataAccount",
          "useTokenMetadataAccounts",
          "useMplTokenMetadataAccount",
          "useMplTokenMetadataAccounts",
        ]}
      >
        Raw Metaplex metadata, decoded. The{" "}
        <code className="font-mono">useTokenMetadata*</code> hooks take a mint
        and derive the PDA for you; the{" "}
        <code className="font-mono">useMplTokenMetadata*</code> hooks take the
        metadata address directly. For a friendlier, merged view of a token
        (metadata plus mint plus the certified token list), see{" "}
        <code className="font-mono">useTokenInfo</code>.
      </ExampleHeader>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SingularCard />
          <PluralCard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import {
  useTokenMetadataAccount,
  useMplTokenMetadataAccount,
} from "@macalinao/grill";

// Give it a mint — the metadata PDA is derived internally.
const { data } = useTokenMetadataAccount({ mint });
data?.data.data.name; // "USD Coin"

// Or give it the metadata address, if you already have one.
const { data: same } = useMplTokenMetadataAccount({ address: metadataPda });`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
