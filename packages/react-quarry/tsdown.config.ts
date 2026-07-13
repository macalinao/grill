import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  platform: "neutral",
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
});
