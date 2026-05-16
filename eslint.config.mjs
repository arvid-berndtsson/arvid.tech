import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const compat = new FlatCompat();

const eslintConfig = [
  {
    ignores: [
      ".astro/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "*.config.*",
    ],
  },
  ...compat.config({
    extends: ["prettier"],
    rules: {
      // Disallow eval and similar patterns that break strict CSP
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  }),
  eslintConfigPrettier,
];

export default eslintConfig;
