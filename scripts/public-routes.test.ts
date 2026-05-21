import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const retiredRouteRedirects = new Map<string, string>([["/contact", "/about"]]);
const retiredRoutes = ["/contact", "/tools"];
const sourceRoots = ["src", "data", "content"];
const sourceFilePattern = /\.(astro|md|mdx|ts|tsx|js|jsx|json)$/;
const pageFilePattern = /\.(astro|md|mdx|html|ts|tsx|js|jsx)$/;

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(fullPath);
    }

    return fullPath;
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("retired public routes do not have pages or internal links", () => {
  const publicSourceFiles = sourceRoots
    .flatMap((dir) => listFiles(path.join(root, dir)))
    .filter((file) => sourceFilePattern.test(file));

  const pageFiles = listFiles(path.join(root, "src", "pages"));

  for (const route of retiredRoutes) {
    const routeName = route.slice(1);
    const routeDirectory = path.join(root, "src", "pages", routeName);
    const directRoutePages = pageFiles
      .filter((file) => path.dirname(file) === path.join(root, "src", "pages"))
      .filter((file) => path.basename(file).startsWith(`${routeName}.`))
      .filter((file) => pageFilePattern.test(file))
      .map((file) => path.relative(root, file));

    assert.equal(
      fs.existsSync(routeDirectory),
      false,
      `${route} page directory should not exist`,
    );
    assert.deepEqual(directRoutePages, [], `${route} page file should not exist`);

    const routeReference = new RegExp(
      `${escapeRegExp(route)}(?:[/?#"'\\\`\\)\\]\\}\\s]|$)`,
    );
    const references = publicSourceFiles
      .map((file) => ({
        file: path.relative(root, file),
        content: fs.readFileSync(file, "utf8"),
      }))
      .filter(({ content }) => routeReference.test(content))
      .map(({ file }) => file);

    assert.deepEqual(references, [], `${route} should not be linked from source`);
  }
});

test("retired public routes with replacements have redirects", () => {
  const redirectsPath = path.join(root, "public", "_redirects");
  const redirects = fs.readFileSync(redirectsPath, "utf8");

  for (const [from, to] of retiredRouteRedirects) {
    const redirectLine = new RegExp(
      `^${escapeRegExp(from)}\\s+${escapeRegExp(to)}\\s+301$`,
      "m",
    );

    assert.match(redirects, redirectLine, `${from} should redirect to ${to}`);
  }
});
