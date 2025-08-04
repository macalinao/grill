import { configs } from "@macalinao/eslint-config-react";

export default [
  ...configs.reactFull,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];