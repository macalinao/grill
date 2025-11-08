import { configs } from "@macalinao/eslint-config-vite";

export default [
  ...configs.viteFull,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
