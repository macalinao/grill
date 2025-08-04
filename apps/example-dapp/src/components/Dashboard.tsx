import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useSolanaClient } from "gill-react"
import { useAccount } from "@macalinao/grill"
import { address } from "@solana/kit"
import { useState } from "react"

export function Dashboard() {
  const { publicKey } = useWallet()
  const { rpc } = useSolanaClient()
  const [loading, setLoading] = useState(false)
  
  // Use the useAccount hook from grill for reactive balance fetching
  const accountQuery = useAccount(publicKey ? address(publicKey.toBase58()) : null)

  const handleRefreshBalance = () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first")
      return
    }
    
    // Refetch the account data using React Query
    accountQuery.refetch()
    toast.success("Balance refreshed")
  }

  const handleGetSlot = async () => {
    setLoading(true)
    try {
      const slot = await rpc.getSlot().send()
      toast.success(`Current slot: ${slot}`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch slot")
    } finally {
      setLoading(false)
    }
  }

  const handleGetBlockHeight = async () => {
    setLoading(true)
    try {
      const blockHeight = await rpc.getBlockHeight().send()
      toast.success(`Current block height: ${blockHeight}`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch block height")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Solana Kit Example</h1>
          <WalletMultiButton />
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
              {accountQuery.data && (
                <p className="text-lg mb-4">
                  Balance: {(accountQuery.data.lamports / 1e9).toFixed(4)} SOL
                </p>
              )}
              {accountQuery.isLoading && (
                <p className="text-lg mb-4 text-muted-foreground">Loading balance...</p>
              )}
              {accountQuery.error && (
                <p className="text-lg mb-4 text-destructive">Error loading balance</p>
              )}
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={handleRefreshBalance} 
                  disabled={accountQuery.isLoading}
                >
                  {accountQuery.isLoading ? "Loading..." : "Refresh Balance"}
                </Button>
                <Button onClick={handleGetSlot} disabled={loading} variant="secondary">
                  Get Current Slot
                </Button>
                <Button onClick={handleGetBlockHeight} disabled={loading} variant="secondary">
                  Get Block Height
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!publicKey && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Solana Kit Example</CardTitle>
              <CardDescription>
                Connect your wallet to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This example demonstrates how to use the Grill library with React Query integration
                to efficiently fetch data from the Solana blockchain.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              This example showcases the following features:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Wallet connection using Solana Wallet Adapter</li>
              <li>Account balance fetching using Grill's useAccount hook</li>
              <li>RPC calls using gill's createSolanaClient</li>
              <li>React Query integration for data fetching</li>
              <li>Tailwind CSS v4 styling with shadcn components</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}