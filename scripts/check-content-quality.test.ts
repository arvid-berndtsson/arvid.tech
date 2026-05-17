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
  const postDir = path.join(workspace, "content", "blog", "example-post");
  fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(
    path.join(postDir, "index.mdx"),
    `---
title: Example Post
coverImage: "https://files.arvid.tech/blog/example-post/cover.webp"
---

Body.
`,
    "utf8",
  );
  fs.writeFileSync(path.join(postDir, "cover.webp"), "fake-image-bytes");

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
    /Image files under content\/ are temporary only\. Wait for the automated R2 cleanup pull request or ask a maintainer for help\./,
  );
});
