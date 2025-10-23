import { useTokenInfo } from "@macalinao/grill";
import { address } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TokenInfoPage() {
  const { tokenMint } = Route.useParams();

  const {
    data: tokenInfo,
    isLoading,
    error,
  } = useTokenInfo({
    mint: tokenMint ? address(tokenMint) : null,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Token Information</h1>
        <div>Loading token information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Token Information</h1>
        <div className="text-red-500">Error loading token: {error.message}</div>
      </div>
    );
  }

  if (!tokenInfo) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Token Information</h1>
        <div>No token information found for mint: {tokenMint}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Token Information</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {tokenInfo.iconURL && (
              <img
                src={tokenInfo.iconURL}
                alt={`${tokenInfo.symbol} icon`}
                className="w-8 h-8 rounded-full"
              />
            )}
            {tokenInfo.name} ({tokenInfo.symbol})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Name</h3>
              <p className="text-lg">{tokenInfo.name}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-600">Symbol</h3>
              <p className="text-lg">{tokenInfo.symbol}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-600">Decimals</h3>
              <p className="text-lg">{tokenInfo.decimals}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-600">
                Mint Address
              </h3>
              <p className="text-sm font-mono rounded break-all">
                {tokenInfo.mint}
              </p>
            </div>

            {tokenInfo.iconURL && (
              <div className="md:col-span-2">
                <h3 className="font-semibold text-sm text-gray-600">
                  Icon URL
                </h3>
                <p className="text-sm font-mono rounded break-all">
                  {tokenInfo.iconURL}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/token-info/$tokenMint")({
  component: TokenInfoPage,
});
