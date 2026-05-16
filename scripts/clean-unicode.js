#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Auto-fix characters that should always be removed.
const autoFixChars = [
  { name: "Word Joiner", code: "\u2060", hex: "U+2060", replacement: "" },
  {
    name: "Zero Width Non-Joiner",
    code: "\u200C",
    hex: "U+200C",
    replacement: "",
  },
  { name: "Zero Width Joiner", code: "\u200D", hex: "U+200D", replacement: "" },
  { name: "Zero Width Space", code: "\u200B", hex: "U+200B", replacement: "" },
  {
    name: "Zero Width No-Break Space",
    code: "\uFEFF",
    hex: "U+FEFF",
    replacement: "",
  },
  {
    name: "Left-to-Right Mark",
    code: "\u200E",
    hex: "U+200E",
    replacement: "",
  },
  {
    name: "Right-to-Left Mark",
    code: "\u200F",
    hex: "U+200F",
    replacement: "",
  },
  { name: "Soft Hyphen", code: "\u00AD", hex: "U+00AD", replacement: "" },
  {
    name: "Narrow No-Break Space",
    code: "\u202F",
    hex: "U+202F",
    replacement: "",
  },
  {
    name: "Medium Mathematical Space",
    code: "\u205F",
    hex: "U+205F",
    replacement: "",
  },
  { name: "Ideographic Space", code: "\u3000", hex: "U+3000", replacement: "" },
  { name: "Hair Space", code: "\u200A", hex: "U+200A", replacement: "" },
  { name: "Thin Space", code: "\u2009", hex: "U+2009", replacement: "" },
  { name: "Punctuation Space", code: "\u2008", hex: "U+2008", replacement: "" },
  { name: "Six-Per-Em Space", code: "\u2006", hex: "U+2006", replacement: "" },
  { name: "Four-Per-Em Space", code: "\u2005", hex: "U+2005", replacement: "" },
  {
    name: "Three-Per-Em Space",
    code: "\u2004",
    hex: "U+2004",
    replacement: "",
  },
  { name: "Figure Space", code: "\u2007", hex: "U+2007", replacement: "" },
  { name: "En Quad", code: "\u2000", hex: "U+2000", replacement: "" },
  { name: "Em Quad", code: "\u2001", hex: "U+2001", replacement: "" },
  { name: "En Space", code: "\u2002", hex: "U+2002", replacement: "" },
  { name: "Em Space", code: "\u2003", hex: "U+2003", replacement: "" },
];

// Report-only characters. These are content/style decisions and must be rewritten manually.
const reportOnlyChars = [
  { name: "En Dash", code: "\u2013", hex: "U+2013" },
  { name: "Em Dash", code: "\u2014", hex: "U+2014" },
];

// File extensions to check
const extensionsToCheck = [
  ".md",
  ".mdx",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".txt",
];

// Directories to exclude
const excludeDirs = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "temp",
];

let totalFilesProcessed = 0;
let totalFilesModified = 0;
let totalCharactersRemoved = 0;
let totalStyleViolations = 0;
let totalFilesWithStyleViolations = 0;

function countOccurrences(content, code) {
  const matches = content.match(new RegExp(code, "g"));
  return matches ? matches.length : 0;
}

function shouldExcludeDir(dirPath) {
  return excludeDirs.some(
    (excludeDir) =>
      dirPath.includes(excludeDir) || path.basename(dirPath) === excludeDir,
  );
}

function cleanFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, "utf8");
    let cleanedContent = originalContent;
    let charactersRemoved = 0;
    let styleViolations = 0;

    // Auto-fix invisible characters.
    autoFixChars.forEach((char) => {
      const occurrences = countOccurrences(cleanedContent, char.code);
      if (occurrences === 0) {
        return;
      }

      cleanedContent = cleanedContent.replace(
        new RegExp(char.code, "g"),
        char.replacement,
      );
      console.log(
        `  - Removed ${occurrences} ${char.name} (${char.hex}) character(s)`,
      );
      charactersRemoved += occurrences;
    });

    // Report style violations without auto-rewriting them.
    reportOnlyChars.forEach((char) => {
      const occurrences = countOccurrences(cleanedContent, char.code);
      if (occurrences === 0) {
        return;
      }

      console.log(
        `  - Found ${occurrences} ${char.name} (${char.hex}) character(s) (manual rewrite required)`,
      );
      styleViolations += occurrences;
    });

    if (charactersRemoved > 0 && !isDryRun) {
      fs.writeFileSync(filePath, cleanedContent, "utf8");
    }

    if (charactersRemoved > 0) {
      console.log(
        `${isDryRun ? "🔍 Would clean" : "✅ Cleaned"} ${filePath}: normalized ${charactersRemoved} disallowed character(s)`,
      );
      totalFilesModified++;
      totalCharactersRemoved += charactersRemoved;
    }

    if (styleViolations > 0) {
      console.log(
        `❌ Style violation in ${filePath}: ${styleViolations} dash character(s)`,
      );
      totalFilesWithStyleViolations++;
      totalStyleViolations += styleViolations;
    }

    totalFilesProcessed++;
  } catch (error) {
    console.log(`⚠️  Could not process file ${filePath}: ${error.message}`);
  }
}

function walkDirectory(dir) {
  if (shouldExcludeDir(dir)) {
    return;
  }

  try {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensionsToCheck.includes(ext)) {
          cleanFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.log(`⚠️  Could not read directory ${dir}: ${error.message}`);
  }
}

console.log("🧹 Unicode Character Cleaner");
console.log("============================\n");

console.log("This script auto-fixes invisible Unicode characters:");
autoFixChars.forEach((char) => {
  console.log(`  - ${char.name} (${char.hex})`);
});

console.log(
  "\nThis script reports style-only characters that must be rewritten manually:",
);
reportOnlyChars.forEach((char) => {
  console.log(`  - ${char.name} (${char.hex})`);
});

console.log("\nChecking file extensions:", extensionsToCheck.join(", "));
console.log("Excluding directories:", excludeDirs.join(", "));
console.log("\n" + "=".repeat(60) + "\n");

// Check if we're in dry-run mode
const isDryRun =
  process.argv.includes("--dry-run") || process.argv.includes("-n");

if (isDryRun) {
  console.log("🔍 DRY RUN MODE - No files will be modified\n");
} else {
  console.log("⚠️  LIVE MODE - Files will be modified!\n");
}

walkDirectory(".");

console.log("\n" + "=".repeat(60));
console.log(`📊 Summary:`);
console.log(`  - Files processed: ${totalFilesProcessed}`);
console.log(`  - Files modified: ${totalFilesModified}`);
console.log(`  - Total characters removed: ${totalCharactersRemoved}`);
console.log(
  `  - Files with style violations: ${totalFilesWithStyleViolations}`,
);
console.log(`  - Total style violations: ${totalStyleViolations}`);

if (totalFilesModified > 0) {
  console.log(
    `\n✅ Unicode ${isDryRun ? "check" : "cleaning"} completed successfully!`,
  );
  console.log(
    '💡 Consider running "git diff" to review the changes before committing.',
  );
}

if (totalFilesModified === 0 && totalStyleViolations === 0) {
  console.log(
    "\n✅ No disallowed Unicode characters found - your codebase is clean!",
  );
}

if (isDryRun && (totalFilesModified > 0 || totalStyleViolations > 0)) {
  console.log(
    "\n❌ Unicode/style violations found. Resolve them or run clean mode for auto-fixable characters.",
  );
  process.exitCode = 1;
}

if (!isDryRun && totalStyleViolations > 0) {
  console.log(
    "\n❌ Style violations remain (em/en dash). Rewrite these manually and rerun the check.",
  );
  process.exitCode = 1;
}

if (isDryRun) {
  console.log(
    "\n💡 To actually clean the files, run: node scripts/clean-unicode.js",
  );
}
