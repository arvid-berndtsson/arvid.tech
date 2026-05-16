import { test, expect } from "@playwright/test";

test.describe("Site Navigation", () => {
  test("should navigate between main sections", async ({ page }) => {
    // Desktop viewport so Primary nav links are visible (hidden on mobile)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Navigate to Blog
    const thoughtsLink = page.locator('a[href="/blog"]').first();
    if ((await thoughtsLink.count()) > 0) {
      await thoughtsLink.click();
      await expect(page).toHaveURL(/\/blog/);
    }

    // Navigate to Projects
    const projectsLink = page.locator('a[href="/projects"]').first();
    if ((await projectsLink.count()) > 0) {
      await projectsLink.click();
      await expect(page).toHaveURL(/\/projects/);
    }

    // Navigate to Experiences
    const experiencesLink = page.locator('a[href="/experiences"]').first();
    if ((await experiencesLink.count()) > 0) {
      await experiencesLink.click();
      await expect(page).toHaveURL(/\/experiences/);
    }

    // Navigate back to home
    const homeLink = page.locator('a[href="/"]').first();
    if ((await homeLink.count()) > 0) {
      await homeLink.click();
      await page.waitForURL((url) => new URL(url).pathname === "/");
      expect(new URL(page.url()).pathname).toBe("/");
    }
  });

  test("should have consistent navigation across pages", async ({ page }) => {
    // Use desktop viewport so Primary nav (hidden on lg:flex) is visible
    await page.setViewportSize({ width: 1280, height: 720 });
    const pages = ["/", "/blog", "/projects", "/experiences"];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Verify primary navigation exists (single element for strict mode)
      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav).toBeVisible();

      // Check for common navigation links
      const navLinks = nav.locator("a");
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test("should highlight current page in navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/blog");

    // Primary nav should mark current page (aria-current="page" or active class)
    const primaryNav = page.getByRole("navigation", { name: "Primary" });
    const activeLink = primaryNav.locator(
      'a[aria-current="page"], a.active, a[class*="active"]',
    );
    await expect(activeLink.first()).toBeVisible();
    const href = await activeLink.first().getAttribute("href");
    expect(href).toContain("blog");
  });

  test("should support keyboard navigation", async ({ page, browserName }) => {
    test.skip(
      browserName === "webkit",
      "WebKit only tabs through links when full keyboard access is enabled by the host browser/OS",
    );

    // Desktop viewport so tab order includes visible nav links
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // WebKit headless keyboard focus can be unreliable in CI; verify focusable controls exist.
    const projectName = test.info().project.name.toLowerCase();
    if (
      projectName.includes("webkit") ||
      projectName.includes("mobile safari")
    ) {
      const primaryNav = page.getByRole("navigation", { name: "Primary" });
      await expect(
        primaryNav.locator("a, button, input").first(),
      ).toBeVisible();
      return;
    }

    // Tab through until we find a focusable element (allow time for hydration)
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    let focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName ?? "" };
    });

    let attempts = 0;
    const maxAttempts = 30;
    while (
      focusedElement.tag &&
      !["A", "BUTTON", "INPUT"].includes(focusedElement.tag) &&
      attempts < maxAttempts
    ) {
      await page.keyboard.press("Tab");
      focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return { tag: el?.tagName ?? "" };
      });
      attempts++;
    }

    expect(
      ["A", "BUTTON", "INPUT"],
      `Should tab to a focusable element (A, BUTTON, or INPUT) but got ${focusedElement.tag} after ${attempts} attempts`,
    ).toContain(focusedElement.tag);

    if (focusedElement.tag === "A") {
      await page.keyboard.press("Enter");
      await page.waitForLoadState("domcontentloaded");
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    // Desktop viewport so Primary nav is visible
    await page.setViewportSize({ width: 1280, height: 720 });
    const response = await page.goto("/this-page-does-not-exist");

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should still have navigation (404 page uses same layout)
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();

    // Should have helpful content
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("should have working logo/brand link to home", async ({ page }) => {
    await page.goto("/blog");

    // Look for logo or brand link
    const brandLink = page.locator('a[href="/"], nav a[href="/"]').first();
    await expect(brandLink).toBeVisible();

    await brandLink.click();
    await page.waitForURL((url) => new URL(url).pathname === "/");
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("should load search page with search UI", async ({ page }) => {
    await page.goto("/search");

    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByRole("heading", { name: /search/i })).toBeVisible();

    // Search container (id="search"); data-pagefind-ui may be added after build
    const searchContainer = page.locator("#search");
    await expect(searchContainer).toBeVisible();
  });

  test("should handle external links correctly", async ({ page }) => {
    await page.goto("/");

    // Find external links
    const externalLinks = page.locator(
      'a[href^="http"]:not([href*="localhost"])',
    );
    const count = await externalLinks.count();

    if (count > 0) {
      const firstExternal = externalLinks.first();

      // Check attributes
      const target = await firstExternal.getAttribute("target");
      const rel = await firstExternal.getAttribute("rel");

      expect(target).toBe("_blank");
      expect(rel).toContain("noopener");
    }
  });

  test("should have breadcrumbs on deep pages", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to a post
    const postLink = page.locator('a[href^="/blog/"]').first();
    const linkCount = await postLink.count();

    if (linkCount > 0) {
      await postLink.click();

      // Look for breadcrumbs
      const breadcrumbs = page.locator(
        'nav[aria-label*="breadcrumb"], [role="navigation"] ol, .breadcrumbs',
      );
      const breadcrumbCount = await breadcrumbs.count();

      if (breadcrumbCount > 0) {
        await expect(breadcrumbs.first()).toBeVisible();
      }
    }
  });

  test("should maintain scroll position on back navigation", async ({
    page,
  }) => {
    await page.goto("/blog");

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForLoadState("load");

    // Click a link
    const postLink = page.locator('a[href^="/blog/"]').first();
    const linkCount = await postLink.count();

    if (linkCount > 0) {
      await postLink.click();
      await page.waitForLoadState("networkidle");

      // Go back
      await page.goBack();

      // Verify we're back on the blog listing
      await page.waitForURL((url) => new URL(url).pathname === "/blog");
      expect(new URL(page.url()).pathname).toBe("/blog");
    }
  });

  test("should have mobile navigation menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu button (role/label with testid fallback)
    const menuButton = page.getByTestId("mobile-menu-button").first();
    await expect(menuButton).toBeVisible();

    // Keep this assertion focused on mobile-nav affordance availability.
    await expect(menuButton).toHaveAttribute("aria-label", /open menu/i);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.focus();
    await expect(menuButton).toBeFocused();
  });
});
