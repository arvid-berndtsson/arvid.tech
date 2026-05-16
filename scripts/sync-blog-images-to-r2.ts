#!/usr/bin/env node
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const ALLOWED_IMAGE_EXTENSIONS = new Set([
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

function log(message) {
  console.log(`[images:sync:r2] ${message}`);
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

function getFieldValue(frontmatterRaw, field) {
  const match = frontmatterRaw.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

function replaceFieldValue(frontmatterRaw, field, newValue) {
  const quoted = `"${newValue}"`;
  if (new RegExp(`^${field}:\\s*(.+)$`, "m").test(frontmatterRaw)) {
    return frontmatterRaw.replace(
      new RegExp(`^(${field}:\\s*)(.+)$`, "m"),
      `$1${quoted}`,
    );
  }
  return `${frontmatterRaw}\n${field}: ${quoted}`;
}

function shouldUpload(value) {
  return value && (value.startsWith("./") || value.startsWith("../"));
}

function isAllowedImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.has(ext);
}

const bucketName = process.env.R2_BLOG_BUCKET_NAME;
const publicHost =
  process.env.R2_BLOG_PUBLIC_HOST?.replace(/\/+$/, "") ||
  "https://files.arvid.tech";

if (!bucketName) {
  log("R2_BLOG_BUCKET_NAME not set, skipping auto-sync.");
  process.exit(0);
}

if (!fs.existsSync(BLOG_DIR)) {
  log("No content/blog directory found, skipping.");
  process.exit(0);
}

const blogIndexFiles = walkFiles(BLOG_DIR).filter((filePath) =>
  /content\/blog\/[^/]+\/index\.(md|mdx)$/.test(filePath.replace(/\\/g, "/")),
);

let rewrites = 0;
let uploads = 0;

for (const filePath of blogIndexFiles) {
  const normalized = filePath.replace(/\\/g, "/");
  const slugMatch = normalized.match(
    /content\/blog\/([^/]+)\/index\.(md|mdx)$/,
  );
  if (!slugMatch) continue;
  const slug = slugMatch[1];

  const source = fs.readFileSync(filePath, "utf8");
  const parsed = parseFrontmatter(source);
  if (!parsed) continue;

  let updatedFrontmatter = parsed.raw;
  let changed = false;

  for (const field of ["coverImage", "featuredImage"]) {
    const value = getFieldValue(updatedFrontmatter, field);
    if (!value) continue;

    let absoluteImagePath = "";

    if (shouldUpload(value)) {
      absoluteImagePath = path.resolve(path.dirname(filePath), value);
      if (!fs.existsSync(absoluteImagePath)) {
        log(`Skipping missing file for ${field}: ${absoluteImagePath}`);
        continue;
      }
      if (!isAllowedImageFile(absoluteImagePath)) {
        log(
          `Skipping unsupported image format for ${field}: ${absoluteImagePath}`,
        );
        continue;
      }
    } else {
      // Preserve remote URLs (e.g., Unsplash) as-is.
      continue;
    }

    const filename = path.basename(absoluteImagePath);
    const key = `blog/${slug}/${filename}`;
    uploadToR2(bucketName, key, absoluteImagePath);
    uploads += 1;

    const publicUrl = `${publicHost}/${key}`;
    updatedFrontmatter = replaceFieldValue(
      updatedFrontmatter,
      field,
      publicUrl,
    );
    changed = true;
  }

  if (!changed) continue;

  const updatedSource =
    source.slice(0, parsed.start) +
    `---\n${updatedFrontmatter}\n---\n` +
    source.slice(parsed.end);
  fs.writeFileSync(filePath, updatedSource, "utf8");
  rewrites += 1;
}

log(`Complete. Uploaded ${uploads} image(s), updated ${rewrites} post(s).`);
