import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("CI runs script regression tests", () => {
  const contentChecksWorkflow = fs.readFileSync(
    path.join(root, ".github", "workflows", "content-checks.yml"),
    "utf8",
  );
  const buildWorkflow = fs.readFileSync(
    path.join(root, ".github", "workflows", "build.yml"),
    "utf8",
  );

  assert.match(contentChecksWorkflow, /pnpm run scripts:test/);
  assert.match(buildWorkflow, /pnpm run scripts:test/);
});
