# @macalinao/grill-cli

Generate TypeScript clients for Solana programs from Anchor IDLs. Zero config, ESM-native, with automatic account batching support.

## Installation

```bash
# Using bun
bun add -D @macalinao/grill-cli

# Using npm
npm install -D @macalinao/grill-cli

# Using yarn
yarn add -D @macalinao/grill-cli
```

## Quick Start

1. **Initialize your configuration** (optional):

```bash
bunx grill init
```

This creates a `grill.config.mjs` file for customizing code generation.

2. **Generate your client**:

```bash
# Generate client from default paths
bunx grill generate

# Or with custom paths
bunx grill generate --idl ./path/to/idl.json --output ./src/client
```

## Commands

### `grill init`

Initialize a new `grill.config.mjs` configuration file.

```bash
bunx grill init

# Custom config location
bunx grill init --config ./custom/path/grill.config.mjs
```

### `grill generate` (alias: `grill gen`)

Generate a TypeScript client from an Anchor IDL.

```bash
bunx grill generate [options]

Options:
  -i, --idl <path>     Path to Anchor IDL file (default: "./target/idl/program.json")
  -o, --output <path>  Output directory for generated client (default: "./src/generated")
  -c, --config <path>  Path to grill.config.mjs file (default: "./grill.config.mjs")
```

## Configuration

The `grill.config.mjs` file allows you to customize the code generation process:

```javascript
/**
 * @type {import('@macalinao/grill-cli').GrillConfig}
 */
export default {
  // Add custom visitors to transform the Codama tree
  visitors: [
    // Example: Add custom PDAs
    addPdasVisitor({
      name: "myPda",
      seeds: [
        { kind: "constant", value: "my-seed" },
        { kind: "variable", name: "user", type: publicKeyTypeNode() }
      ]
    }),
    
    // Add more visitors as needed
    myCustomVisitor()
  ],
  
  // Future: Output configuration
  output: {
    // Configuration options coming soon
  }
};
```

### Using TypeScript for Configuration

You can also write your config in TypeScript by using the `defineConfig` helper:

```typescript
// grill.config.ts
import { defineConfig } from "@macalinao/grill-cli";
import { addPdasVisitor } from "codama";

export default defineConfig({
  visitors: [
    addPdasVisitor({
      // TypeScript will provide full type safety here
    })
  ]
});
```

## Integration with Package.json

Add scripts to your `package.json` for easy code generation:

```json
{
  "scripts": {
    "codegen": "grill generate",
    "codegen:watch": "grill generate --watch"
  }
}
```

## What Gets Generated

The CLI generates a complete TypeScript client for your Solana program:

- ✅ **Type-safe instruction builders** - Fully typed functions to create instructions
- ✅ **Account decoders** - Decode and deserialize on-chain account data
- ✅ **PDAs (Program Derived Addresses)** - Helper functions for PDA derivation
- ✅ **Error types** - Typed error handling for program errors
- ✅ **ESM-native** - Modern ES modules with `.js` extensions
- ✅ **Account batching ready** - Works seamlessly with @macalinao/grill for automatic account batching

## Example Workflow

1. Build your Anchor program:
```bash
anchor build
```

2. Initialize Grill configuration (optional):
```bash
bunx grill init
```

3. Generate the TypeScript client:
```bash
bunx grill generate
```

4. Use the generated client in your app:
```typescript
import { createTransferInstruction } from "./generated";
import { GrillProvider, useAccount } from "@macalinao/grill";

// Your generated client works seamlessly with Grill's
// automatic account batching and caching features
```

## Advanced Usage

### Custom Visitors

Create custom visitors to transform the Codama tree before code generation:

```javascript
// grill.config.mjs
import { visitRoot } from "codama";

const customVisitor = visitRoot((node) => {
  // Transform the node as needed
  console.log("Processing:", node.name);
  return node;
});

export default {
  visitors: [customVisitor]
};
```

### Multiple IDL Files

Generate clients for multiple programs:

```bash
# Generate main program
bunx grill generate --idl ./target/idl/main.json --output ./src/generated/main

# Generate auxiliary program
bunx grill generate --idl ./target/idl/aux.json --output ./src/generated/aux
```

## Troubleshooting

### IDL Not Found

If you get an "IDL file not found" error, ensure:
1. You've built your Anchor program: `anchor build`
2. The IDL exists at the expected path (default: `./target/idl/program.json`)
3. Or specify the correct path: `grill generate --idl ./path/to/idl.json`

### Config File Issues

If your config file isn't being loaded:
1. Ensure it's named `grill.config.mjs` (note the `.mjs` extension)
2. Or specify the path: `grill generate --config ./custom-config.mjs`
3. Make sure it exports a default configuration object

## License

Apache-2.0