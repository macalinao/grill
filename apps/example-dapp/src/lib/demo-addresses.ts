import type { Address } from "@solana/kit";
import { address } from "@solana/kit";

export interface DemoToken {
  symbol: string;
  mint: Address;
}

/** Well-known mainnet mints used across the example pages. */
export const DEMO_TOKENS: DemoToken[] = [
  {
    symbol: "USDC",
    mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  },
  {
    symbol: "WSOL",
    mint: address("So11111111111111111111111111111111111111112"),
  },
  {
    symbol: "JUP",
    mint: address("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"),
  },
  {
    symbol: "BONK",
    mint: address("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"),
  },
];

export const DEMO_MINTS: Address[] = DEMO_TOKENS.map((token) => token.mint);

/**
 * Mainnet Token-2022 mints. Grill's `useMintAccount` uses the legacy
 * `@solana-program/token` decoder, which cannot read these — the hook-factories
 * example builds a Token-2022 hook to cover them.
 */
export const DEMO_TOKEN_2022_MINTS: DemoToken[] = [
  {
    symbol: "PYUSD",
    mint: address("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"),
  },
  {
    symbol: "USDG",
    mint: address("2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH"),
  },
  {
    symbol: "ai16z",
    mint: address("HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC"),
  },
  {
    symbol: "BERN",
    mint: address("CKfatsPMUf8SkiURsDXs7eK6GWb4Jsd6UDbs7twMCWxo"),
  },
];

/** Meteora SOL-USDC DAMM v2 pool. Its token vaults are long-lived token accounts. */
export const SOL_USDC_POOL = address(
  "8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie",
);

/**
 * A wallet with a large, diverse set of token accounts, used as a stand-in
 * owner so the PDA examples render real data without a connected wallet.
 * This is Binance's hot wallet.
 */
export const DEMO_OWNER = address(
  "2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S",
);

/**
 * Mainnet Address Lookup Tables, used by the address-lookup-table example.
 * ALTs can be deactivated and closed by their authority, so the example also
 * handles the not-found case and lets you paste your own address.
 */
export const DEMO_LOOKUP_TABLES: Address[] = [
  address("Ce5Y2kpwenFF6hJZamykjHhhUF3WAx8RMLn6wipEpcbJ"),
  address("6EvRtCLjwUcktum4GAFvJuJRANZtLUYFPgtCrVYe9zBC"),
];
