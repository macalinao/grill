import { useTokenInfos } from "@macalinao/grill";
import type { Address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/examples/multiple-tokens")({
  component: MultipleTokensExample,
});

// Popular Solana token mints - 15 tokens
const TOKEN_MINTS: { address: Address; name: string }[] = [
  // Stablecoins
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address,
    name: "USDC",
  },
  {
    address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" as Address,
    name: "USDT",
  },
  {
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs" as Address,
    name: "USDC (Legacy)",
  },
  // Native tokens
  {
    address: "So11111111111111111111111111111111111111112" as Address,
    name: "Wrapped SOL",
  },
  {
    address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So" as Address,
    name: "mSOL",
  },
  {
    address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj" as Address,
    name: "stSOL",
  },
  // DeFi tokens
  {
    address: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" as Address,
    name: "Serum",
  },
  {
    address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE" as Address,
    name: "ORCA",
  },
  {
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" as Address,
    name: "SAMO",
  },
  // Meme/Gaming tokens
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" as Address,
    name: "BONK",
  },
  {
    address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk" as Address,
    name: "WEN",
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" as Address,
    name: "WIF",
  },
  // Infrastructure tokens
  {
    address: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux" as Address,
    name: "HNT",
  },
  {
    address: "RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a" as Address,
    name: "RLB",
  },
  {
    address: "11111111111111111111111111111111" as Address,
    name: "System Program (Invalid Token)",
  },
];

function MultipleTokensExample() {
  const mints = TOKEN_MINTS.map((t) => t.address);
  const {
    data: tokenInfos,
    isLoading,
    isError,
    isSuccess,
  } = useTokenInfos({
    mints,
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multiple Token Info Demo</h1>
        <p className="text-muted-foreground">
          Loading {TOKEN_MINTS.length} different Solana tokens at once using the
          useTokenInfos hook. This demonstrates efficient batching of account
          requests.
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant={isLoading ? "secondary" : "default"}>
            {isLoading ? "Loading..." : "Loaded"}
          </Badge>
          {isSuccess && (
            <Badge variant="outline">
              {tokenInfos.filter((t) => t !== null).length} tokens loaded
            </Badge>
          )}
          {isError && <Badge variant="destructive">Error loading tokens</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOKEN_MINTS.map((tokenMint, index) => {
          const tokenInfo = tokenInfos[index];
          const isLoadingToken = isLoading || !tokenInfo;

          return (
            <Card key={tokenMint.address} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="truncate">{tokenMint.name}</span>
                  {tokenInfo && (
                    <Badge variant="outline" className="ml-2">
                      {tokenInfo.symbol}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingToken ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                ) : tokenInfo ? (
                  <div className="space-y-3">
                    {/* Token Image */}
                    <div className="flex items-center space-x-3">
                      {tokenInfo.iconURL ? (
                        <img
                          src={tokenInfo.iconURL}
                          alt={tokenInfo.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder on error
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${tokenInfo.symbol}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                          {tokenInfo.symbol.slice(0, 2) || "??"}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{tokenInfo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tokenInfo.symbol}
                        </p>
                      </div>
                    </div>

                    {/* Token Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Decimals:</span>
                        <span className="font-mono">{tokenInfo.decimals}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Mint:</span>
                        <span className="font-mono text-xs break-all">
                          {tokenInfo.mint}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Token not found</p>
                    <p className="text-xs mt-2 font-mono break-all">
                      {tokenMint.address}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Performance Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">{TOKEN_MINTS.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Successfully Loaded</p>
              <p className="text-2xl font-bold">
                {tokenInfos.filter((t) => t !== null).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed to Load</p>
              <p className="text-2xl font-bold">
                {tokenInfos.filter((t) => t === null).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Batch Efficiency</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  (tokenInfos.filter((t) => t !== null).length /
                    TOKEN_MINTS.length) *
                    100,
                )}
                %
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> All {TOKEN_MINTS.length} token requests are
              automatically batched into efficient RPC calls using DataLoader.
              The useTokenInfos hook provides placeholder data immediately from
              on-chain sources while fetching complete metadata including images
              in the background.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
