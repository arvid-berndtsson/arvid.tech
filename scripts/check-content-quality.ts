#!/usr/bin/env node
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const PUBLIC_DIR = path.join(ROOT, "public");

const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);
const LINK_REGEX = /(!?)\[[^\]]*\]\(([^)]+)\)/g;
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

const issues = [];

function walkFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolute));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolute);
    }
  }

  return files;
}

function listTrackedContentFiles() {
  try {
    const output = execSync("git ls-files -- content", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    const tracked = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((relativePath) => path.join(ROOT, relativePath));

    return Array.from(new Set([...tracked, ...walkFiles(CONTENT_DIR)]));
  } catch {
    return walkFiles(CONTENT_DIR);
  }
}

function relativeFromRoot(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function hasLikelyFileExtension(value) {
  const clean = value.replace(/\/+$/, "");
  return path.extname(clean) !== "";
}

function normalizeLinkTarget(rawTarget) {
  let target = rawTarget.trim();

  if (target.startsWith("<") && target.endsWith(">")) {
    target = target.slice(1, -1).trim();
  }

  // Handle markdown targets with optional title: /path "Title"
  const titleSplit = target.match(/^([^\s]+)\s+".*"$/);
  if (titleSplit) {
    target = titleSplit[1];
  }

  return target;
}

function stripQueryAndHash(target) {
  const noHash = target.split("#", 1)[0];
  return noHash.split("?", 1)[0];
}

function isExternalOrIgnoredTarget(target) {
  if (target === "" || target.startsWith("#")) {
    return true;
  }

  if (target.startsWith("//")) {
    return true;
  }

  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(target);
}

function addIssue(filePath, line, message) {
  issues.push({
    file: relativeFromRoot(filePath),
    line,
    message,
  });
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) {
    return null;
  }

  return {
    frontmatter: match[1],
    bodyStart: match[0].length,
  };
}

function checkTrailingWhitespace(filePath, content) {
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const trailingMatch = lines[index].match(/([ \t]+)$/);
    if (!trailingMatch) {
      continue;
    }

    // Allow Markdown hard line break syntax (exactly two trailing spaces).
    if (trailingMatch[1] === "  ") {
      continue;
    }

    if (trailingMatch[1].includes("\t") || trailingMatch[1].length !== 2) {
      addIssue(filePath, index + 1, "Trailing whitespace is not allowed.");
    }
  }
}

function checkFrontmatter(filePath, content) {
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    addIssue(
      filePath,
      1,
      "Missing or invalid frontmatter block (--- ... ---).",
    );
    return { frontmatter: "", body: content };
  }

  return {
    frontmatter: parsed.frontmatter,
    body: content.slice(parsed.bodyStart),
  };
}

function extractCoverImage(frontmatter) {
  const match = frontmatter.match(/^coverImage:\s*(.+)$/m);
  if (!match) {
    return null;
  }

  const raw = match[1].trim();
  const unquoted = raw.replace(/^['"]|['"]$/g, "");
  return unquoted;
}

function extractFrontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

function getBlogSlugFromFilePath(filePath) {
  const relative = relativeFromRoot(filePath);
  const match = relative.match(/^content\/blog\/([^/]+)\.(md|mdx)$/);
  return match ? match[1] : null;
}

function checkGlobalContentImageHostPolicy(filePath, frontmatter) {
  const relative = relativeFromRoot(filePath);
  if (!relative.startsWith("content/")) return;

  const fields = ["coverImage", "featuredImage"];
  for (const field of fields) {
    const value = extractFrontmatterValue(frontmatter, field);
    if (!value) continue;

    if (value.startsWith("./") || value.startsWith("../")) continue;
    if (!isExternalOrIgnoredTarget(value)) continue;

    if (
      (value.startsWith("http://") || value.startsWith("https://")) &&
      !value.startsWith("https://files.arvid.tech/")
    ) {
      continue;
    }

    if (!value.startsWith("https://files.arvid.tech/")) {
      addIssue(
        filePath,
        1,
        `${field} must be hosted on https://files.arvid.tech/.`,
      );
    }
  }
}

function checkBlogImageHostPolicy(filePath, frontmatter) {
  const slug = getBlogSlugFromFilePath(filePath);
  if (!slug) return;

  const fields = ["coverImage", "featuredImage"];

  for (const field of fields) {
    const value = extractFrontmatterValue(frontmatter, field);
    if (!value) continue;

    if (value.startsWith("./") || value.startsWith("../")) {
      addIssue(
        filePath,
        1,
        `${field} must use a remote URL. Upload owned blog images manually and reference their hosted URL.`,
      );
      continue;
    }

    if (!isExternalOrIgnoredTarget(value)) {
      addIssue(
        filePath,
        1,
        `${field} must use a remote URL. Upload owned blog images manually and reference their hosted URL.`,
      );
      continue;
    }
  }
}

function checkCoverImagePath(filePath, frontmatter) {
  const coverImage = extractCoverImage(frontmatter);
  if (!coverImage) {
    return;
  }

  if (isExternalOrIgnoredTarget(coverImage)) {
    return;
  }

  const cleanTarget = stripQueryAndHash(coverImage);
  if (cleanTarget.startsWith("./") || cleanTarget.startsWith("../")) {
    const resolvedRelative = path.resolve(path.dirname(filePath), cleanTarget);
    if (!fileExists(resolvedRelative)) {
      addIssue(
        filePath,
        1,
        `coverImage points to missing relative file: ${coverImage}.`,
      );
    }
    return;
  }

  const localTarget = cleanTarget.replace(/^\/+/, "");
  const publicPath = path.join(PUBLIC_DIR, localTarget);
  if (!fileExists(publicPath)) {
    addIssue(
      filePath,
      1,
      `coverImage points to missing local file: ${coverImage} (expected at public/${localTarget}).`,
    );
  }
}

function checkLegacyPublicBlogFolder() {
  const legacyPublicBlogDir = path.join(PUBLIC_DIR, "blog");
  if (!fs.existsSync(legacyPublicBlogDir)) {
    return;
  }

  const legacyFiles = walkFiles(legacyPublicBlogDir).filter((filePath) =>
    fileExists(filePath),
  );
  for (const filePath of legacyFiles) {
    addIssue(
      filePath,
      1,
      "Do not store post images in public/blog. Upload images manually and use the remote URL in content.",
    );
  }
}

function checkNestedBlogEntries() {
  const blogDir = path.join(CONTENT_DIR, "blog");
  if (!fs.existsSync(blogDir)) {
    return;
  }

  const entries = fs.readdirSync(blogDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    addIssue(
      path.join(blogDir, entry.name),
      1,
      "Blog posts must live directly under content/blog as flat .md or .mdx files. Upload images manually and reference their remote URLs.",
    );
  }
}

function resolveLocalTarget(filePath, target, isImage) {
  const cleanTarget = stripQueryAndHash(target);

  if (cleanTarget.startsWith("/")) {
    const normalized = cleanTarget.replace(/^\/+/, "");
    const resolved = path.join(PUBLIC_DIR, normalized);

    if (fileExists(resolved)) {
      return { ok: true };
    }

    if (isImage || hasLikelyFileExtension(cleanTarget)) {
      return {
        ok: false,
        message: `Missing local file for absolute path: ${cleanTarget} (expected at public/${normalized}).`,
      };
    }

    // Route-like links without file extension are allowed.
    return { ok: true };
  }

  if (cleanTarget.startsWith("./") || cleanTarget.startsWith("../")) {
    const resolved = path.resolve(path.dirname(filePath), cleanTarget);
    if (fileExists(resolved)) {
      return { ok: true };
    }

    if (isImage || hasLikelyFileExtension(cleanTarget)) {
      return {
        ok: false,
        message: `Missing local file for relative path: ${cleanTarget}.`,
      };
    }

    return { ok: true };
  }

  // Treat bare paths as files expected under public/.
  const normalized = cleanTarget.replace(/^\/+/, "");
  const resolvedPublic = path.join(PUBLIC_DIR, normalized);
  if (fileExists(resolvedPublic)) {
    return { ok: true };
  }

  if (isImage || hasLikelyFileExtension(cleanTarget)) {
    return {
      ok: false,
      message: `Missing local file for path: ${cleanTarget} (expected at public/${normalized}).`,
    };
  }

  return { ok: true };
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function checkMarkdownLinks(filePath, body) {
  let match;
  while ((match = LINK_REGEX.exec(body)) !== null) {
    const isImage = match[1] === "!";
    const rawTarget = match[2];
    const target = normalizeLinkTarget(rawTarget);

    if (isExternalOrIgnoredTarget(target)) {
      continue;
    }

    const result = resolveLocalTarget(filePath, target, isImage);
    if (!result.ok) {
      const line = lineNumberAt(body, match.index);
      addIssue(filePath, line, result.message);
    }
  }
}

function main() {
  checkLegacyPublicBlogFolder();
  checkNestedBlogEntries();

  const contentFiles = listTrackedContentFiles()
    .filter((file) => CONTENT_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .filter((file) => fileExists(file))
    .filter((file) => !path.basename(file).startsWith("."));

  for (const filePath of contentFiles) {
    const source = fs.readFileSync(filePath, "utf8");
    checkTrailingWhitespace(filePath, source);

    const { frontmatter, body } = checkFrontmatter(filePath, source);
    checkGlobalContentImageHostPolicy(filePath, frontmatter);
    checkBlogImageHostPolicy(filePath, frontmatter);
    checkCoverImagePath(filePath, frontmatter);
    checkMarkdownLinks(filePath, body);
  }

  if (issues.length > 0) {
    console.error(
      `Content quality checks failed with ${issues.length} issue(s):`,
    );
    for (const issue of issues) {
      console.error(`- ${issue.file}:${issue.line} ${issue.message}`);
    }
    process.exit(1);
  }

  console.log(
    `Content quality checks passed for ${contentFiles.length} file(s).`,
  );
}

main();
