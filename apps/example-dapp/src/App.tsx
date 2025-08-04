import { GrillProvider } from "@macalinao/grill";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  BackpackWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSolanaClient } from "gill";
import { SolanaProvider } from "gill-react";
import { useMemo } from "react";
import { Toaster } from "sonner";

import { SimpleDashboard } from "./components/SimpleDashboard";

import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

function App() {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  const solanaClient = useMemo(
    () => createSolanaClient({ urlOrMoniker: "mainnet-beta" }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider client={solanaClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <GrillProvider>
                <div className="min-h-screen bg-background">
                  <SimpleDashboard />
                  <Toaster position="bottom-right" />
                </div>
              </GrillProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </SolanaProvider>
    </QueryClientProvider>
  );
}

export default App;
