import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const configUrl = pathToFileURL(path.join(root, "src", "config", "site.ts"));

test("contact mailto links stay plain without prefilled content", async () => {
  const { siteConfig } = await import(configUrl.toString());
  const pageFiles = [
    path.join(root, "src", "pages", "index.astro"),
    path.join(root, "src", "pages", "security-research.astro"),
  ];
  const plainMailto = `mailto:\${siteConfig.email}`;

  assert.equal(new URL(`mailto:${siteConfig.email}`).protocol, "mailto:");

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, "utf8");
    assert.equal(content.includes(plainMailto), true);
    assert.doesNotMatch(content, /mailto:[^"'`]*[?&](?:subject|body)=/);
  }
});
