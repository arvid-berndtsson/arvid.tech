import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const root = process.cwd();
const scriptPath = path.join(root, "scripts", "sync-blog-images-to-r2.ts");

function makeExecutable(filePath: string, source: string) {
  fs.writeFileSync(filePath, source, "utf8");
  fs.chmodSync(filePath, 0o755);
}

test("uploads relative blog frontmatter images, rewrites the public URL, and removes the local file", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "r2-blog-sync-"));
  const binDir = path.join(workspace, "bin");
  const postDir = path.join(workspace, "content", "blog", "example-post");
  const callsPath = path.join(workspace, "wrangler-calls.log");

  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(postDir, { recursive: true });

  makeExecutable(
    path.join(binDir, "pnpm"),
    `#!/usr/bin/env sh
printf '%s\\n' "$*" >> "${callsPath}"
exit 0
`,
  );

  const imagePath = path.join(postDir, "cover.webp");
  fs.writeFileSync(imagePath, "fake-image-bytes", "utf8");
  fs.writeFileSync(
    path.join(postDir, "index.mdx"),
    `---
title: Example Post
coverImage: "./cover.webp"
---

Body.
`,
    "utf8",
  );

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspace,
    env: {
      ...process.env,
      PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}`,
      R2_BLOG_BUCKET_NAME: "arvid-blog-images",
      R2_BLOG_PUBLIC_HOST: "https://files.example.test/",
    },
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    fs.readFileSync(path.join(postDir, "index.mdx"), "utf8"),
    /coverImage: "https:\/\/files\.example\.test\/blog\/example-post\/cover\.webp"/,
  );
  assert.equal(fs.existsSync(imagePath), false);
  assert.match(
    fs.readFileSync(callsPath, "utf8"),
    /exec wrangler r2 object put arvid-blog-images\/blog\/example-post\/cover\.webp --file .+cover\.webp/,
  );
});

test("uploads relative frontmatter images from any content collection using content-derived keys", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "r2-content-sync-"));
  const binDir = path.join(workspace, "bin");
  const docDir = path.join(workspace, "content", "docs", "ecosystem", "app-one");
  const callsPath = path.join(workspace, "wrangler-calls.log");

  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(docDir, { recursive: true });

  makeExecutable(
    path.join(binDir, "pnpm"),
    `#!/usr/bin/env sh
printf '%s\\n' "$*" >> "${callsPath}"
exit 0
`,
  );

  const imagePath = path.join(docDir, "hero.png");
  fs.writeFileSync(imagePath, "fake-image-bytes", "utf8");
  fs.writeFileSync(
    path.join(docDir, "getting-started.mdx"),
    `---
title: Getting Started
coverImage: "./hero.png"
---

Body.
`,
    "utf8",
  );

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspace,
    env: {
      ...process.env,
      PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}`,
      R2_CONTENT_BUCKET_NAME: "arvid-content-assets",
      R2_CONTENT_PUBLIC_HOST: "https://files.example.test/",
    },
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    fs.readFileSync(path.join(docDir, "getting-started.mdx"), "utf8"),
    /coverImage: "https:\/\/files\.example\.test\/docs\/ecosystem\/app-one\/getting-started\/hero\.png"/,
  );
  assert.equal(fs.existsSync(imagePath), false);
  assert.match(
    fs.readFileSync(callsPath, "utf8"),
    /exec wrangler r2 object put arvid-content-assets\/docs\/ecosystem\/app-one\/getting-started\/hero\.png --file .+hero\.png/,
  );
});

test("uploads and rewrites relative markdown image links", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "r2-inline-sync-"));
  const binDir = path.join(workspace, "bin");
  const docDir = path.join(workspace, "content", "docs", "ecosystem", "app-two");
  const callsPath = path.join(workspace, "wrangler-calls.log");

  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(docDir, { recursive: true });

  makeExecutable(
    path.join(binDir, "pnpm"),
    `#!/usr/bin/env sh
printf '%s\\n' "$*" >> "${callsPath}"
exit 0
`,
  );

  const imagePath = path.join(docDir, "screenshot.webp");
  fs.writeFileSync(imagePath, "fake-image-bytes", "utf8");
  fs.writeFileSync(
    path.join(docDir, "index.mdx"),
    `---
title: App Two
---

![Dashboard screenshot](./screenshot.webp)
`,
    "utf8",
  );

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspace,
    env: {
      ...process.env,
      PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ""}`,
      R2_CONTENT_BUCKET_NAME: "arvid-content-assets",
      R2_CONTENT_PUBLIC_HOST: "https://files.example.test/",
    },
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    fs.readFileSync(path.join(docDir, "index.mdx"), "utf8"),
    /!\[Dashboard screenshot\]\(https:\/\/files\.example\.test\/docs\/ecosystem\/app-two\/screenshot\.webp\)/,
  );
  assert.equal(fs.existsSync(imagePath), false);
  assert.match(
    fs.readFileSync(callsPath, "utf8"),
    /exec wrangler r2 object put arvid-content-assets\/docs\/ecosystem\/app-two\/screenshot\.webp --file .+screenshot\.webp/,
  );
});
