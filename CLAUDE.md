# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grill is a modern Solana development kit monorepo that provides React components and utilities for building Solana applications with automatic account batching and caching. It's built on top of @gillsdk/react and integrates with @solana/kit.

## Technology Stack

- **Package Manager**: Bun (v1.3.6)
- **Build System**: Turbo v2 for monorepo orchestration
- **Framework**: React 18/19 with TypeScript 5.9
- **Solana**: @solana/kit, gill, @gillsdk/react
- **State Management**: @tanstack/react-query for caching
- **Routing**: @tanstack/react-router (in example-dapp)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (in example-dapp)
- **Code Quality**: Biome for formatting/linting, ESLint for additional linting, ast-grep for pattern enforcement
- **Testing**: Bun Test via `bun run test`

## Essential Commands

```bash
# Development
bun install                  # Install all dependencies
bun run build                # Build all packages
bun run build:packages       # Build only packages (not apps)
bun run build:watch          # Watch mode for all packages
bun run build:watch:packages # Watch mode for packages only

# Code Quality
bun run lint                 # Run biome check + ast-grep scan + eslint
bun run lint:fix             # Fix linting issues

# Testing
bun run test                 # Run all tests

# Package Publishing
bun run changeset            # Create changeset for version bumps
bun run ci:version           # Version packages and update lockfile
bun run ci:publish           # Publish packages to npm

# Code Generation
bun run codegen              # Run codegen tasks (turbo)

# Example App Development
cd apps/example-dapp
bun run dev                  # Start Vite dev server
bun run build                # Build the app

# IMPORTANT: After making code changes
bun run build                # Build to check for TypeScript errors
bun run lint:fix             # Fix linting and formatting issues
```

## Architecture

### Monorepo Structure

The project uses Bun workspaces with packages in two directories:

- `packages/*` - Core library packages (9 packages)
- `apps/*` - Example applications (1 app)

### Core Packages

1. **@macalinao/grill** - Main package providing React context and hooks
   - `GrillProvider`: Creates DataLoader for batching account requests with sonner toast notifications
   - `GrillHeadlessProvider`: Headless version without UI features (for custom implementations)
   - `WalletProvider`: Kit wallet integration context
   - `SubscriptionProvider`: WebSocket subscription support for real-time account updates
   - Key hooks: `useAccount`, `useTokenInfo`, `useTokenBalance`, `useAssociatedTokenAccount`, `useSendTx`
   - Note: sonner is a required peer dependency for transaction toast notifications

2. **@macalinao/solana-batch-accounts-loader** - DataLoader implementation for batching Solana account fetches
   - Batches up to 99 accounts in a single RPC call (respects Solana RPC limits)
   - Uses `fetchEncodedAccounts` from @solana/kit

3. **@macalinao/wallet-adapter-compat** - Compatibility layer between @solana/wallet-adapter and @solana/kit
   - Enables wallet adapter ecosystem support with modern @solana/kit APIs

4. **@macalinao/dataloader-es** - ES module-native TypeScript implementation of the DataLoader pattern
   - Modern alternative to classic DataLoader

5. **@macalinao/gill-extra** - Additional utilities for gill
   - Exports: `fetchAndDecodeAccount`, `fetchTokenInfo`, transaction utilities, explorer helpers
   - No React dependencies

6. **@macalinao/zod-solana** - Zod schemas for Solana types with @solana/kit integration
   - Provides validation schemas for Solana addresses, tokens, amounts, etc.

7. **@macalinao/quarry** - Quarry utility functions for Solana DeFi
   - Functions for merge pool, miner, and rewarder operations

8. **@macalinao/react-quarry** - React hooks for Quarry protocol
   - Depends on @macalinao/grill

9. **@macalinao/token-utils** - Token utility functions for Solana development
   - Includes dnum library for precise decimal number handling

### Provider Hierarchy

When using Grill, providers must be set up in this order:

```tsx
QueryClientProvider
  -> SolanaProvider (@gillsdk/react)
    -> ConnectionProvider (@solana/wallet-adapter-react)
      -> WalletProvider (@solana/wallet-adapter-react)
        -> WalletModalProvider
          -> GrillProvider (or GrillHeadlessProvider)
```

### Account Batching Architecture

The core innovation is automatic batching of concurrent account requests:

- Multiple `useAccount` calls in different components are automatically batched
- Uses DataLoader pattern to coalesce requests within a tick (default 10ms)
- Single RPC call instead of multiple (up to 99 accounts per batch)
- Integrated with React Query for caching

### Kit Wallet Integration

Provides two contexts:

1. Account batching context (GrillProvider)
2. Wallet context for TransactionSendingSigner (WalletProvider from grill)

## Code Style Guidelines

### TypeScript

- Use specific types, avoid `any`
- Prefer interfaces over type aliases for objects
- Use `import type` for type-only imports (enforced by Biome)
- Arrays use shorthand syntax: `string[]` not `Array<string>`
- **Use double quotes for strings** (not single quotes)

### After Making Code Changes

**Always run these commands to ensure code quality:**

1. `bun run build` - Check for TypeScript errors
2. `bun run lint:fix` - Fix linting and formatting issues

### React Components

- Small, focused components
- Use function components with hooks
- Props interfaces should be explicitly defined

### Biome/ESLint Configuration

- No floating promises (must be handled)
- Use const assertions where applicable
- No non-null assertions are allowed
- Simplified logic expressions required
- No double equals (use === instead)
- Imports are auto-organized on save

### AST-grep Rules

The project uses ast-grep for pattern enforcement:
- Configuration in `sgconfig.yml` and `.ast-grep/rules/`
- Example: Enforces namespace imports for Zod (`import * as zod from "zod"`)

## Example App (example-dapp)

The example-dapp demonstrates:

- TanStack Router for routing (file-based)
- shadcn/ui component integration with Radix UI
- Wallet connection with Solana wallet adapter
- Layout system with navigation and sidebar
- Dark mode support
- React Hook Form with Zod validation

## Turborepo Configuration

Tasks are defined in turbo.json:

- `build`: Depends on upstream builds, outputs to `./dist/**`
- `lint`: Depends on upstream builds
- `test`: Depends on build, no caching
- `codegen`: For code generation tasks
- Tasks run in topological order respecting dependencies

## Working with Providers

When creating new features that need account data:

1. Ensure component is wrapped in GrillProvider
2. Use `useAccount` hook for fetching account data
3. Account requests are automatically batched
4. React Query handles caching and refetching

## Vendor Documentation

The repository includes vendor documentation at `/docs/vendor/`:

- `gill.md` - Complete documentation for the gill library (Solana client library)
  - Includes transaction builders, token operations, and program clients
  - Used as the foundation for Solana operations in Grill

## CI/CD

GitHub Actions workflow runs on push/PR to master:

- Installs dependencies with frozen lockfile
- Builds all packages
- Runs linting (biome + ast-grep + eslint)
- Runs tests

Release workflow handles versioning and publishing via changesets.

## Publishing Workflow

1. Create changeset: `bun run changeset`
2. Version packages: `bun run ci:version`
3. Publish to npm: `bun run ci:publish`
4. Changesets handle version bumping and changelog generation

## Package Structure Guidelines

When creating new packages:

- Use TypeScript directly with `tsc` for building (no tsup/rollup/etc)
- Follow the same structure as existing packages
- Scripts should be: `build`, `build:watch`, `clean`, `typecheck`
- All packages use ES modules (`"type": "module"` in package.json)
- Keep package.json scripts simple and consistent
- Use workspace catalogs for shared dependency versions

## Solana PDA Guidelines

When working with PDAs (Program Derived Addresses) in React code (e.g., in react-quarry):

- **Use PDA hooks** from the pdas directory (e.g., `useMergePoolPda`, `useMinerPda`)
- **Avoid computing PDAs manually** in React components or providers
- PDA hooks are synchronous and properly memoized for React
- This ensures consistent PDA computation and proper React lifecycle management
