#!/usr/bin/env node
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const [, , postSlug, inputPath] = process.argv;

if (!postSlug || !inputPath) {
  fail("Usage: pnpm images:upload:r2 <post-slug> <path-to-image>");
}

const bucketName = process.env.R2_BLOG_BUCKET_NAME;
if (!bucketName) {
  fail("Missing R2_BLOG_BUCKET_NAME.");
}

const publicHost =
  process.env.R2_BLOG_PUBLIC_HOST?.replace(/\/+$/, "") ||
  "https://files.arvid.tech";

const absolutePath = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(absolutePath)) {
  fail(`File not found: ${absolutePath}`);
}

const stats = fs.statSync(absolutePath);
if (!stats.isFile()) {
  fail(`Not a file: ${absolutePath}`);
}

const ext = path.extname(absolutePath).toLowerCase();
if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
  fail(
    `Unsupported image format "${ext}". Allowed: ${Array.from(ALLOWED_IMAGE_EXTENSIONS).join(", ")}`,
  );
}

const fileName = path.basename(absolutePath);
const key = `blog/${postSlug}/${fileName}`;
const objectRef = `${bucketName}/${key}`;

const upload = spawnSync(
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
  { stdio: "inherit", shell: false },
);

if (upload.status !== 0) {
  fail(
    "R2 upload failed. Ensure wrangler auth and bucket access are configured.",
  );
}

const publicUrl = `${publicHost}/${key}`;

console.log("");
console.log("Upload complete.");
console.log(`R2 object: ${objectRef}`);
console.log(`Public URL: ${publicUrl}`);
console.log("");
console.log("Use in frontmatter:");
console.log(`coverImage: "${publicUrl}"`);
