/**
 * Prettier configuration
 * - Ensures MDX uses the MDX parser and preserves prose wrapping
 * - Disables embedded language formatting inside MDX to avoid rewriting JSX blocks
 */

/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  overrides: [
    {
      files: "*.mdx",
      options: {
        parser: "mdx",
        proseWrap: "preserve",
        embeddedLanguageFormatting: "off",
      },
    },
    {
      files: "*.md",
      options: { proseWrap: "preserve" },
    },
  ],
};

export default config;
