import type {
  DecodedAccountResult,
  DecodedAccountsResult,
  UseDecodedAccountsInput,
} from "@macalinao/grill";
import type { Address } from "@solana/kit";
import type { AddressLookupTable } from "@solana-program/address-lookup-table";
import type { Mint, Token } from "@solana-program/token";
import { getPoolDecoder } from "@macalinao/clients-meteora-damm-v2";
import {
  useAccount,
  useAddressLookupTable,
  useAddressLookupTables,
  useMintAccount,
  useMintAccounts,
  useTokenAccount,
  useTokenAccounts,
} from "@macalinao/grill";
import { address, unwrapOption } from "@solana/kit";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CodeBlock } from "@/components/examples/code-block";
import { ExampleHeader } from "@/components/examples/example-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEMO_LOOKUP_TABLES,
  DEMO_MINTS,
  DEMO_TOKENS,
  SOL_USDC_POOL,
} from "@/lib/demo-addresses";

export const Route = createFileRoute("/examples/account-hooks")({
  component: AccountHooksPage,
});

const poolDecoder = getPoolDecoder();

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline justify-between gap-4 border-b py-1.5 last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="truncate font-mono text-sm">{value}</span>
  </div>
);

const formatAmount = (raw: bigint, decimals: number): string => {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = (raw % divisor).toString().padStart(decimals, "0").slice(0, 2);
  return `${whole.toLocaleString()}.${frac}`;
};

/** `useMintAccount` (singular) and `useMintAccounts` (plural). */
const MintAccountsCard: React.FC = () => {
  // Singular: one decoded Mint account.
  const usdc: DecodedAccountResult<Mint> = useMintAccount({
    address: DEMO_TOKENS[0]?.mint,
  });

  // Plural: every mint in one batched RPC call.
  const all: DecodedAccountsResult<Mint> = useMintAccounts({
    addresses: DEMO_MINTS,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint accounts</CardTitle>
        <CardDescription>
          <code className="font-mono">useMintAccount</code> decodes a single SPL
          mint; <code className="font-mono">useMintAccounts</code> decodes many
          in one batch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 text-sm font-medium">useMintAccount (USDC)</div>
          {usdc.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : usdc.data ? (
            <div className="rounded-lg border p-3">
              <Row label="Decimals" value={usdc.data.data.decimals} />
              <Row
                label="Supply"
                value={formatAmount(
                  usdc.data.data.supply,
                  usdc.data.data.decimals,
                )}
              />
              <Row
                label="Mint authority"
                value={unwrapOption(usdc.data.data.mintAuthority) ?? "none"}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not found</p>
          )}
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            useMintAccounts ({DEMO_MINTS.length} mints, 1 batched call)
          </div>
          {all.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="rounded-lg border p-3">
              {all.data.map((account, i) => (
                <Row
                  key={DEMO_TOKENS[i]?.symbol ?? i}
                  label={DEMO_TOKENS[i]?.symbol ?? "?"}
                  value={
                    account
                      ? `${account.data.decimals.toString()} decimals · supply ${formatAmount(account.data.supply, account.data.decimals)}`
                      : "not found"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/** `useTokenAccount` (singular) and `useTokenAccounts` (plural). */
const TokenAccountsCard: React.FC = () => {
  // The pool's two vaults are long-lived SPL token accounts, so this card
  // renders real data without needing a connected wallet.
  const { data: pool } = useAccount({
    address: SOL_USDC_POOL,
    decoder: poolDecoder,
  });

  const vaultA = pool?.data.tokenAVault;
  const vaultB = pool?.data.tokenBVault;

  const single: DecodedAccountResult<Token> = useTokenAccount({
    address: vaultA,
  });

  const bothInput: UseDecodedAccountsInput = {
    addresses: vaultA && vaultB ? [vaultA, vaultB] : [],
  };
  const both: DecodedAccountsResult<Token> = useTokenAccounts(bothInput);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token accounts</CardTitle>
        <CardDescription>
          The Meteora SOL-USDC pool’s two vaults, decoded with{" "}
          <code className="font-mono">useTokenAccount</code> and{" "}
          <code className="font-mono">useTokenAccounts</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 text-sm font-medium">
            useTokenAccount (vault A)
          </div>
          {single.isLoading || !vaultA ? (
            <Skeleton className="h-16 w-full" />
          ) : single.data ? (
            <div className="rounded-lg border p-3">
              <Row label="Address" value={`${vaultA.slice(0, 12)}…`} />
              <Row
                label="Mint"
                value={`${single.data.data.mint.slice(0, 12)}…`}
              />
              <Row
                label="Raw amount"
                value={single.data.data.amount.toString()}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not found</p>
          )}
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            useTokenAccounts (both vaults)
          </div>
          {both.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="rounded-lg border p-3">
              {both.data.map((account, i) => (
                <Row
                  key={account?.address ?? i}
                  label={i === 0 ? "Vault A" : "Vault B"}
                  value={account ? account.data.amount.toString() : "not found"}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * `useAddressLookupTable` / `useAddressLookupTables`.
 *
 * Grill types these as `UseDecodedAccountHook<object>`, so the decoded data is
 * narrowed to the generated `AddressLookupTable` type here.
 */
const LookupTableCard: React.FC = () => {
  const [input, setInput] = useState<string>(DEMO_LOOKUP_TABLES[0] ?? "");

  let parsed: Address | null = null;
  try {
    parsed = input ? address(input) : null;
  } catch {
    parsed = null;
  }

  const single = useAddressLookupTable({ address: parsed });
  const many = useAddressLookupTables({ addresses: DEMO_LOOKUP_TABLES });

  const table = single.data?.data as AddressLookupTable | undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address lookup tables</CardTitle>
        <CardDescription>
          <code className="font-mono">useAddressLookupTable</code> decodes an
          ALT account. Tables can be closed by their authority, so paste your
          own if the default has gone away.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            placeholder="Address lookup table address"
            className="font-mono text-sm"
          />
          {input && !parsed && (
            <p className="text-sm text-destructive">Not a valid address</p>
          )}
        </div>

        {parsed &&
          (single.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : table ? (
            <div className="rounded-lg border p-3">
              <Row label="Addresses" value={table.addresses.length} />
              <Row
                label="Authority"
                value={unwrapOption(table.authority) ?? "none (frozen)"}
              />
              <Row
                label="Deactivated"
                value={
                  table.deactivationSlot === 18_446_744_073_709_551_615n
                    ? "no (active)"
                    : `slot ${table.deactivationSlot.toString()}`
                }
              />
              <Row
                label="Last extended slot"
                value={table.lastExtendedSlot.toString()}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No lookup table at this address — it may have been closed.
            </p>
          ))}

        <div>
          <div className="mb-1 text-sm font-medium">
            useAddressLookupTables ({DEMO_LOOKUP_TABLES.length} tables)
          </div>
          {many.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="rounded-lg border p-3">
              {many.data.map((account, i) => {
                const decoded = account?.data as AddressLookupTable | undefined;
                return (
                  <Row
                    key={DEMO_LOOKUP_TABLES[i] ?? i}
                    label={`${DEMO_LOOKUP_TABLES[i]?.slice(0, 8) ?? "?"}…`}
                    value={
                      decoded
                        ? `${decoded.addresses.length.toString()} addresses`
                        : "not found"
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function AccountHooksPage() {
  return (
    <div className="container mx-auto py-6">
      <ExampleHeader
        title="Built-in typed account hooks"
        exports={[
          "useMintAccount",
          "useMintAccounts",
          "useTokenAccount",
          "useTokenAccounts",
          "useAddressLookupTable",
          "useAddressLookupTables",
        ]}
      >
        Grill ships typed hooks for the account types every Solana app touches.
        Each comes in a singular and a plural form; the plural form batches all
        of its addresses into a single RPC call.
      </ExampleHeader>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <MintAccountsCard />
          <TokenAccountsCard />
        </div>

        <LookupTableCard />

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock>{`import { useMintAccount, useMintAccounts } from "@macalinao/grill";

// Singular — returns a react-query result with decoded \`Mint\` data.
const { data: usdc } = useMintAccount({ address: USDC_MINT });
usdc?.data.decimals; // 6

// Plural — every address is coalesced into one getMultipleAccounts call.
const { data: mints, isLoading } = useMintAccounts({
  addresses: [USDC_MINT, WSOL_MINT, JUP_MINT],
});`}</CodeBlock>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
