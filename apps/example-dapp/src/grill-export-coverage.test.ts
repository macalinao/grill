/// <reference types="bun-types" />

import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import * as gillExtra from "@macalinao/gill-extra";
import * as grill from "@macalinao/grill";

/**
 * The demo app exists to demonstrate every public export of `@macalinao/grill`.
 * This test keeps that honest: it derives grill's own value exports and asserts
 * each one is actually *imported* by the app.
 *
 * The export set is derived, not hand-maintained. Grill re-exports all of
 * `@macalinao/gill-extra` plus two symbols from `@gillsdk/react`, so subtracting
 * those leaves exactly what grill itself defines. Add an export to grill and
 * this test fails until the demo imports it.
 *
 * Why imports rather than "the name appears somewhere": a name can appear in a
 * comment, a code snippet, or a docs string without anything actually calling
 * it. An import cannot — and because eslint rejects unused imports, an imported
 * symbol is a used symbol.
 *
 * Type-only exports have no runtime presence and cannot be enumerated here.
 * `src/lib/grill-type-coverage.ts` covers those at compile time instead: it
 * references every one, so renaming or deleting a type breaks `tsc -b`.
 */

/** Re-exported from `@gillsdk/react` by grill's `src/index.ts`, not defined by grill. */
const GILLSDK_REEXPORTS = new Set(["SolanaProvider", "useSolanaClient"]);

const SRC_DIR = new URL("./", import.meta.url).pathname;

/** This file itself must not count as a demonstration. */
const SELF = "grill-export-coverage.test.ts";

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }
    if (!/\.tsx?$/.test(entry) || entry === SELF) {
      return [];
    }
    return [path];
  });

/** Everything grill defines itself, as opposed to re-exporting. */
const grillOwnExports = (): string[] =>
  Object.keys(grill)
    .filter((name) => !(name in gillExtra))
    .filter((name) => !GILLSDK_REEXPORTS.has(name))
    .sort();

const IMPORT_FROM_GRILL =
  /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"@macalinao\/grill"/g;

/** Every named specifier the app imports from `@macalinao/grill`. */
const importedFromGrill = (sources: string[]): Set<string> => {
  const imported = new Set<string>();

  for (const source of sources) {
    for (const match of source.matchAll(IMPORT_FROM_GRILL)) {
      for (const specifier of (match[1] ?? "").split(",")) {
        // Handles `useAccount`, `useAccount as useFoo`, and stray whitespace.
        const name = specifier
          .trim()
          .split(/\s+as\s+/)[0]
          ?.trim();
        if (name) {
          imported.add(name);
        }
      }
    }
  }

  return imported;
};

describe("@macalinao/grill export coverage", () => {
  const exports = grillOwnExports();
  const sources = listSourceFiles(SRC_DIR).map((path) =>
    readFileSync(path, "utf8"),
  );
  const imported = importedFromGrill(sources);

  it("derives grill's own exports", () => {
    // If the derivation breaks, the assertion below would pass vacuously.
    expect(exports.length).toBeGreaterThan(30);
    expect(exports).toContain("useAccount");
    expect(exports).toContain("GrillProvider");
    // Symbols grill merely re-exports must have been filtered out.
    expect(exports).not.toContain("formatTokenAmount");
    expect(exports).not.toContain("SolanaProvider");
  });

  it("parses imports out of the demo's source", () => {
    // Likewise: if the parse breaks, everything below is vacuous.
    expect(imported.size).toBeGreaterThan(30);
    expect(imported).toContain("useAccount");
  });

  it("demonstrates every export somewhere in the app", () => {
    const undemonstrated = exports.filter((name) => !imported.has(name));

    expect(undemonstrated).toEqual([]);
  });
});
