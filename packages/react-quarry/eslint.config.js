import { configs } from "@macalinao/eslint-config-react";

export default [
  ...configs.reactFast,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          allowDefaultProject: [
            "eslint.config.*",
            "tailwind.config.*",
            "tsdown.config.*",
          ],
        },
      },
    },
  },
];
