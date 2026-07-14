import {
  TOKEN_PROGRAM_ADDRESS,
  useAssociatedTokenPda,
  useAssociatedTokenPdas,
  useKitWallet,
  useTokenMetadataPda,
  useTokenMetadataPdas,
} from "@macalinao/grill";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
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
import { DEMO_MINTS, DEMO_OWNER, DEMO_TOKENS } from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/pdas")({
  component: PdasPage,
});

const PdaRow: React.FC<{ label: string; pda: string | null | undefined }> = ({
  label,
  pda,
}) => (
  <div className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
    <span className="shrink-0 text-sm font-medium">{label}</span>
    {pda ? (
      <span className="truncate font-mono text-xs text-muted-foreground">
        {pda}
      </span>
    ) : (
      <Skeleton className="h-4 w-56" />
    )}
  </div>
);

function PdasPage() {
  const { signer } = useKitWallet();

  // Falls back to a well-known wallet so the page shows real derivations even
  // when nothing is connected.
  const owner = signer?.address ?? DEMO_OWNER;
  const isConnected = signer !== null;

  // Singular: one ATA address.
  const usdcAta = useAssociatedTokenPda(
    DEMO_TOKENS[0]
      ? {
          mint: DEMO_TOKENS[0].mint,
          owner,
          tokenProgram: TOKEN_PROGRAM_ADDRESS,
        }
      : null,
  );

  // Plural: one ATA per mint. Returns null until every derivation resolves.
  const atas = useAssociatedTokenPdas(
    DEMO_TOKENS.map((token) => ({
      mint: token.mint,
      owner,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    })),
  );

  const usdcMetadataPda = useTokenMetadataPda(
    DEMO_TOKENS[0] ? { mint: DEMO_TOKENS[0].mint } : null,
  );

  const metadataPdas = useTokenMetadataPdas(
    DEMO_MINTS.map((mint) => ({ mint })),
  );

  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="PDA hooks"
        exports={[
          "useAssociatedTokenPda",
          "useAssociatedTokenPdas",
          "useTokenMetadataPda",
          "useTokenMetadataPdas",
        ]}
      >
        PDA derivation in <code className="font-mono">@solana/kit</code> is
        async, which is awkward inside a component. Grill’s PDA hooks do the
        derivation in react-query and hand you back a plain synchronous address
        — cached forever, since a PDA never changes.
      </ExampleHeader>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Owner</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm break-all">{owner}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {isConnected
                ? "Derived from your connected wallet."
                : "No wallet connected — deriving against a well-known mainnet wallet instead. Connect a wallet to derive your own."}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Associated token accounts</CardTitle>
              <CardDescription>
                The ATA address for a (mint, owner, token program) triple.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium">
                  useAssociatedTokenPda
                </div>
                <div className="rounded-lg border px-3">
                  <PdaRow label={DEMO_TOKENS[0]?.symbol ?? "—"} pda={usdcAta} />
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium">
                  useAssociatedTokenPdas
                </div>
                <div className="rounded-lg border px-3">
                  {DEMO_TOKENS.map((token, i) => (
                    <PdaRow
                      key={token.mint}
                      label={token.symbol}
                      pda={atas?.[i]}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token metadata</CardTitle>
              <CardDescription>
                The Metaplex metadata PDA for a mint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 text-sm font-medium">
                  useTokenMetadataPda
                </div>
                <div className="rounded-lg border px-3">
                  <PdaRow
                    label={DEMO_TOKENS[0]?.symbol ?? "—"}
                    pda={usdcMetadataPda}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 text-sm font-medium">
                  useTokenMetadataPdas
                </div>
                <div className="rounded-lg border px-3">
                  {DEMO_TOKENS.map((token, i) => (
                    <PdaRow
                      key={token.mint}
                      label={token.symbol}
                      pda={metadataPdas?.[i]}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { useAssociatedTokenPda, useAssociatedTokenPdas } from "@macalinao/grill";

// Pass null to skip derivation (e.g. while the wallet is still connecting).
const ata = useAssociatedTokenPda(
  mint && owner ? { mint, owner, tokenProgram: TOKEN_PROGRAM_ADDRESS } : null,
);

// The plural hook returns null until *every* derivation has resolved, so you
// can feed it straight into useAccounts without juggling partial arrays.
const atas = useAssociatedTokenPdas(
  mints.map((mint) => ({ mint, owner, tokenProgram: TOKEN_PROGRAM_ADDRESS })),
);`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
