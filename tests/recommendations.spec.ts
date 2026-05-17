import { expect, test } from "@playwright/test";

test.describe("Recommendations Page", () => {
  test("should use the brighter orange accent for citation details", async ({
    page,
  }) => {
    await page.goto("/recommendations");

    const firstQuote = page.getByTestId("recommendation-quote-mark").first();
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
    await expect(firstQuote).toHaveCSS("color", "rgb(249, 115, 22)");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await expect(firstQuote).toHaveCSS("color", "rgb(251, 146, 60)");

    const firstAvatar = page
      .locator("article")
      .first()
      .locator(".recommendation-avatar")
      .first();
    await expect(firstAvatar).toHaveCSS(
      "background-color",
      "rgb(251, 146, 60)",
    );
  });

  test("should keep recommendation card borders visible in light mode", async ({
    page,
  }) => {
    await page.goto("/recommendations");
    await page.evaluate(() => document.documentElement.classList.remove("dark"));

    const firstCard = page.locator(".recommendation-card").first();
    await expect(firstCard).toHaveCSS("border-color", "rgb(209, 213, 219)");
  });
});
