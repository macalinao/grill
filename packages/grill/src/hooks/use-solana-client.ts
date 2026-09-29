import type { Client } from "@solana/kit";
import type { GrillClient } from "../types.js";
import { useClientCapability } from "@solana/react";

// Hoisted to module scope so the React Compiler has nothing to cache here.
// Inline, it memoizes this object with `c(1)`, which imports the CommonJS
// `react-compiler-runtime` polyfill (~6 KB min) into every bundle that uses
// GrillProvider/GrillHeadlessProvider.
const CLIENT_CAPABILITY_OPTIONS = {
  capability: ["rpc", "rpcSubscriptions"],
  hookName: "useSolanaClient",
  providerHint:
    "Wrap your app in `ClientProvider` from `@solana/react`, passing a client with `rpc` and `rpcSubscriptions`, such as `createClient().use(solanaRpcConnection({ rpcUrl }))` from `@solana/kit-plugin-rpc`.",
} as const;

/**
 * Hook to access the kit client provided by `ClientProvider` from
 * `@solana/react`, typed with the `rpc` and `rpcSubscriptions` capabilities
 * grill relies on.
 *
 * There is no grill-specific client state: this reads `@solana/react`'s
 * `ClientContext`, so grill shares one client with the rest of the app.
 *
 * @returns The client, including its `rpc` and `rpcSubscriptions` members
 * @throws Error if used outside of a `ClientProvider`, or if the provided
 * client lacks `rpc` or `rpcSubscriptions`
 */
export function useSolanaClient(): Client<GrillClient> {
  return useClientCapability<GrillClient>(CLIENT_CAPABILITY_OPTIONS);
}
