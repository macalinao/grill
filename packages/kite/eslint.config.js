import { configs } from "@macalinao/eslint-config-react";

export default [
  ...configs.reactFast,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
