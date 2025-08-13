# @macalinao/codama-cli

Zero-config CLI for generating clients for Solana programs. This CLI provides a simple, batteries-included approach to generate TypeScript clients from Anchor IDLs with full ESM support.

## Features

- 🚀 **Zero Configuration**: Works out of the box with sensible defaults
- 📦 **ESM Native**: Generates modern ESM-compatible TypeScript code
- 🔧 **Extensible**: Support for custom visitors via configuration file
- 🎯 **Type Safe**: Full TypeScript support with strict typing
- ⚡ **Fast**: Optimized code generation pipeline

## Installation

```bash
bun add -D @macalinao/codama-cli
```

## Quick Start

Generate a client from your Anchor IDL:

```bash
# Using default paths
bunx codama generate

# With custom paths
bunx codama generate --idl ./idl/my_program.json --output ./src/client
```

## Usage

### Basic Usage

By default, the CLI looks for an IDL at `./target/idl/program.json` and generates the client to `./src/generated`:

```bash
bunx codama generate
```

### Custom Paths

Specify custom input and output paths:

```bash
bunx codama generate \
  --idl ./path/to/idl.json \
  --output ./path/to/output
```

### Configuration File

For advanced customization, create a `codama.config.mjs` file in your project root:

```javascript
// codama.config.mjs
import { defineConfig } from "@macalinao/codama-cli";
import { setInstructionAccountDefaultValuesVisitor } from "@codama/visitors";

export default defineConfig({
  visitors: [
    // Add custom visitors to transform the generated code
    setInstructionAccountDefaultValuesVisitor([
      {
        account: "systemProgram",
        defaultValue: "SystemProgram.programId",
      },
    ]),
  ],
});
```

## CLI Options

```
Options:
  -i, --idl <path>     Path to the Anchor IDL file (default: "./target/idl/program.json")
  -o, --output <path>  Output directory for generated client (default: "./src/generated")
  -c, --config <path>  Path to codama.config.mjs file (default: "./codama.config.mjs")
  -h, --help          Display help for command
```

## Configuration

The configuration file allows you to customize the code generation process by adding custom visitors that transform the Codama nodes before code generation.

### Visitors

Visitors are functions that traverse and transform the Codama node tree. You can use built-in visitors from `@codama/visitors` or create your own:

```javascript
import { defineConfig } from "@macalinao/codama-cli";
import { rootNodeVisitor, visit } from "codama";

const myCustomVisitor = () => {
  return rootNodeVisitor((node) => {
    // Transform the node tree
    return node;
  });
};

export default defineConfig({
  visitors: [myCustomVisitor()],
});
```

## Generated Code

The CLI generates:

- Type-safe instruction builders
- Account structures and decoders
- Program-derived addresses (PDAs)
- Error definitions
- Full ESM compatibility with `.js` extensions

## Integration with Build Tools

Add to your `package.json` scripts:

```json
{
  "scripts": {
    "generate": "codama generate",
    "build": "bun run generate && tsc"
  }
}
```

## License

Apache-2.0