import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactNativePlugin from "eslint-plugin-react-native";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-native": reactNativePlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // not needed with the new JSX transform
      "react/prop-types": "off", // TypeScript already covers this
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Plain Node.js files — config files, scripts, and E2E specs (which
    // run under Node via Playwright, not in a browser).
    files: [
      "**/*.mjs",
      "**/*.cjs",
      "**/babel.config.js",
      "**/metro.config.js",
      "**/playwright.config.ts",
      "**/vitest.config.ts",
      "**/e2e/**/*.ts",
      "scripts/**/*.mjs",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    // Packages that read process.env at module load — these run in
    // whatever environment imports them (native/web/Node test runner),
    // so process.env needs to resolve without being a lint error even
    // though this isn't a Node-only file in the same sense as above.
    files: ["packages/env/src/**/*.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
  prettierConfig,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.expo/**",
      "**/e2e/.auth/**",
      "**/test-results/**",
      "packages/types/src/database.ts",
    ],
  },
];
