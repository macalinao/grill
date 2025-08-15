# @macalinao/token-metadata-client

[![npm version](https://img.shields.io/npm/v/@macalinao/token-metadata-client.svg)](https://www.npmjs.com/package/@macalinao/token-metadata-client)

TypeScript client for the Metaplex Token Metadata program, generated using Codama with full ESM support.

## Installation

```bash
bun add @macalinao/token-metadata-client
```

## Development

This client is generated from the Token Metadata IDL using Codama CLI:

```bash
# Generate the client from idls/token_metadata.json
bun run codegen

# Build the TypeScript
bun run build
```

### Configuration

The `codama.config.mjs` file adds custom PDAs to the generated client, including the standard metadata PDA derivation.

## Usage

```typescript
import { /* generated exports */ } from "@macalinao/token-metadata-client";

// Use the generated client functions
```

## License

Apache-2.0