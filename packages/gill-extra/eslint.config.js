import { configs } from "@macalinao/eslint-config";

export default [
  ...configs.fast,
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
