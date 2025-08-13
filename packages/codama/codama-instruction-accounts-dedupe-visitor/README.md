# @macalinao/codama-instruction-accounts-dedupe-visitor

Codama visitor for deduplicating and flattening instruction accounts from Anchor IDL. This package helps handle nested account structures in Anchor programs by flattening them into a single-level structure with properly prefixed names.

## Why This Package Exists

Anchor IDL supports nested account structures where accounts can be grouped together. When converting these to Codama nodes, the nested structure needs to be flattened while preserving the relationship through naming conventions. This visitor:

1. **Flattens Nested Accounts**: Converts nested account groups into flat structures
2. **Preserves Relationships**: Uses underscore-separated naming to maintain parent-child relationships
3. **Updates PDA Seeds**: Properly adjusts PDA seed references when accounts are flattened
4. **Maintains Type Safety**: Ensures all account references remain valid after flattening

## Installation

```bash
bun add @macalinao/codama-instruction-accounts-dedupe-visitor
```

## Usage

```typescript
import { instructionAccountsDedupeVisitor } from "@macalinao/codama-instruction-accounts-dedupe-visitor";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { visit } from "codama";

// Your Anchor IDL
const idl = /* your anchor IDL */;

// Create the root node from Anchor IDL
const root = rootNodeFromAnchor(idl);

// Apply the dedupe visitor
const visitor = instructionAccountsDedupeVisitor(idl);
const deduplicatedRoot = visit(root, visitor);
```

## How It Works

The visitor transforms nested account structures by:

1. **Traversing Account Groups**: Recursively processes nested account groups
2. **Prefixing Names**: Joins parent and child names with underscores
3. **Adjusting PDA Seeds**: Updates seed paths to match the flattened structure
4. **Preserving All Metadata**: Maintains all account properties and constraints

### Example Transformation

**Before (Nested Structure)**:
```typescript
{
  name: "mintAccounts",
  accounts: [
    { name: "mint", ... },
    { name: "metadata", ... }
  ]
}
```

**After (Flattened Structure)**:
```typescript
[
  { name: "mintAccounts_mint", ... },
  { name: "mintAccounts_metadata", ... }
]
```

## License

MIT