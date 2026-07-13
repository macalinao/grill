import { createFileRoute } from "@tanstack/react-router";
import { Factory } from "lucide-react";
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
import {
  useMasterEditionPda,
  useMasterEditionPdas,
} from "@/hooks/master-edition-pda";
import { useToken2022Mint, useToken2022Mints } from "@/hooks/token-2022";
import { DEMO_MINTS, DEMO_TOKEN_2022_MINTS } from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/hook-factories")({
  component: HookFactoriesPage,
});

/**
 * `createDecodedAccountHook` / `createDecodedAccountsHook`, via the Token-2022
 * hooks built in `src/hooks/token-2022.ts`.
 */
const DecodedAccountFactoryCard: React.FC = () => {
  const pyusd = useToken2022Mint({
    address: DEMO_TOKEN_2022_MINTS[0]?.mint,
  });

  const all = useToken2022Mints({
    addresses: DEMO_TOKEN_2022_MINTS.map((token) => token.mint),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          createDecodedAccountHook / createDecodedAccountsHook
        </CardTitle>
        <CardDescription>
          Hand a factory a decoder and it returns a hook. Here they build{" "}
          <code className="font-mono">useToken2022Mint</code> and{" "}
          <code className="font-mono">useToken2022Mints</code> — Token-2022
          mints carry extension data that grill’s built-in{" "}
          <code className="font-mono">useMintAccount</code> (legacy decoder)
          cannot read.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeBlock>{`// src/hooks/token-2022.ts
import { createDecodedAccountHook } from "@macalinao/grill";
import { getMintDecoder } from "@solana-program/token-2022";

export const useToken2022Mint = createDecodedAccountHook(getMintDecoder());`}</CodeBlock>

        <div>
          <div className="mb-1 text-sm font-medium">
            useToken2022Mint (PYUSD)
          </div>
          {pyusd.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : pyusd.data ? (
            <div className="space-y-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decimals</span>
                <span className="font-mono">{pyusd.data.data.decimals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supply (raw)</span>
                <span className="font-mono">
                  {pyusd.data.data.supply.toString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account size</span>
                <span className="font-mono">
                  {pyusd.data.space.toString()} bytes
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not found</p>
          )}
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            useToken2022Mints ({DEMO_TOKEN_2022_MINTS.length} mints, batched)
          </div>
          {all.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="rounded-lg border p-3">
              {all.data.map((account, i) => (
                <div
                  key={DEMO_TOKEN_2022_MINTS[i]?.symbol ?? i}
                  className="flex justify-between border-b py-1.5 text-sm last:border-b-0"
                >
                  <span className="font-medium">
                    {DEMO_TOKEN_2022_MINTS[i]?.symbol}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {account
                      ? `${account.data.decimals.toString()} decimals · ${account.space.toString()} bytes`
                      : "not found"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * `createPdaHook` / `createPdasHook`, via the Master Edition hooks built in
 * `src/hooks/master-edition-pda.ts`.
 */
const PdaFactoryCard: React.FC = () => {
  const single = useMasterEditionPda(
    DEMO_MINTS[0] ? { mint: DEMO_MINTS[0] } : null,
  );

  const many = useMasterEditionPdas(DEMO_MINTS.map((mint) => ({ mint })));

  return (
    <Card>
      <CardHeader>
        <CardTitle>createPdaHook / createPdasHook</CardTitle>
        <CardDescription>
          Turn any async <code className="font-mono">PdaFn</code> into a
          synchronous, memoized hook. These build a Metaplex Master Edition PDA
          hook — a derivation grill does not ship.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeBlock>{`// src/hooks/master-edition-pda.ts
import { createPdaHook, TOKEN_METADATA_PROGRAM_ADDRESS } from "@macalinao/grill";
import { getProgramDerivedAddress } from "@solana/kit";

const findMasterEditionPda: PdaFn<{ mint: Address }, Address> = ({ mint }) =>
  getProgramDerivedAddress({
    programAddress: TOKEN_METADATA_PROGRAM_ADDRESS,
    seeds: ["metadata", TOKEN_METADATA_PROGRAM_ADDRESS, mint, "edition"].map(encode),
  });

export const useMasterEditionPda = createPdaHook(
  findMasterEditionPda,
  "masterEditionPda",
);`}</CodeBlock>

        <div>
          <div className="mb-1 text-sm font-medium">
            useMasterEditionPda (USDC mint)
          </div>
          <div className="rounded-lg border p-3">
            {single ? (
              <span className="font-mono text-sm break-all">{single}</span>
            ) : (
              <Skeleton className="h-5 w-full" />
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            useMasterEditionPdas ({DEMO_MINTS.length} mints)
          </div>
          <div className="rounded-lg border p-3">
            {many ? (
              many.map((pda) => (
                <div
                  key={pda}
                  className="border-b py-1.5 font-mono text-xs break-all last:border-b-0"
                >
                  {pda}
                </div>
              ))
            ) : (
              <Skeleton className="h-16 w-full" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function HookFactoriesPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Hook factories: build your own typed hooks"
        exports={[
          "createDecodedAccountHook",
          "createDecodedAccountsHook",
          "createPdaHook",
          "createPdasHook",
          "PdaFn",
          "PdaHook",
          "PdasHook",
          "UseDecodedAccountHook",
          "UseDecodedAccountsHook",
        ]}
      >
        Grill’s built-in hooks (
        <code className="font-mono">useMintAccount</code>,{" "}
        <code className="font-mono">useAssociatedTokenPda</code>, …) are all
        built from four factories, and so is everything on this page. Give a
        factory a decoder or a PDA function and you get back a hook with the
        same batching, caching, and subscription behaviour as the built-ins.
      </ExampleHeader>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">How it works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              A factory closes over your decoder and returns a hook that
              delegates to <code className="font-mono">useAccount</code> /{" "}
              <code className="font-mono">useAccounts</code>. Your hook
              therefore shares one DataLoader batch and one react-query cache
              entry per address with every other hook in the app — two
              components reading the same account through different hooks still
              cost one RPC read.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <DecodedAccountFactoryCard />
          <PdaFactoryCard />
        </div>
      </div>
    </div>
  );
}
