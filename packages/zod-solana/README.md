# @macalinao/zod-solana

[![npm version](https://img.shields.io/npm/v/@macalinao/zod-solana.svg)](https://www.npmjs.com/package/@macalinao/zod-solana)

Zod schemas for Solana types with @solana/kit integration. Provides type-safe validation and transformation for Solana addresses.

## Installation

```bash
npm install @macalinao/zod-solana
# or
yarn add @macalinao/zod-solana
# or
bun add @macalinao/zod-solana
```

### Peer Dependencies

This package requires the following peer dependencies:

- `@solana/kit` (>=1.0.0)
- `zod` (>=3.0.0 or >=4.0.0)

## Usage

### Basic Address Validation

```typescript
import { addressSchema } from "@macalinao/zod-solana";

// Parse and validate a Solana address
const address = addressSchema.parse("11111111111111111111111111111111");
// Returns: Address type from @solana/kit

// Safe parsing with error handling
const result = addressSchema.safeParse("invalid-address");
if (result.success) {
  console.log("Valid address:", result.data);
} else {
  console.log("Invalid address:", result.error.issues[0].message);
  // Output: "Invalid Solana address"
}
```

### With React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressSchema } from "@macalinao/zod-solana";

const formSchema = z.object({
  recipient: addressSchema,
  amount: z.number().positive(),
});

type FormData = z.infer<typeof formSchema>;

function SendTokenForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    // data.recipient is typed as Address
    console.log("Sending to:", data.recipient);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("recipient")} placeholder="Recipient address" />
      {errors.recipient && <span>{errors.recipient.message}</span>}

      <input {...register("amount", { valueAsNumber: true })} placeholder="Amount" />
      {errors.amount && <span>{errors.amount.message}</span>}

      <button type="submit">Send</button>
    </form>
  );
}
```

### Type Inference

```typescript
import { z } from "zod";
import { addressSchema } from "@macalinao/zod-solana";

// Infer the Address type
type SolanaAddress = z.infer<typeof addressSchema>;
// Type: Address from @solana/kit

// Use in your schemas
const walletSchema = z.object({
  owner: addressSchema,
  tokenAccounts: z.array(addressSchema),
  lamports: z.number(),
});

type Wallet = z.infer<typeof walletSchema>;
```

## Features

- ✅ **Type-safe**: Validates and transforms strings to Solana `Address` type
- ✅ **Zod v3 & v4 compatible**: Works with both major versions of Zod
- ✅ **Comprehensive validation**: Checks for valid base58 encoding and address format
- ✅ **TypeScript support**: Full type inference and autocompletion
- ✅ **Framework agnostic**: Use with any JavaScript/TypeScript framework
- ✅ **Well tested**: Comprehensive test suite with edge cases

## API

### `addressSchema`

A Zod schema that validates Solana addresses.

- **Input**: `string` - A potential Solana address
- **Output**: `Address` - A validated Address type from @solana/kit
- **Errors**: Throws/returns error with message "Invalid Solana address" for invalid inputs

## Examples

### Validating Multiple Addresses

```typescript
import { z } from "zod";
import { addressSchema } from "@macalinao/zod-solana";

const multiSigSchema = z.object({
  signers: z.array(addressSchema).min(2),
  threshold: z.number().min(1),
});

const multisig = multiSigSchema.parse({
  signers: [
    "11111111111111111111111111111111",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  ],
  threshold: 2,
});
```

### Custom Error Messages

```typescript
const customAddressSchema = addressSchema.describe("Wallet address");

// Or with Zod's built-in error customization
const recipientSchema = z
  .string()
  .pipe(addressSchema)
  .describe("Recipient wallet address");
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the package
bun run build

# Run linting
bun run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related

- [@macalinao/grill](https://github.com/macalinao/grill) - Modern Solana development kit for React applications
- [@solana/kit](https://github.com/solana-developers/solana-kit) - Solana development toolkit
- [zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation

## License

Copyright (c) 2025 Ian Macalinao. Licensed under the Apache-2.0 License.
