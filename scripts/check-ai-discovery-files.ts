#!/usr/bin/env node
// @ts-nocheck

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");

const failures = [];

function fail(message) {
  failures.push(message);
}

function readRequiredFile(relativePath) {
  const absolutePath = path.join(DIST_DIR, relativePath);

  if (!fs.existsSync(absolutePath)) {
    fail(`Missing generated file: dist/${relativePath}`);
    return "";
  }

  const stat = fs.statSync(absolutePath);
  if (!stat.isFile()) {
    fail(`Expected a file at dist/${relativePath}, but found something else.`);
    return "";
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function expectContains(content, relativePath, needle, description) {
  if (!content.includes(needle)) {
    fail(
      `dist/${relativePath} is missing ${description}. Expected to find: ${needle}`,
    );
  }
}

function checkRobotsTxt() {
  const file = "robots.txt";
  const content = readRequiredFile(file);
  if (!content) {
    return;
  }

  expectContains(
    content,
    file,
    "User-agent: OAI-SearchBot",
    "OAI-SearchBot policy",
  );
  expectContains(
    content,
    file,
    "User-agent: Claude-SearchBot",
    "Claude-SearchBot policy",
  );
  expectContains(
    content,
    file,
    "User-agent: PerplexityBot",
    "PerplexityBot policy",
  );
  expectContains(content, file, "User-agent: GPTBot", "GPTBot policy");
  expectContains(content, file, "User-agent: ClaudeBot", "ClaudeBot policy");
  expectContains(
    content,
    file,
    "User-agent: Google-Extended",
    "Google-Extended policy",
  );
  expectContains(
    content,
    file,
    "Sitemap: https://arvid.tech/sitemap-index.xml",
    "sitemap link",
  );
  expectContains(
    content,
    file,
    "Sitemap: https://arvid.tech/rss.xml",
    "rss sitemap link",
  );
  expectContains(content, file, "Disallow: /api/", "API disallow rule");
}

function checkLlmsTxt() {
  const file = "llms.txt";
  const content = readRequiredFile(file);
  if (!content) {
    return;
  }

  expectContains(content, file, "# arvid.tech", "site title");
  expectContains(content, file, "## Primary Pages", "primary pages section");
  expectContains(
    content,
    file,
    "## Machine-Readable Endpoints",
    "machine-readable section",
  );
  expectContains(
    content,
    file,
    "https://arvid.tech/sitemap-index.xml",
    "sitemap endpoint",
  );
  expectContains(content, file, "https://arvid.tech/rss.xml", "rss endpoint");
  expectContains(
    content,
    file,
    "https://arvid.tech/blog.md",
    "blog markdown endpoint",
  );
}

function checkRssXml() {
  const file = "rss.xml";
  const content = readRequiredFile(file);
  if (!content) {
    return;
  }

  expectContains(content, file, '<rss version="2.0">', "rss root element");
  expectContains(content, file, "<channel>", "channel element");
  expectContains(
    content,
    file,
    "<title>Arvid Berndtsson - Blog</title>",
    "feed title",
  );
  expectContains(content, file, "https://arvid.tech/blog/", "blog links");
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    fail("dist directory does not exist. Run a build before this check.");
  }

  checkRobotsTxt();
  checkLlmsTxt();
  checkRssXml();

  if (failures.length > 0) {
    console.error(
      `AI discovery checks failed with ${failures.length} issue(s):`,
    );
    for (const item of failures) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  console.log("AI discovery checks passed.");
}

main();
