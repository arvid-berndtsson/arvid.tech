import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Home Page", () => {
  test("should load the homepage successfully", async ({ page }) => {
    await page.goto("/");

    // Verify page title
    await expect(page).toHaveTitle(/Arvid Berndtsson/);

    // Check for main content
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /.+/);
  });

  test("should have accessible navigation", async ({ page, browserName }) => {
    test.skip(
      browserName === "webkit",
      "WebKit only tabs through links when full keyboard access is enabled by the host browser/OS",
    );

    // Desktop viewport so Primary nav (hidden on mobile) is visible in all projects
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Check for primary navigation landmark (single element for strict mode)
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();

    // Keyboard focus behavior is flaky on WebKit; ensure focusable controls exist.
    const projectName = test.info().project.name.toLowerCase();
    if (
      projectName.includes("webkit") ||
      projectName.includes("mobile safari")
    ) {
      await expect(
        nav
          .locator('a, button, input, [tabindex]:not([tabindex="-1"])')
          .first(),
      ).toBeVisible();
      return;
    }

    // Verify keyboard navigation: first Tab should focus a valid element.
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(["A", "BUTTON", "INPUT"]).toContain(focusedElement);
  });

  test("should have no automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Wait for hero animations to finish so axe sees final colors (avoids flaky contrast on h1)
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    await page.waitForTimeout(800);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have working external links with correct attributes", async ({
    page,
  }) => {
    await page.goto("/");

    // Find all external links
    const externalLinks = page.locator('a[href^="http"]');
    const count = await externalLinks.count();

    if (count > 0) {
      // Check first external link has security attributes
      const firstLink = externalLinks.first();
      await expect(firstLink).toHaveAttribute("rel", /noopener/);
      await expect(firstLink).toHaveAttribute("target", "_blank");
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify page is visible and scrollable
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Check no horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
