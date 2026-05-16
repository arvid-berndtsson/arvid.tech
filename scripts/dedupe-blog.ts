#!/usr/bin/env node
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content/blog");

function main() {
  if (!fs.existsSync(DIR)) {
    console.log("No blog directory found, skipping.");
    return;
  }
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.toLowerCase().endsWith(".mdx"))
    .sort();

  const set = new Set(files);
  let removed = 0;
  for (const f of files) {
    const m = f.match(/^(.*?)-(\d+)\.mdx$/);
    if (!m) continue;
    const base = `${m[1]}.mdx`;
    if (set.has(base)) {
      // Duplicate run artifact; remove suffixed copy
      fs.unlinkSync(path.join(DIR, f));
      set.delete(f);
      removed += 1;
    }
  }

  // Optional: if multiple suffixed copies exist without a base, keep the smallest suffix
  const groups = new Map();
  for (const f of set) {
    const m = f.match(/^(.*?)-(\d+)\.mdx$/);
    if (m && !set.has(`${m[1]}.mdx`)) {
      const key = m[1];
      const arr = groups.get(key) ?? [];
      arr.push({ name: f, n: Number(m[2]) });
      groups.set(key, arr);
    }
  }
  for (const [, arr] of groups) {
    if (arr.length <= 1) continue;
    arr.sort((a, b) => a.n - b.n);
    // keep the smallest suffix; remove the rest
    for (let i = 1; i < arr.length; i++) {
      fs.unlinkSync(path.join(DIR, arr[i].name));
      removed += 1;
    }
  }

  console.log(`Deduplicated blog posts: removed ${removed} files`);
}

main();
