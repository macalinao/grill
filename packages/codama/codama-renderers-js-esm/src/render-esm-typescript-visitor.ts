import type { RenderMap } from "@codama/renderers-core";
import { getRenderMapVisitor } from "@codama/renderers-js";
import { rootNodeVisitor, visit } from "codama";
import { ESM_DEPENDENCY_MAP } from "./constants.js";

function modifyFile(
  renderMap: RenderMap,
  relativePath: string,
  fn: (code: string) => string,
): void {
  const code = renderMap.get(relativePath);
  renderMap.add(relativePath, fn(code));
}

/**
 * Codama visitor for rendering the code to be TypeScript compatible.
 * @param path
 * @returns
 */
export function renderESMTypeScriptVisitor(
  path: string,
): ReturnType<typeof rootNodeVisitor> {
  return rootNodeVisitor((root) => {
    // Render the new files.
    const renderMap = visit(
      root,
      getRenderMapVisitor({
        dependencyMap: ESM_DEPENDENCY_MAP,
      }),
    );

    const index = renderMap.get("index.ts");
    renderMap.add(
      "index.ts",
      index.replace(
        /(export\s+\*\s+from\s+['"])(\.\/[^'"]+)(['"])/g,
        (_, prefix, path, quote) =>
          `${prefix as string}${path as string}/index.js${quote as string}`,
      ),
    );

    modifyFile(renderMap, "shared/index.ts", (code) => {
      return code
        .replaceAll(
          "if (value == null) {",
          "if (value === null || value === undefined) {",
        )
        .replaceAll("return value[0]", "return value[0] as Address<T>");
    });

    renderMap.mapContent((code) => {
      const updated = code
        .replace(/= 0x([\da-f]+), \/\//g, "= 0x$1; //")
        .replaceAll("process.env.NODE_ENV !== 'production'", "true")
        .replaceAll(
          "const accountMeta = instruction.accounts![accountIndex]!;",
          "const accountMeta = (instruction.accounts as TAccountMetas)[accountIndex]!;",
        )
        .replace(
          /(export\s+\*\s+from\s+['"])(\.\/[^'"]+?)(?<!\.(js|ts|mjs|cjs|json))(['"])/g,
          (_, prefix, path) => `${prefix as string}${path as string}.js'`,
        )
        .replace(/from\s+['"]\.['"]/g, 'from "./index.js"');

      return updated;
    });

    renderMap.write(path);
  });
}
