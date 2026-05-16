import { test, expect } from "@playwright/test";

/**
 * Sitemap and robots.txt are generated at build time.
 * These tests run when the test server serves built output (e.g. preview or wrangler pages dev).
 * They are skipped when running against the Astro dev server (localhost:4321), which does not serve these files.
 */
const isDevServer = (
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4321"
).includes("4321");

test.describe("SEO: sitemap and robots.txt", () => {
  test("robots.txt should be served with correct content", async ({
    request,
    baseURL,
  }) => {
    test.skip(
      isDevServer,
      "Sitemap and robots.txt are build-time only; run against preview to test",
    );
    const response = await request.get(`${baseURL}/robots.txt`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/text\/plain/);

    const body = await response.text();
    expect(body).toContain("User-agent:");
    expect(body).toContain("Sitemap:");
    expect(body).toMatch(/sitemap.*\.xml/);
  });

  test("sitemap-index.xml should be served and reference sitemap", async ({
    request,
    baseURL,
  }) => {
    test.skip(
      isDevServer,
      "Sitemap and robots.txt are build-time only; run against preview to test",
    );
    const response = await request.get(`${baseURL}/sitemap-index.xml`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/xml/);

    const body = await response.text();
    expect(body).toContain("sitemap");
    expect(body).toContain("arvid.tech");
  });

  test("sitemap.xml redirect should resolve to sitemap-index.xml", async ({
    request,
    baseURL,
  }) => {
    test.skip(
      isDevServer,
      "Sitemap and robots.txt are build-time only; run against preview to test",
    );
    const response = await request.get(`${baseURL}/sitemap.xml`, {
      maxRedirects: 2,
    });
    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain("sitemap");
  });
});
