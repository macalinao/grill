import type {
  UseTokenBalanceOptions,
  UseTokenInfoInput,
  UseTokenInfosInput,
  UseTokenInfosResult,
} from "@macalinao/grill";
import { getPoolDecoder } from "@macalinao/clients-meteora-damm-v2";
import {
  formatTokenAmount,
  useAccount,
  useTokenBalance,
  useTokenInfo,
  useTokenInfos,
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
import { DEMO_MINTS, DEMO_TOKENS, SOL_USDC_POOL } from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/token-infos")({
  component: TokenInfosPage,
});

const poolDecoder = getPoolDecoder();

/** `useTokenInfo` (singular) next to `useTokenInfos` (plural). */
const TokenInfosCard: React.FC = () => {
  const singleInput: UseTokenInfoInput = { mint: DEMO_TOKENS[0]?.mint };
  const single = useTokenInfo(singleInput);

  const pluralInput: UseTokenInfosInput = { mints: DEMO_MINTS };
  const plural: UseTokenInfosResult = useTokenInfos(pluralInput);

  return (
    <Card>
      <CardHeader>
        <CardTitle>useTokenInfo / useTokenInfos</CardTitle>
        <CardDescription>
          A <code className="font-mono">TokenInfo</code> merges the mint
          account, the Metaplex metadata account, and the certified token list
          into one object — name, symbol, decimals, and icon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 text-sm font-medium">
            useTokenInfo (singular)
          </div>
          {single.isLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : single.data ? (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              {single.data.iconURL && (
                <img
                  src={single.data.iconURL}
                  alt={single.data.symbol}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{single.data.name}</div>
                <div className="text-sm text-muted-foreground">
                  {single.data.symbol} · {single.data.decimals} decimals
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not found</p>
          )}
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            useTokenInfos (plural, {DEMO_MINTS.length} mints)
          </div>
          {plural.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="rounded-lg border p-3">
              {plural.data.map((info, i) => (
                <div
                  key={DEMO_TOKENS[i]?.mint ?? i}
                  className="flex items-center gap-3 border-b py-2 last:border-b-0"
                >
                  {info?.iconURL ? (
                    <img
                      src={info.iconURL}
                      alt={info.symbol}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted" />
                  )}
                  <span className="text-sm font-medium">
                    {info?.name ?? "Unknown"}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {info?.symbol ?? "—"} · {info?.decimals ?? "?"}d
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
 * `useTokenBalance` reads a token account by *address* and formats it against
 * the mint's decimals. The pool vaults below are ordinary SPL token accounts, so
 * this renders real balances with no wallet connected.
 */
const TokenBalanceCard: React.FC = () => {
  const { data: pool } = useAccount({
    address: SOL_USDC_POOL,
    decoder: poolDecoder,
  });

  const vaultA: UseTokenBalanceOptions = { address: pool?.data.tokenAVault };
  const vaultB: UseTokenBalanceOptions = { address: pool?.data.tokenBVault };

  const balanceA = useTokenBalance(vaultA);
  const balanceB = useTokenBalance(vaultB);

  return (
    <Card>
      <CardHeader>
        <CardTitle>useTokenBalance</CardTitle>
        <CardDescription>
          The two vaults of the Meteora SOL-USDC pool. The hook fetches the
          token account, looks up the mint’s decimals, and returns a formattable{" "}
          <code className="font-mono">TokenAmount</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { label: "Vault A", balance: balanceA },
          { label: "Vault B", balance: balanceB },
        ].map(({ label, balance }) => (
          <div key={label} className="rounded-lg border p-3">
            <div className="text-sm text-muted-foreground">{label}</div>
            {balance ? (
              <div className="font-mono text-xl font-medium">
                {formatTokenAmount(balance, { symbol: true })}
              </div>
            ) : (
              <Skeleton className="mt-1 h-7 w-40" />
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Compare with <code className="font-mono">useATABalance</code> on the
          Token Balances page, which takes a (mint, owner) pair and derives the
          account address for you.
        </p>
      </CardContent>
    </Card>
  );
};

function TokenInfosPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Token info and balances"
        exports={[
          "useTokenInfo",
          "useTokenInfos",
          "useTokenBalance",
          "formatTokenAmount",
        ]}
      >
        Everything you need to render a token: its identity (
        <code className="font-mono">useTokenInfo</code>) and how much of it an
        account holds (<code className="font-mono">useTokenBalance</code>).
      </ExampleHeader>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <TokenInfosCard />
          <TokenBalanceCard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { useTokenInfos, useTokenBalance, formatTokenAmount } from "@macalinao/grill";

// One batched read for every mint's mint account + metadata account.
const { data: infos, isLoading } = useTokenInfos({ mints });

// A token account address in, a decimal-aware TokenAmount out.
const balance = useTokenBalance({ address: tokenAccountAddress });
formatTokenAmount(balance, { symbol: true }); // "1,234.56 USDC"`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
