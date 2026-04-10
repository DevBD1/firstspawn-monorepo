/**
 * Prettier configuration for FirstSpawn monorepo
 * @see https://prettier.io/docs/configuration
 */

/** @type {import("prettier").Config} */
const config = {
  // General formatting
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",

  // Overrides for specific file types
  overrides: [
    {
      files: "*.md",
      options: {
        printWidth: 80,
        proseWrap: "always",
        tabWidth: 2,
      },
    },
    {
      files: "*.{yml,yaml}",
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: "*.json",
      options: {
        tabWidth: 2,
      },
    },
  ],
};

export default config;
