#!/usr/bin/env node
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
  ".bmp",
  ".tif",
  ".tiff",
  ".ico",
  ".heic",
  ".heif",
]);
const FRONTMATTER_IMAGE_FIELDS = [
  "coverImage",
  "featuredImage",
  "image",
  "ogImage",
  "thumbnail",
];
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

function log(message) {
  console.log(`[content-assets:sync:r2] ${message}`);
}

function uploadToR2(bucketName, key, absolutePath) {
  const objectRef = `${bucketName}/${key}`;
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "r2",
      "object",
      "put",
      objectRef,
      "--file",
      absolutePath,
    ],
    { stdio: "pipe", encoding: "utf8", shell: false },
  );

  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
    throw new Error(`Upload failed for ${absolutePath}: ${output}`);
  }
}

function walkFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolute));
      continue;
    }
    if (entry.isFile()) files.push(absolute);
  }

  return files;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  return {
    raw: match[1],
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  };
}

function stripWrappingAngleBrackets(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function stripQueryHashAndTitle(value) {
  let target = stripWrappingAngleBrackets(value);
  const titleMatch = target.match(/^([^\s]+)\s+(?:"[^"]*"|'[^']*')$/);
  if (titleMatch) target = titleMatch[1];
  return target.split("#", 1)[0].split("?", 1)[0];
}

function isExternalOrIgnoredTarget(target) {
  if (!target || target.startsWith("#")) return true;
  if (target.startsWith("//")) return true;
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(target);
}

function isRelativeLocalTarget(target) {
  return target.startsWith("./") || target.startsWith("../");
}

function isAllowedImageFile(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isInsideContent(filePath) {
  const relative = path.relative(CONTENT_DIR, filePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function contentBaseKey(contentFilePath) {
  const relative = path
    .relative(CONTENT_DIR, contentFilePath)
    .replace(/\\/g, "/");
  const parsed = path.posix.parse(relative);

  if (parsed.name === "index") {
    return parsed.dir;
  }

  return path.posix.join(parsed.dir, parsed.name);
}

function publicUrlFor(publicHost, key) {
  return `${publicHost}/${key}`;
}

function resolveUpload(contentFilePath, rawTarget, publicHost) {
  const cleanTarget = stripQueryHashAndTitle(rawTarget);
  if (isExternalOrIgnoredTarget(cleanTarget)) return null;
  if (!isRelativeLocalTarget(cleanTarget)) return null;

  const absoluteImagePath = path.resolve(path.dirname(contentFilePath), cleanTarget);
  if (!fs.existsSync(absoluteImagePath)) {
    log(`Skipping missing image file: ${absoluteImagePath}`);
    return null;
  }
  if (!fs.statSync(absoluteImagePath).isFile()) {
    log(`Skipping non-file image target: ${absoluteImagePath}`);
    return null;
  }
  if (!isAllowedImageFile(absoluteImagePath)) {
    log(`Skipping unsupported image format: ${absoluteImagePath}`);
    return null;
  }
  if (!isInsideContent(absoluteImagePath)) {
    log(`Skipping image outside content/: ${absoluteImagePath}`);
    return null;
  }

  const key = `${contentBaseKey(contentFilePath)}/${path.basename(absoluteImagePath)}`;
  return {
    absoluteImagePath,
    key,
    publicUrl: publicUrlFor(publicHost, key),
  };
}

function getFieldValue(frontmatterRaw, field) {
  const match = frontmatterRaw.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

function replaceFieldValue(frontmatterRaw, field, newValue) {
  const quoted = `"${newValue}"`;
  return frontmatterRaw.replace(
    new RegExp(`^(${field}:\\s*)(.+)$`, "m"),
    `$1${quoted}`,
  );
}

function rewriteMarkdownImages(body, contentFilePath, publicHost, uploadsByPath) {
  let changed = false;
  const rewritten = body.replace(MARKDOWN_IMAGE_REGEX, (full, alt, rawTarget) => {
    const upload = resolveUpload(contentFilePath, rawTarget, publicHost);
    if (!upload) return full;

    uploadsByPath.set(upload.absoluteImagePath, upload);
    changed = true;
    return `![${alt}](${upload.publicUrl})`;
  });

  return { body: rewritten, changed };
}

function rewriteFrontmatter(frontmatterRaw, contentFilePath, publicHost, uploadsByPath) {
  let changed = false;
  let updated = frontmatterRaw;

  for (const field of FRONTMATTER_IMAGE_FIELDS) {
    const value = getFieldValue(updated, field);
    if (!value) continue;

    const upload = resolveUpload(contentFilePath, value, publicHost);
    if (!upload) continue;

    uploadsByPath.set(upload.absoluteImagePath, upload);
    updated = replaceFieldValue(updated, field, upload.publicUrl);
    changed = true;
  }

  return { frontmatter: updated, changed };
}

function contentFiles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return walkFiles(CONTENT_DIR).filter((filePath) =>
    CONTENT_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  );
}

const bucketName = process.env.R2_CONTENT_BUCKET_NAME || process.env.R2_BLOG_BUCKET_NAME;
const publicHost =
  (process.env.R2_CONTENT_PUBLIC_HOST || process.env.R2_BLOG_PUBLIC_HOST)?.replace(
    /\/+$/,
    "",
  ) || "https://files.arvid.tech";

if (!bucketName) {
  log("R2_CONTENT_BUCKET_NAME/R2_BLOG_BUCKET_NAME not set, skipping auto-sync.");
  process.exit(0);
}

const files = contentFiles();
if (files.length === 0) {
  log("No content files found, skipping.");
  process.exit(0);
}

let rewrites = 0;
const uploadsByPath = new Map();

for (const filePath of files) {
  const source = fs.readFileSync(filePath, "utf8");
  const parsed = parseFrontmatter(source);

  let nextSource = source;
  let changed = false;

  if (parsed) {
    const frontmatterResult = rewriteFrontmatter(
      parsed.raw,
      filePath,
      publicHost,
      uploadsByPath,
    );
    const body = source.slice(parsed.end);
    const bodyResult = rewriteMarkdownImages(
      body,
      filePath,
      publicHost,
      uploadsByPath,
    );

    changed = frontmatterResult.changed || bodyResult.changed;
    if (changed) {
      nextSource =
        source.slice(0, parsed.start) +
        `---\n${frontmatterResult.frontmatter}\n---\n` +
        bodyResult.body;
    }
  } else {
    const bodyResult = rewriteMarkdownImages(
      source,
      filePath,
      publicHost,
      uploadsByPath,
    );
    changed = bodyResult.changed;
    nextSource = bodyResult.body;
  }

  if (!changed) continue;

  fs.writeFileSync(filePath, nextSource, "utf8");
  rewrites += 1;
}

let uploads = 0;
for (const upload of uploadsByPath.values()) {
  uploadToR2(bucketName, upload.key, upload.absoluteImagePath);
  uploads += 1;
}

for (const upload of uploadsByPath.values()) {
  fs.unlinkSync(upload.absoluteImagePath);
}

log(`Complete. Uploaded ${uploads} image(s), updated ${rewrites} content file(s).`);
