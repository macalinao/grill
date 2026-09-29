import type { UserConfig } from "tsdown";
import pluginBabel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
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

/**
 * As {@link defineGrillConfig}, plus a React Compiler pass over the package's
 * source. For the packages that ship components and hooks: React recommends
 * library authors precompile, so consumers get the memoization whether or not
 * they run the compiler themselves.
 *
 * Uses the compiler's default React 19 target, so compiled output imports `c`
 * from `react/compiler-runtime`, which ships with React 19 itself. Every React
 * package here declares `react: ^19` as a peer.
 */
export const defineGrillReactConfig = (overrides?: UserConfig): UserConfig =>
  defineGrillConfig({
    ...overrides,
    plugins: [
      pluginBabel({
        presets: [reactCompilerPreset()],
      }),
      ...[overrides?.plugins ?? []].flat(),
    ],
  });
