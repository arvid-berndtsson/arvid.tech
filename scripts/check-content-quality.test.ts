import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const root = process.cwd();
const scriptPath = path.join(root, "scripts", "check-content-quality.ts");

test("fails when image binaries are tracked under content", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "content-check-"));
  const blogDir = path.join(workspace, "content", "blog");
  fs.mkdirSync(blogDir, { recursive: true });
  fs.writeFileSync(
    path.join(blogDir, "example-post.mdx"),
    `---
title: Example Post
coverImage: "https://files.arvid.tech/blog/example-post-cover.webp"
---

Body.
`,
    "utf8",
  );
  fs.writeFileSync(path.join(blogDir, "cover.webp"), "fake-image-bytes");

  assert.equal(spawnSync("git", ["init"], { cwd: workspace }).status, 0);
  assert.equal(
    spawnSync("git", ["add", "content"], { cwd: workspace }).status,
    0,
  );

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspace,
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Do not store image files under content\/\. Upload images manually and reference their remote URLs\./,
  );
});

test("fails when blog image frontmatter uses non-http URL schemes", () => {
  const invalidSchemes = [
    "mailto:hello@example.com",
    "data:image/svg+xml;base64,PHN2Zy8+",
    "javascript:alert(1)",
  ];

  for (const coverImage of invalidSchemes) {
    const workspace = fs.mkdtempSync(
      path.join(os.tmpdir(), "content-check-url-"),
    );
    const blogDir = path.join(workspace, "content", "blog");
    fs.mkdirSync(blogDir, { recursive: true });
    fs.writeFileSync(
      path.join(blogDir, "example-post.mdx"),
      `---
title: Example Post
coverImage: "${coverImage}"
---

Body.
`,
      "utf8",
    );

    assert.equal(spawnSync("git", ["init"], { cwd: workspace }).status, 0);
    assert.equal(
      spawnSync("git", ["add", "content"], { cwd: workspace }).status,
      0,
    );

    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: workspace,
      encoding: "utf8",
    });

    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /coverImage must use an http:\/\/ or https:\/\/ image URL\./,
    );
  }
});
