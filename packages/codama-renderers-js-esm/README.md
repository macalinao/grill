# @macalinao/codama-renderers-js-esm

[![npm version](https://img.shields.io/npm/v/@macalinao/codama-renderers-js-esm.svg)](https://www.npmjs.com/package/@macalinao/codama-renderers-js-esm)

ESM-native TypeScript renderer for [Codama](https://github.com/codama-idl/codama) JavaScript code generation. This package extends `@codama/renderers-js` to produce fully ESM-compatible TypeScript/JavaScript code.

## Why This Package Exists

While `@codama/renderers-js` generates excellent TypeScript code for Solana programs, the generated output uses CommonJS-style imports that may not work correctly in pure ESM environments. This package addresses several key issues:

1. **ESM Module Resolution**: Adds `.js` extensions to all relative imports, which is required for proper ESM module resolution
2. **TypeScript ESM Compatibility**: Ensures generated TypeScript code works correctly with `"type": "module"` in package.json
3. **Production-Ready Code**: Removes Node.js-specific environment checks that may not work in all JavaScript runtimes
4. **Type Safety Improvements**: Enhances type assertions and null checks for better TypeScript strictness

## Installation

```bash
bun add @macalinao/codama-renderers-js-esm
```

## Usage

Use this visitor in place of the standard Codama JavaScript renderer when you need ESM-compatible output:

```typescript
import { renderESMTypeScriptVisitor } from "@macalinao/codama-renderers-js-esm";
import { rootNode } from "codama";

// Your Codama root node (typically from parsing an IDL)
const root = rootNode(/* ... */);

// Generate ESM-compatible TypeScript code
const visitor = renderESMTypeScriptVisitor("./src/generated");
visit(root, visitor);
```

## How It Works

This package wraps `@codama/renderers-js`'s `getRenderMapVisitor` and applies a series of transformations to ensure ESM compatibility:

### 1. Custom Dependency Map

The package provides an ESM-specific dependency map that ensures all internal imports use `.js` extensions:

```typescript
{
  errors: "../errors/index.js",
  generatedAccounts: "../accounts/index.js",
  generatedInstructions: "../instructions/index.js",
  // ... etc
}
```

### 2. Import Path Transformations

- Adds `.js` extensions to all relative imports without extensions
- Converts bare directory imports to explicit `index.js` imports
- Maintains compatibility with TypeScript's module resolution

### 3. Code Improvements

- Replaces loose null checks (`value == null`) with strict checks (`value === null || value === undefined`)
- Fixes type assertions for better type safety
- Removes Node.js-specific environment checks for universal JavaScript compatibility

## Differences from @codama/renderers-js

| Feature | @codama/renderers-js | @macalinao/codama-renderers-js-esm |
|---------|----------------------|-------------------------------------|
| Module Format | CommonJS-compatible | Pure ESM |
| Import Extensions | No extensions | `.js` extensions |
| TypeScript Config | Standard | ESM-native |
| Runtime Checks | Node.js-specific | Universal |
| Null Checks | Loose (`==`) | Strict (`===`) |

## Example Output

### Before (Standard Renderer)
```typescript
import { Address } from "@solana/web3.js";
import { SomeType } from "./types";
export * from "./accounts";
```

### After (ESM Renderer)
```typescript
import { Address } from "@solana/web3.js";
import { SomeType } from "./types/index.js";
export * from "./accounts/index.js";
```

## Requirements

- Node.js 18+ or Bun
- TypeScript 5.0+ (for generated code)
- Package.json with `"type": "module"`

## License

MIT