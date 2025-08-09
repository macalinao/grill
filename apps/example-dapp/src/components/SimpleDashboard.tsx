import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useSolanaClient, useAccount } from "gill-react"
import { address } from "@solana/kit"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"

export function SimpleDashboard() {
  const { publicKey } = useWallet()
  const { rpc } = useSolanaClient()
  const accountQuery = useAccount({ address: publicKey ? address(publicKey.toBase58()) : undefined } as any)
  const [slot, setSlot] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRefreshBalance = () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first")
      return
    }
    
    accountQuery.refetch()
    toast.success("Balance refreshed")
  }

  const handleGetSlot = async () => {
    setLoading(true)
    try {
      const currentSlot = await rpc.getSlot().send()
      setSlot(Number(currentSlot))
      toast.success(`Current slot: ${currentSlot}`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch slot")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Grill + Gill Example</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <WalletMultiButton />
          </div>
        </div>

        {publicKey && (
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connected</CardTitle>
              <CardDescription>
                Address: {publicKey.toBase58()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accountQuery.isLoading ? (
                  <p className="text-lg">Loading balance...</p>
                ) : accountQuery.error ? (
                  <p className="text-lg text-red-500">Error loading balance</p>
                ) : accountQuery.account ? (
                  <p className="text-lg">Balance: {Number(accountQuery.account.lamports) / 1e9} SOL</p>
                ) : (
                  <p className="text-lg">Balance: 0 SOL</p>
                )}
                {slot !== null && (
                  <p className="text-lg">Current Slot: {slot}</p>
                )}
                <div className="flex gap-4">
                  <Button onClick={handleRefreshBalance} disabled={accountQuery.isLoading}>
                    {accountQuery.isLoading ? "Loading..." : "Refresh Balance"}
                  </Button>
                  <Button onClick={handleGetSlot} disabled={loading} variant="secondary">
                    Get Current Slot
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!publicKey && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                Connect your wallet to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This example demonstrates how to use the Grill library with:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
                <li>SolanaClientProvider with gill's createSolanaClient</li>
                <li>GrillProvider with React Query for reactive account fetching</li>
                <li>useAccount hook for automatic balance loading and caching</li>
                <li>RPC calls using the gill client</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}