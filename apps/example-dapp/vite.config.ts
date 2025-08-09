// @ts-expect-error something wrong with types here
import tailwindcss from "@tailwindcss/vite";
// @ts-expect-error something wrong with types here
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackRouter({
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.gen.ts",
      addExtensions: true,
      quoteStyle: "double",
    }),
    react(),
    tailwindcss(),
    nodePolyfills(),
  ],
  define: {
    "process.env": {},
  },
});
