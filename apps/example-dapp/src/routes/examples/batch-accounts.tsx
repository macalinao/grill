import { useAccount, useAccounts } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Coins, Loader2, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/examples/batch-accounts")({
  component: BatchAccountsPage,
});

// Common token mint addresses to check for
const COMMON_TOKENS = [
  {
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    symbol: "USDC",
  },
  {
    mint: address("So11111111111111111111111111111111111111112"),
    symbol: "WSOL",
  },
  {
    mint: address("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"),
    symbol: "JUP",
  },
  {
    mint: address("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
    symbol: "BONK",
  },
  {
    mint: address("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),
    symbol: "ETH",
  },
  {
    mint: address("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),
    symbol: "stSOL",
  },
  {
    mint: address("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    symbol: "USDT",
  },
  {
    mint: address("HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3"),
    symbol: "PYTH",
  },
  {
    mint: address("hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux"),
    symbol: "HNT",
  },
  {
    mint: address("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"),
    symbol: "BTC",
  },
];

const BatchAccountsComparison: React.FC = () => {
  // Derive all token account addresses for the user
  const tokenAccountAddresses = useMemo(
    () =>
      COMMON_TOKENS.map((token) => {
        // Derive the associated token account address
        // In a real app, you'd use findAssociatedTokenPda or similar
        // For demo purposes, we'll use a simplified approach
        return token.mint; // This should be the ATA address in reality
      }),
    [],
  );

  // Fetch all token accounts at once using useAccounts (batched)
  const batchResults = useAccounts({
    addresses: tokenAccountAddresses,
  });

  // Count how many are loading, have data, or errored
  const stats = useMemo(() => {
    let loading = 0;
    let found = 0;
    let notFound = 0;
    let errors = 0;

    batchResults.forEach((result) => {
      if (result.isLoading) {
        loading++;
      } else if (result.error) {
        errors++;
      } else if (result.data) {
        found++;
      } else {
        notFound++;
      }
    });

    return { loading, found, notFound, errors };
  }, [batchResults]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Batch Fetching (useAccounts)</CardTitle>
          </div>
          <div className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            1 RPC Call for {COMMON_TOKENS.length} accounts
          </div>
        </div>
        <CardDescription>
          Using useAccounts to fetch multiple accounts in a single batched RPC
          call
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border p-2">
              <p className="text-sm text-muted-foreground">Loading</p>
              <p className="text-xl font-bold">{stats.loading}</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-sm text-muted-foreground">Found</p>
              <p className="text-xl font-bold text-green-600">{stats.found}</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-sm text-muted-foreground">Not Found</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.notFound}
              </p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-xl font-bold text-red-600">{stats.errors}</p>
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Token Accounts Status:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_TOKENS.map((token, index) => {
                const result = batchResults[index];
                return (
                  <div
                    key={token.mint}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {token.symbol}
                      </span>
                    </div>
                    {result?.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : result?.error ? (
                      <span className="text-xs font-medium text-red-600">
                        Error
                      </span>
                    ) : result?.data ? (
                      <span className="text-xs font-medium text-green-600">
                        Found
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        Not Found
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const IndividualFetching: React.FC = () => {
  // Multiple useAccount hooks also benefit from automatic batching
  const token1 = useAccount({
    address: COMMON_TOKENS[0]?.mint,
  });
  const token2 = useAccount({
    address: COMMON_TOKENS[1]?.mint,
  });
  const token3 = useAccount({
    address: COMMON_TOKENS[2]?.mint,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Multiple useAccount Hooks</CardTitle>
          <div className="rounded-md border px-2 py-1 text-xs font-medium">
            Also batched automatically!
          </div>
        </div>
        <CardDescription>
          Using individual useAccount hooks - these are also automatically
          batched
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {COMMON_TOKENS[0]?.symbol}
              </span>
              {token1.isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : token1.data ? (
                <span className="text-sm font-medium text-green-600">
                  Found
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  Not Found
                </span>
              )}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {COMMON_TOKENS[1]?.symbol}
              </span>
              {token2.isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : token2.data ? (
                <span className="text-sm font-medium text-green-600">
                  Found
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  Not Found
                </span>
              )}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {COMMON_TOKENS[2]?.symbol}
              </span>
              {token3.isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : token3.data ? (
                <span className="text-sm font-medium text-green-600">
                  Found
                </span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  Not Found
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function BatchAccountsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Batch Account Fetching</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates how both useAccounts and useAccount hooks automatically
          batch multiple account requests via DataLoader for improved
          performance.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Both <code className="font-mono text-sm">useAccounts</code> and{" "}
              <code className="font-mono text-sm">useAccount</code> hooks
              automatically batch multiple account requests into a single RPC
              call using DataLoader. When multiple components use these hooks
              concurrently, all requests are coalesced into efficient batched
              RPC calls.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <BatchAccountsComparison />
          <IndividualFetching />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Automatic Batching:</strong> All{" "}
                  {COMMON_TOKENS.length} account requests are combined into
                  efficient batched RPC calls
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Reduced Latency:</strong> Fewer network round-trips
                  through intelligent request coalescing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Better UX:</strong> Faster loading times and smoother
                  user experience
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Shared Cache:</strong> Results are cached and shared
                  across all components
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
