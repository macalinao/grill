import type * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExampleEntry {
  title: string;
  href: string;
  description: string;
  /** The `@macalinao/grill` exports this example demonstrates. */
  exports: string[];
}

interface ExampleSection {
  heading: string;
  blurb: string;
  entries: ExampleEntry[];
}

const SECTIONS: ExampleSection[] = [
  {
    heading: "Getting Started",
    blurb: "The everyday patterns — reading accounts, tokens, and sending SOL.",
    entries: [
      {
        title: "Simple Dashboard",
        href: "/examples/dashboard",
        description: "Wallet connection and native balance display.",
        exports: ["useAccount", "useKitWallet"],
      },
      {
        title: "Transfer SOL",
        href: "/examples/transfer-sol",
        description:
          "Build and send a transaction, with Zod-validated form input.",
        exports: ["useSendTX", "parseTokenAmount", "addressSchema"],
      },
      {
        title: "Wrapped SOL",
        href: "/examples/wrapped-sol",
        description:
          "Wrap and unwrap SOL through its associated token account.",
        exports: ["useAssociatedTokenAccount", "useSendTX"],
      },
      {
        title: "Token Information",
        href: "/examples/tokens",
        description: "Supply, decimals, and metadata for a mint.",
        exports: ["useTokenInfo", "useMintAccount"],
      },
      {
        title: "Token Balances",
        href: "/examples/token-balances",
        description: "Your balance for a list of mints, by (mint, owner).",
        exports: ["useATABalance", "formatTokenAmount"],
      },
      {
        title: "Static Token Info",
        href: "/examples/static-tokens",
        description:
          "Preloaded token metadata that resolves instantly, without a fetch.",
        exports: ["useTokenInfo", "GrillProvider"],
      },
      {
        title: "Batch Accounts",
        href: "/examples/batch-accounts",
        description:
          "Concurrent reads coalesced into a single RPC call by the DataLoader.",
        exports: ["useAccount", "useAccounts"],
      },
      {
        title: "Pool Subscription",
        href: "/examples/pool-subscription",
        description: "Live pool price over a WebSocket subscription.",
        exports: ["useAccount", "subscribeToUpdates"],
      },
    ],
  },
  {
    heading: "Accounts & PDAs",
    blurb:
      "The typed hooks grill ships, and the factories they are built from.",
    entries: [
      {
        title: "Account Hooks",
        href: "/examples/account-hooks",
        description:
          "Mints, token accounts, and address lookup tables — singular and plural.",
        exports: [
          "useMintAccount",
          "useTokenAccount",
          "useAddressLookupTable",
          "…and their plurals",
        ],
      },
      {
        title: "PDA Hooks",
        href: "/examples/pdas",
        description:
          "Async PDA derivation turned into a synchronous, cached value.",
        exports: ["useAssociatedTokenPda", "useTokenMetadataPda"],
      },
      {
        title: "Token Metadata",
        href: "/examples/token-metadata",
        description: "Raw Metaplex metadata, by mint or by metadata address.",
        exports: ["useTokenMetadataAccount", "useMplTokenMetadataAccount"],
      },
      {
        title: "Token Info & Balances",
        href: "/examples/token-infos",
        description:
          "Batched token identity, and a balance for any token account.",
        exports: ["useTokenInfos", "useTokenBalance"],
      },
      {
        title: "Hook Factories",
        href: "/examples/hook-factories",
        description:
          "Build your own typed account and PDA hooks for any program.",
        exports: [
          "createDecodedAccountHook",
          "createPdaHook",
          "…and their plurals",
        ],
      },
    ],
  },
  {
    heading: "Providers & Internals",
    blurb:
      "The machinery underneath: subscriptions, the cache, the wallet, the event stream.",
    entries: [
      {
        title: "Subscriptions",
        href: "/examples/subscriptions",
        description:
          "The reference-counted subscription manager, driven by hand.",
        exports: [
          "useAccountSubscription",
          "useSubscriptionManager",
          "SubscriptionProvider",
        ],
      },
      {
        title: "Context & Cache",
        href: "/examples/grill-context",
        description:
          "Read the provider's config, build cache keys, force a refetch.",
        exports: [
          "useGrillContext",
          "refetchAccounts",
          "createAccountQueryKey",
        ],
      },
      {
        title: "Wallet Access",
        href: "/examples/wallet",
        description:
          "The nullable read, the throwing read, and the provider behind both.",
        exports: ["useKitWallet", "useConnectedWallet", "WalletProvider"],
      },
      {
        title: "Headless Provider",
        href: "/examples/headless-provider",
        description:
          "Take the toasts out and render the transaction event stream yourself.",
        exports: ["GrillHeadlessProvider", "TransactionStatusEvent"],
      },
    ],
  },
];

const ExampleCard: React.FC<{ entry: ExampleEntry }> = ({ entry }) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle>{entry.title}</CardTitle>
      <CardDescription>{entry.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-1">
      <div className="flex flex-wrap gap-1">
        {entry.exports.map((name) => (
          <code
            key={name}
            className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs"
          >
            {name}
          </code>
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Link to={entry.href} className="w-full">
        <Button className="w-full">View Example</Button>
      </Link>
    </CardFooter>
  </Card>
);

const ExamplesIndexPage: React.FC = () => {
  const total = SECTIONS.reduce(
    (count, section) => count + section.entries.length,
    0,
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Grill Examples</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {total} runnable examples covering every public export of{" "}
          <code className="font-mono">@macalinao/grill</code>. Each page shows
          the live result of the hooks it demonstrates, plus the code to
          reproduce it.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.heading} className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <p className="text-sm text-muted-foreground">{section.blurb}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {section.entries.map((entry) => (
              <ExampleCard key={entry.href} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export const Route = createFileRoute("/examples/")({
  component: ExamplesIndexPage,
});
