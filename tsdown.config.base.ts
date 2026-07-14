import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

/**
 * Shared tsdown build config for every publishable package in the monorepo.
 *
 * Builds are unbundled, so `dist/` mirrors `src/` file-for-file and the
 * `exports` paths in each package.json keep resolving without a bundler.
 */
export const defineGrillConfig = (overrides?: UserConfig): UserConfig =>
  defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["esm"],
    platform: "neutral",
    unbundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    ...overrides,
  });
