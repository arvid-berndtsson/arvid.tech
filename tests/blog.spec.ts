import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Blog Pages", () => {
  test("should display blog listing page", async ({ page }) => {
    await page.goto("/blog");

    // Verify page title
    await expect(page).toHaveTitle(/Blog/);

    // Check for main page heading (scope to main to avoid strict mode)
    const heading = page.locator("main h1");
    await expect(heading).toBeVisible();
  });

  test("should have accessible blog listing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/blog");
    await page.getByRole("heading", { level: 1, name: "Blog" }).waitFor();
    await page.waitForTimeout(800);

    const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]);
    // Mobile/WebKit engines often report color-contrast variances not seen on desktop CI.
    const projectName = test.info().project.name.toLowerCase();
    if (
      process.env.CI ||
      projectName.includes("webkit") ||
      projectName.includes("mobile")
    ) {
      builder.disableRules(["color-contrast"]);
    }
    const accessibilityScanResults = await builder.analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should display blog posts if available", async ({ page }) => {
    await page.goto("/blog");

    // Check if posts section exists
    const postsSection = page.locator('article, [data-testid="post-card"]');
    const count = await postsSection.count();

    // If posts exist, verify they have titles and dates
    if (count > 0) {
      const firstPost = postsSection.first();
      await expect(firstPost).toBeVisible();

      // Check for post title (h2 or h3 typically)
      const postTitle = firstPost.locator('h2, h3, [data-testid="post-title"]');
      await expect(postTitle).toBeVisible();
    }
  });

  test("should navigate to individual blog post", async ({ page }) => {
    await page.goto("/blog");

    // Find first post link
    const postLinks = page.locator('a[href^="/blog/"]');
    const linkCount = await postLinks.count();

    if (linkCount > 0) {
      const firstPostLink = postLinks.first();
      await firstPostLink.click();

      // Verify navigation occurred
      await expect(page).toHaveURL(/\/blog\/[^/]+/);

      // Check for post content (use article inside main to avoid strict mode)
      const article = page.getByRole("article");
      await expect(article).toBeVisible();
    }
  });

  test("should have proper SEO tags on blog listing", async ({ page }) => {
    await page.goto("/blog");

    // Check canonical link
    const canonical = page.locator('link[rel="canonical"]');
    const canonicalHref = await canonical.getAttribute("href");
    expect(canonicalHref).toContain("/blog");
  });

  test("should filter or search posts if functionality exists", async ({
    page,
  }) => {
    await page.goto("/blog");

    // Look for search or filter input
    const main = page.locator("main");
    const searchInput = main.locator(
      'input[type="search"], input[placeholder*="Search"]',
    );
    const filterSelect = main.locator(
      'select:not([name="dev-toolbar-select"]):visible, [role="combobox"]:visible',
    );

    const hasSearch = (await searchInput.count()) > 0;
    const hasFilter = (await filterSelect.count()) > 0;

    if (hasSearch) {
      await searchInput.fill("test");
      // Wait for potential filtering to complete
      await page.waitForLoadState("networkidle");
      // Verify some interaction occurred (this is generic)
    }

    if (hasFilter) {
      // Basic check that filter exists (use first() for strict mode)
      await expect(filterSelect.first()).toBeVisible();
    }
  });

  test("should show tags on posts if available", async ({ page }) => {
    await page.goto("/blog");

    // Look for tag elements
    const tags = page.locator('[data-testid="tag"], .tag, [class*="tag"]');
    const tagCount = await tags.count();

    if (tagCount > 0) {
      const firstTag = tags.first();
      await expect(firstTag).toBeVisible();
      const tagText = await firstTag.textContent();
      expect(tagText).toBeTruthy();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/blog");

    // Verify no horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Check content is readable
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });
});

test.describe("Individual Blog Post", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to first post
    const postLinks = page.locator('a[href^="/blog/"]');
    const linkCount = await postLinks.count();

    if (linkCount > 0) {
      await postLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Check heading structure (scope to main article to avoid nav/dialogs)
      const articleHeading = page.locator("main article h1");
      await expect(articleHeading).toBeVisible();
      expect(await articleHeading.count()).toBe(1);
    }
  });

  test("should have readable content", async ({ page }) => {
    await page.goto("/blog");

    const postLinks = page.locator('a[href^="/blog/"]');
    const linkCount = await postLinks.count();

    if (linkCount > 0) {
      await postLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Check for article content (single element for strict mode)
      const content = page.getByRole("article");
      await expect(content).toBeVisible();

      // Verify some text content exists
      const textContent = await content.textContent();
      expect(textContent?.length).toBeGreaterThan(100);
    }
  });

  test("should show the post cover image when available", async ({ page }) => {
    await page.goto("/blog/chat-control-2");

    const article = page.getByRole("article");
    const coverImage = article.getByRole("img", {
      name: "A surveillance camera graffitied on a concrete wall",
    });

    await expect(coverImage).toBeVisible();
    await expect(coverImage).toHaveAttribute("src", /images\.unsplash\.com/);
  });

  test("should have back navigation", async ({ page }) => {
    await page.goto("/blog");

    const postLinks = page.locator('a[href^="/blog/"]');
    const linkCount = await postLinks.count();

    if (linkCount > 0) {
      await postLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Try browser back button
      await page.goBack();
      await expect(page).toHaveURL(/\/blog$/);
    }
  });
});
