#!/usr/bin/env bash
set -e

echo "Publishing packages in dependency order..."

# First, publish packages/codama/* (lowest level dependencies)
echo "Publishing codama packages..."
for dir in packages/codama/*; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    if ! grep -q '"private": true' "$dir/package.json"; then
      echo "Publishing $(basename "$dir")..."
      (cd "$dir" && bun publish --access public) || echo "Failed to publish $(basename "$dir"), continuing..."
    fi
  fi
done

# Then, publish packages/clients/* (depends on codama)
echo "Publishing client packages..."
for dir in packages/clients/*; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    if ! grep -q '"private": true' "$dir/package.json"; then
      echo "Publishing $(basename "$dir")..."
      (cd "$dir" && bun publish --access public) || echo "Failed to publish $(basename "$dir"), continuing..."
    fi
  fi
done

# Finally, publish packages/* (top level, may depend on clients)
echo "Publishing top-level packages..."
for dir in packages/*; do
  # Skip subdirectories we already processed
  if [ "$dir" != "packages/codama" ] && [ "$dir" != "packages/clients" ]; then
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
      if ! grep -q '"private": true' "$dir/package.json"; then
        echo "Publishing $(basename "$dir")..."
        (cd "$dir" && bun publish --access public) || echo "Failed to publish $(basename "$dir"), continuing..."
      fi
    fi
  fi
done

# Tag the release in git
echo "Creating git tags..."
changeset tag

echo "Publishing complete!"