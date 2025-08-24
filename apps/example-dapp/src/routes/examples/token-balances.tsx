import { useATABalance } from "@macalinao/grill";
import { formatTokenAmount } from "@macalinao/token-utils";
import { address } from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/examples/token-balances")({
  component: TokenBalances,
});

// Common token mints on mainnet
const TOKENS = [
  {
    symbol: "USDC",
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    name: "USD Coin",
  },
  {
    symbol: "JUP",
    mint: address("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"),
    name: "Jupiter",
  },
  {
    symbol: "BONK",
    mint: address("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
    name: "Bonk",
  },
  {
    symbol: "WIF",
    mint: address("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm"),
    name: "dogwifhat",
  },
  {
    symbol: "PYTH",
    mint: address("HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3"),
    name: "Pyth Network",
  },
  {
    symbol: "RENDER",
    mint: address("rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof"),
    name: "Render Token",
  },
];

function TokenBalanceRow({
  token,
  owner,
}: {
  token: (typeof TOKENS)[0];
  owner: ReturnType<typeof address> | undefined;
}) {
  const balance = useATABalance({
    mint: token.mint,
    owner,
  });

  return (
    <tr className="border-b">
      <td className="px-4 py-2 font-medium">{token.symbol}</td>
      <td className="px-4 py-2 text-sm text-gray-600">{token.name}</td>
      <td className="px-4 py-2 text-right font-mono">
        {balance ? formatTokenAmount(balance) : "0"}
      </td>
    </tr>
  );
}

function TokenBalances() {
  const { publicKey } = useWallet();
  const owner = publicKey ? address(publicKey.toBase58()) : undefined;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Token Balances</h1>

      {!owner ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please connect your wallet to view token balances.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Wallet: <span className="font-mono">{owner}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {TOKENS.map((token) => (
                  <TokenBalanceRow
                    key={token.mint}
                    token={token}
                    owner={owner}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              This example demonstrates the <code>useATABalance</code> hook
              which fetches token balances for Associated Token Accounts.
            </p>
            <p className="mt-2">
              The hook automatically handles:
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>Computing the ATA address for each token</li>
                <li>Fetching token metadata and decimals</li>
                <li>Returning zero balance if the ATA doesn't exist</li>
                <li>Formatting the balance with proper decimal places</li>
              </ul>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
