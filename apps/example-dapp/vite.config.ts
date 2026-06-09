import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // nodePolyfills({
    //   globals: {
    //     Buffer: true,
    //     process: true,
    //   },
    //   protocolImports: true, // Polyfill node: protocol imports
    // }),
    tsconfigPaths(),
    react(),
    tanstackRouter({
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.gen.ts",
      addExtensions: true,
      quoteStyle: "double",
    }),
    tailwindcss(),
  ],
  define: {
    "process.env": {},
  },
});
