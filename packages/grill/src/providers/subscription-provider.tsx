import type { FC, ReactNode } from "react";
import { useSolanaClient } from "@gillsdk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  createSubscriptionManager,
  SubscriptionContext,
} from "../contexts/subscription-context.js";

export interface SubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Provider component for WebSocket account subscriptions.
 *
 * This provider:
 * - Creates a SubscriptionManager for handling WebSocket subscriptions to Solana accounts
 * - Automatically de-duplicates subscriptions (multiple components subscribing to the same account share one WebSocket)
 * - Updates React Query cache when account data changes on-chain
 * - Cleans up subscriptions when all subscribers unmount
 *
 * This provider is automatically included in GrillHeadlessProvider and GrillProvider,
 * so you typically don't need to use it directly.
 *
 * @example
 * ```tsx
 * // Usually you don't need to use this directly - it's included in GrillProvider
 * // But if you need standalone subscription support:
 * <SubscriptionProvider>
 *   <App />
 * </SubscriptionProvider>
 * ```
 */
export const SubscriptionProvider: FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const { rpcSubscriptions } = useSolanaClient();
  const queryClient = useQueryClient();

  // Create subscription manager for real-time account updates
  const subscriptionManager = useMemo(
    () => createSubscriptionManager(rpcSubscriptions, queryClient),
    [rpcSubscriptions, queryClient],
  );

  return (
    <SubscriptionContext.Provider value={subscriptionManager}>
      {children}
    </SubscriptionContext.Provider>
  );
};
