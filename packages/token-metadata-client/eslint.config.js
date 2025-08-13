import { configs } from "@macalinao/eslint-config";

export default [
  ...configs.fast,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/generated/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
    },
  },
  {
    files: [
      "src/generated/instructions/*.ts",
      "src/generated/types/*.ts",
      "src/generated/errors/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-constant-condition": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
