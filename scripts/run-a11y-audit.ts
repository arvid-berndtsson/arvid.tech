#!/usr/bin/env node
// @ts-nocheck

// Headless Lighthouse + axe audit of the homepage for both light and dark theme.
// Requires the dev server running at AUDIT_URL (default http://localhost:3000).
// Uses ?theme=light and ?theme=dark so results are reproducible per theme.
// For cleaner Lighthouse output and a realistic performance score, run against
// production: pnpm run preview (wrangler pages dev, port 8788; @astrojs/cloudflare
// does not support astro preview). Then: AUDIT_URL=http://localhost:8788 node scripts/run-a11y-audit.ts
import lighthouse from "lighthouse";
import { launch as launchChrome } from "chrome-launcher";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = process.env.AUDIT_URL || "http://localhost:3000";
const THEMES = ["light", "dark"];

function urlWithTheme(theme) {
  const u = new URL(BASE_URL);
  u.searchParams.set("theme", theme);
  return u.toString();
}

async function runLighthouse(url, chromePort) {
  const options = {
    logLevel: "error",
    onlyCategories: ["accessibility", "seo", "performance"],
    port: chromePort,
    // Skips script-treemap-data so we avoid parsing dev-server source maps (Vite
    // pre-bundled deps can produce maps that Lighthouse’s parser rejects).
    skipAudits: [
      "script-treemap-data",
      "unused-javascript",
      "legacy-javascript-insight",
    ],
  };
  const runnerResult = await lighthouse(url, options);
  return runnerResult.lhr;
}

async function runAxeForTheme(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations || [];
}

async function run() {
  const chrome = await launchChrome({
    chromeFlags: ["--headless=new", "--no-sandbox"],
  });

  for (const theme of THEMES) {
    const url = urlWithTheme(theme);
    console.log(`\n=== Theme: ${theme} (${url}) ===\n`);

    console.log("Lighthouse:");
    const lhr = await runLighthouse(url, chrome.port);
    const { categories } = lhr;
    for (const key of Object.keys(categories)) {
      console.log(`  ${key}: ${Math.round(categories[key].score * 100)}`);
    }
    const a11y = lhr.categories.accessibility;
    if (a11y.auditRefs) {
      const contrastAudits = a11y.auditRefs.filter(
        (ref) => ref.id === "color-contrast" || ref.id === "link-in-text-block",
      );
      for (const ref of contrastAudits) {
        const audit = lhr.audits[ref.id];
        if (audit && audit.score !== null && audit.score < 1) {
          console.log(`  [${ref.id}] score: ${audit.score}`);
          if (
            audit.details &&
            audit.details.items &&
            audit.details.items.length
          ) {
            for (const item of audit.details.items.slice(0, 5)) {
              const node = item.node || item;
              const snippet = node.snippet || node.node?.snippet || "";
              if (snippet) console.log(`      ${snippet.replace(/\n/g, " ")}`);
            }
          }
        }
      }
    }
  }

  console.log("\n=== axe-core (both themes) ===\n");
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    // @axe-core/playwright requires a page from a context (browser.newContext()).
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const theme of THEMES) {
      const url = urlWithTheme(theme);
      const violations = await runAxeForTheme(page, url);
      console.log(`${theme}: ${violations.length} violation(s)`);
      for (const v of violations.slice(0, 5)) {
        console.log(`  - ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
        if (v.nodes.length > 0 && v.nodes[0].target) {
          console.log(`    selector: ${v.nodes[0].target.join(" ")}`);
        }
      }
    }
    await context.close();
    await browser.close();
  } catch (axeErr) {
    console.warn(
      "Skipping axe (e.g. run: pnpm exec playwright install):",
      axeErr.message,
    );
  }
  await chrome.kill();
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
