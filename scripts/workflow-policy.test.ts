import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();

test("R2 sync workflow can open cleanup pull requests", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github", "workflows", "sync-blog-images-r2.yml"),
    "utf8",
  );

  assert.match(workflow, /^permissions:\n(?:  .+\n)*  contents: write$/m);
  assert.match(workflow, /^permissions:\n(?:  .+\n)*  pull-requests: write$/m);
  assert.match(workflow, /- "content\/\*\*"/);
  assert.match(workflow, /pnpm run scripts:test/);
  assert.match(workflow, /pnpm run content:assets:sync:r2/);
  assert.match(workflow, /gh pr create/);
});

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
