#!/usr/bin/env bash
set -e

# Publishing uses npm OIDC trusted publishing (no NPM_TOKEN required).
#
# bun publish does not support OIDC trusted publishing yet
# (https://github.com/oven-sh/bun/issues/22423), so we pack each package with
# `bun pm pack` -- which rewrites the `catalog:` and `workspace:` protocols to
# concrete versions in the tarball -- and then publish the resulting tarball
# with `npm publish`, which supports OIDC and auto-generates provenance.
#
# Requires: npm >= 11.5.1 and `id-token: write` permission in the workflow, plus
# a trusted publisher configured for each package on npmjs.com.
#
# Every package is packed and published on every run, not just the ones changesets
# bumped. That is deliberate: a package whose version is already on the registry
# is simply skipped, so a release that failed to publish half way through is
# retried and healed by the next run. It does mean "already published" is the
# normal outcome for most packages, which is why the errors below are classified
# rather than ignored.

echo "Publishing packages via npm OIDC trusted publishing..."

PACK_DIR="$(mktemp -d)"

echo "Packing publishable packages..."
for dir in packages/*; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    if ! grep -q '"private": true' "$dir/package.json"; then
      echo "Packing $(basename "$dir")..."
      # bun pm pack resolves catalog:/workspace: protocols to concrete versions
      (cd "$dir" && bun pm pack --destination "$PACK_DIR")
    fi
  fi
done

echo "Publishing tarballs to npm..."

published=()
skipped=()
failed=()

for tarball in "$PACK_DIR"/*.tgz; do
  name="$(basename "$tarball")"
  echo "Publishing $name..."

  # A non-zero exit is expected for any package changesets did not bump this run,
  # so the output is captured and classified instead of being discarded. Only an
  # "already published" error is benign; anything else is a real failure.
  if output="$(npm publish "$tarball" --access public 2>&1)"; then
    echo "$output"
    published+=("$name")
  elif grep -qF "cannot publish over the previously published versions" <<<"$output"; then
    echo "  already on the registry, nothing to do"
    skipped+=("$name")
  else
    echo "$output"
    failed+=("$name")
  fi
done

echo
echo "published: ${#published[@]}, already up to date: ${#skipped[@]}, failed: ${#failed[@]}"
for name in "${published[@]}"; do echo "  published  $name"; done
for name in "${failed[@]}"; do echo "  FAILED     $name"; done

if [ "${#failed[@]}" -gt 0 ]; then
  cat >&2 <<'EOF'

One or more packages failed to publish.

A 404 from the registry means the OIDC identity was not authorized to publish
that package. The two usual causes:

  - the package has no trusted publisher configured on npmjs.com, or
  - the package has never been published at all. OIDC cannot publish a package's
    first version -- npm requires the package to already exist before a trusted
    publisher can be attached to it (https://github.com/npm/cli/issues/8544).
    Publish the first version manually, then configure the trusted publisher.
EOF
  exit 1
fi

# Only tag once every package is actually on the registry, so tags never claim a
# release that did not happen. A failed run is retried in full by the next one.
echo "Creating git tags..."
changeset tag

echo "Publishing complete!"
