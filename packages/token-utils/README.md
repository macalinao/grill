# @macalinao/token-utils

[![npm version](https://img.shields.io/npm/v/@macalinao/token-utils.svg)](https://www.npmjs.com/package/@macalinao/token-utils)

Token utility functions for Solana development. Provides type-safe utilities for parsing, formatting, and converting token amounts with proper decimal handling.

## Installation

```bash
bun add @macalinao/token-utils
```

## Features

- **Type-safe token amounts**: Work with strongly-typed token amounts that preserve decimal precision
- **Decimal-aware parsing**: Parse human-readable amounts (e.g., "1.5 SOL") into raw token amounts
- **Formatting utilities**: Format token amounts for display with proper decimal handling
- **BigInt conversion**: Convert token amounts to raw bigint values for on-chain operations
- **Native SOL support**: Built-in support for SOL token operations
- **dnum integration**: Uses the dnum library for precise decimal arithmetic

## Usage

### Parse Token Amounts

```typescript
import { parseTokenAmount } from "@macalinao/token-utils";

const solToken = {
  mint: address("So11111111111111111111111111111111111111112"),
  name: "Wrapped SOL",
  symbol: "SOL",
  decimals: 9,
};

// Parse human-readable amounts
const amount = parseTokenAmount(solToken, "1.5");
// Result: TokenAmount with dnum [1500000000n, 9]
```

### Format Token Amounts

```typescript
import { formatTokenAmount } from "@macalinao/token-utils";

const formatted = formatTokenAmount(amount);
// Result: "1.5"

// With custom precision
const withPrecision = formatTokenAmount(amount, { maximumFractionDigits: 4 });
// Result: "1.5000"
```

### Convert to BigInt

```typescript
import { tokenAmountToBigInt } from "@macalinao/token-utils";

const bigintAmount = tokenAmountToBigInt(amount);
// Result: 1500000000n (raw token amount for on-chain operations)
```

### Native SOL Operations

```typescript
import { nativeSOL, parseSOL, formatSOL } from "@macalinao/token-utils";

// Get SOL token info
const sol = nativeSOL();

// Parse SOL amounts
const solAmount = parseSOL("2.5");

// Format SOL amounts
const formatted = formatSOL(solAmount);
// Result: "2.5"
```

## API Reference

### Types

#### `TokenInfo<TMint, TDecimals>`
Basic information about a token including mint address, name, symbol, decimals, and optional icon URL.

#### `TokenAmount<TMint, TDecimals>`
A token amount represented as a dnum with associated token information.

### Functions

#### `parseTokenAmount(token, amountHuman)`
Parse a string or number amount into a TokenAmount with proper decimal handling.

#### `formatTokenAmount(tokenAmount, options?)`
Format a TokenAmount for display with optional formatting options.

#### `tokenAmountToBigInt(tokenAmount)`
Convert a TokenAmount to a bigint representing the raw token amount.

#### `nativeSOL()`
Get the token information for native SOL.

#### `parseSOL(amountHuman)`
Shorthand for parsing SOL amounts.

#### `formatSOL(amount, options?)`
Shorthand for formatting SOL amounts.

## Examples

### Working with USDC

```typescript
const usdcToken = {
  mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
};

// Parse $100.25
const amount = parseTokenAmount(usdcToken, "100.25");

// Convert to bigint for transfer instruction
const rawAmount = tokenAmountToBigInt(amount); // 100250000n

// Format for display
const display = formatTokenAmount(amount); // "100.25"
```

### Handling Different Decimal Places

```typescript
// Token with 0 decimals (like some NFTs)
const nftToken = { mint: address("..."), symbol: "NFT", decimals: 0, name: "NFT" };
const nftAmount = parseTokenAmount(nftToken, "5");
const nftRaw = tokenAmountToBigInt(nftAmount); // 5n

// Token with 18 decimals (Ethereum-style)
const ethToken = { mint: address("..."), symbol: "ETH", decimals: 18, name: "Ethereum" };
const ethAmount = parseTokenAmount(ethToken, "0.000000000000000001");
const ethRaw = tokenAmountToBigInt(ethAmount); // 1n
```

## License

Apache-2.0