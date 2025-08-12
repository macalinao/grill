# Release Process

This document describes how to set up and use the automated release process for Grill packages.

## Prerequisites

### Setting up NPM_TOKEN

The release workflow requires an `NPM_TOKEN` secret to be configured in your GitHub repository to publish packages to npm.

1. **Generate an npm token:**
   - Log in to [npmjs.com](https://www.npmjs.com/)
   - Go to your account settings
   - Navigate to "Access Tokens"
   - Click "Generate New Token"
   - Choose "Automation" token type (for CI/CD)
   - Copy the generated token

2. **Add the token to GitHub:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

## Creating a Release

### 1. Create a Changeset

When you make changes that should be released:

```bash
# Create a changeset for your changes
bun run changeset

# Follow the prompts to:
# - Select which packages have changed
# - Choose the version bump type (patch/minor/major)
# - Write a summary of changes
```

This creates a changeset file in `.changeset/` that describes your changes.

### 2. Commit the Changeset

```bash
git add .changeset/
git commit -m "chore: add changeset for [feature/fix description]"
git push
```

### 3. Automated Release Process

When changesets are pushed to the main branch:

1. **GitHub Actions creates a "Version Packages" PR** that:
   - Updates package versions based on changesets
   - Updates CHANGELOG.md files
   - Removes processed changeset files

2. **Review and merge the Version Packages PR**
   - Check that versions are correct
   - Review the changelog entries
   - Merge when ready to release

3. **Packages are automatically published to npm**
   - After merging, the release workflow runs
   - Builds all packages
   - Publishes to npm using the NPM_TOKEN
   - Creates git tags for each released package

## Manual Release (Not Recommended)

If you need to manually release:

```bash
# Version packages based on changesets
bun run ci:version

# Build all packages
bun run build

# Publish to npm (requires npm authentication)
bun run ci:publish
```

## Workflow Files

The release process uses these GitHub Actions workflows:

- **`.github/workflows/ci.yml`** - Runs tests, linting, and builds on every push/PR
- **`.github/workflows/release.yml`** - Handles versioning and publishing packages
- **`.github/workflows/validate-publish.yml`** - Validates package configurations on PRs

## Troubleshooting

### NPM_TOKEN Issues

If packages fail to publish with authentication errors:
- Verify the NPM_TOKEN secret is set correctly
- Check that the token hasn't expired
- Ensure the token has publish permissions for the package scope

### Build Failures

If the build fails before publishing:
- Run `bun run build` locally to reproduce issues
- Check TypeScript errors with `bun run typecheck`
- Ensure all dependencies are installed with `bun install`

### Version Conflicts

If you get version conflict errors:
- Pull the latest changes from main
- Regenerate changesets if needed
- Ensure no duplicate changesets exist

## Package Configuration

Each package must have proper configuration for publishing:

```json
{
  "name": "@macalinao/package-name",
  "version": "0.1.0",
  "publishConfig": {
    "access": "public"
  },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.0.x): Bug fixes, dependency updates
- **Minor** (0.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## Questions?

For issues with the release process, check:
1. GitHub Actions logs for detailed error messages
2. The [Changesets documentation](https://github.com/changesets/changesets)
3. Open an issue in the repository for help