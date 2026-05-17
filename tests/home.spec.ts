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

  test("should render scroll progress from the shared layout", async ({ page }) => {
    for (const path of ["/", "/about"]) {
      await page.goto(path);
      await expect(
        page.getByRole("progressbar", { name: "Page scroll progress" }),
      ).toHaveCount(1);
    }
  });

  test("should prioritize writing before projects on the landing page", async ({
    page,
  }) => {
    await page.goto("/");

    const blogTop = await page.locator("section#blog").evaluate((section) => {
      return section.getBoundingClientRect().top + window.scrollY;
    });
    const projectsTop = await page
      .locator("section#projects")
      .evaluate((section) => {
        return section.getBoundingClientRect().top + window.scrollY;
      });

    expect(blogTop).toBeLessThan(projectsTop);
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

  test("should keep the cleaned landing page details", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Malmö & Varberg, Sweden")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Quick links" })).toHaveCount(0);
    const removedEyebrows = page
      .locator('main p[class*="uppercase"][class*="tracking"]')
      .filter({ hasText: /^(Portfolio|Testimonials|Blog)$/i });
    await expect(removedEyebrows).toHaveCount(0);
    await expect(page.locator("main").getByText(/—|–/)).toHaveCount(0);

    const cta = page.getByRole("link", { name: /view my projects/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveCSS("background-color", "rgb(249, 115, 22)");
    await expect(cta).toHaveCSS("color", "rgb(10, 10, 10)");

    const recommendationsLink = page.getByRole("link", {
      name: /view all recommendations/i,
    });
    await expect(recommendationsLink.locator("xpath=..")).not.toHaveClass(/border-t/);

    const testimonialQuote = page.locator(".testimonial-quote").first();
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    await expect(testimonialQuote).toHaveCSS("color", "rgb(249, 115, 22)");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await expect(testimonialQuote).toHaveCSS("color", "rgb(251, 146, 60)");

    const firstProjectCard = page
      .getByRole("link", { name: /arvid\.tech - personal website/i })
      .first();
    await expect(firstProjectCard.getByTestId("content-card-tags")).toContainText(
      /^Tags:/,
    );
    await expect(firstProjectCard.getByTestId("content-card-tags")).not.toContainText(
      /^Stack:/,
    );
    await expect(firstProjectCard.getByText("+4")).toHaveCount(0);
  });

  test("should center recommendation navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const recommendationsLink = page.getByRole("link", {
      name: /view all recommendations/i,
    });
    await expect(recommendationsLink.locator("xpath=..")).toHaveCSS(
      "text-align",
      "center",
    );
  });

  test("should highlight project titles when hovering the whole card", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Hover effects are only meaningful on pointer devices");

    await page.goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));

    const projectCard = page
      .getByRole("link", { name: /arvid\.tech - personal website/i })
      .first();
    const title = projectCard.getByRole("heading", {
      name: /arvid\.tech - personal website/i,
    });

    await projectCard.hover({ position: { x: 24, y: 24 } });
    await expect(title).toHaveCSS("color", "rgb(251, 146, 60)");
  });
});
