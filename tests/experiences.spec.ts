import { test, expect } from "@playwright/test";

test.describe("Experiences Page", () => {
  test("should remove eyebrow labels and present richer experience entries", async ({ page }) => {
    await page.goto("/experiences");

    const careerEyebrows = page
      .locator('main p[class*="uppercase"][class*="tracking"]')
      .filter({ hasText: /^Career$/i });
    await expect(careerEyebrows).toHaveCount(0);
    await expect(page.getByText(/—|–/)).toHaveCount(0);

    const summaries = page.getByTestId("experience-summary");
    const count = await summaries.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = (await summaries.nth(i).innerText()).trim();
      const sentenceCount = (text.match(/[.!?](\s|$)/g) ?? []).length;
      expect(sentenceCount).toBeGreaterThanOrEqual(2);
    }

    const focusLines = page.getByTestId("experience-focus");
    await expect(focusLines.first()).toBeVisible();
    await expect(focusLines.locator('[class*="rounded-full"]')).toHaveCount(0);
    await expect(focusLines.first()).toContainText("SOC 2");
    await expect(focusLines.first()).not.toContainText("soc2");
  });
});
