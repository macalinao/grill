# @macalinao/codama-cli

Generate TypeScript clients for Solana programs from Anchor IDLs. Zero config, ESM-native.

## Installation

```bash
bun add -D @macalinao/codama-cli
```

## Usage

```bash
# Generate client from default paths
bunx codama generate

# Custom IDL and output
bunx codama generate --idl ./idl.json --output ./src/client
```

Default paths:
- IDL: `./target/idl/program.json`
- Output: `./src/generated`

## Configuration (optional)

Add custom transformations with `codama.config.mjs`:

```javascript
import { defineConfig } from "@macalinao/codama-cli";
import { addPdasVisitor } from "codama";

export default defineConfig({
  visitors: [
    // Add custom PDAs or other transformations
    addPdasVisitor({ /* ... */ })
  ]
});
```

## Package.json Script

```json
{
  "scripts": {
    "codegen": "codama generate"
  }
}
```

## What Gets Generated

- ✅ Type-safe instruction builders
- ✅ Account decoders
- ✅ PDAs (Program Derived Addresses)
- ✅ Error types
- ✅ ESM-compatible imports with `.js` extensions

## License

Apache-2.0