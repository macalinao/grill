# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grill is a modern Solana development kit monorepo that provides React components and utilities for building Solana applications with automatic account batching and caching. It's built on top of gill-react and integrates with @solana/kit.

## Technology Stack

- **Package Manager**: Bun (v1.2.19)
- **Build System**: Turbo for monorepo orchestration
- **Framework**: React 19 with TypeScript
- **Solana**: @solana/kit, gill, gill-react
- **State Management**: @tanstack/react-query for caching
- **Routing**: @tanstack/react-router (in example-dapp)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Code Quality**: Biome for formatting, ESLint for linting
- **Testing**: Vitest

## Essential Commands

```bash
# Development
bun install                  # Install all dependencies
bun run build                # Build all packages
bun run build:watch          # Watch mode for all packages
bun run build:watch:packages # Watch mode for packages only

# Code Quality
bun run lint                 # Run biome check + eslint
bun run lint:fix            # Fix linting issues
biome check --write         # Format with biome

# Testing
bun run test                # Run all tests
bun test                    # Run tests directly

# Package Publishing
bun run changeset           # Create changeset for version bumps
bun run ci:publish          # Publish packages to npm

# Example App Development
cd apps/example-dapp
bun run dev                 # Start Vite dev server
bun run build              # Build the app
```

## Architecture

### Monorepo Structure

The project uses Bun workspaces with packages in two directories:
- `packages/*` - Core library packages
- `apps/*` - Example applications

### Core Packages

1. **@macalinao/grill** - Main package providing React context and hooks
   - `GrillProvider`: Creates DataLoader for batching account requests
   - `WalletProvider`: Kit wallet integration context
   - `useAccount`: Hook for fetching account data with batching
   - `useKitWallet`: Access wallet signer and RPC

2. **@macalinao/solana-batch-accounts-loader** - DataLoader implementation for batching Solana account fetches

3. **@macalinao/wallet-adapter-compat** - Compatibility layer between @solana/wallet-adapter and @solana/kit

4. **dataloader-es** - ES module compatible DataLoader implementation

### Provider Hierarchy

When using Grill, providers must be set up in this order:
```tsx
QueryClientProvider
  → SolanaProvider (gill-react)
    → ConnectionProvider (@solana/wallet-adapter-react)
      → WalletProvider (@solana/wallet-adapter-react)
        → WalletModalProvider
          → GrillProvider
```

### Account Batching Architecture

The core innovation is automatic batching of concurrent account requests:
- Multiple `useAccount` calls in different components are automatically batched
- Uses DataLoader pattern to coalesce requests within a tick
- Single RPC call instead of multiple, improving performance
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
- Follow default Prettier settings

### React Components
- Small, focused components
- Use function components with hooks
- Props interfaces should be explicitly defined
- File structure: `components/category/component-name/index.tsx`

### Biome/ESLint Configuration
- No floating promises (must be handled)
- Use const assertions where applicable
- No non-null assertions are allowed
- Simplified logic expressions required
- No double equals (use === instead)
- Imports are auto-organized on save

## Example App (example-dapp)

The example-dapp demonstrates:
- TanStack Router for routing
- shadcn/ui component integration
- Wallet connection with Solana wallet adapter
- Layout system with navigation and sidebar
- Dark mode support

Routes:
- `/` - Home page
- `/dashboard` - Simple dashboard
- `/examples/*` - Examples section with sidebar navigation

## Turborepo Configuration

Tasks are defined in turbo.json:
- `build`: Depends on upstream builds, outputs to `./dist/**`
- `lint`: Depends on upstream builds
- `test`: Depends on build, no caching
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
- Runs linting (biome + eslint)
- Runs tests
- Checks TypeScript compilation

## Publishing Workflow

1. Create changeset: `bun run changeset`
2. Version packages: `bun run ci:version`
3. Publish to npm: `bun run ci:publish`
4. Changesets handle version bumping and changelog generation