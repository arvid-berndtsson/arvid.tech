import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test("should use the simplified about layout", async ({ page }) => {
    await page.setViewportSize({ width: 1249, height: 1269 });
    await page.goto("/about");

    await expect(page.getByText("Background", { exact: true }).first()).toBeVisible();
    const heroEyebrows = page
      .locator('main p[class*="uppercase"][class*="tracking"]')
      .filter({ hasText: /^Background$/i });
    await expect(heroEyebrows).toHaveCount(0);
    await expect(page.getByText(/· Malmö University|· LinkedIn/)).toHaveCount(0);
    await expect(page.getByText(/—|–/)).toHaveCount(0);

    const hero = page.locator("main section").first();
    const heroBox = await hero.boundingBox();
    expect(heroBox?.height ?? 999).toBeLessThan(340);

    const skills = page.getByTestId("skills-list");
    await expect(skills.locator('[class*="rounded-full"]')).toHaveCount(0);
    await expect(skills.locator('[class*="border-l"]')).toHaveCount(0);
  });
});
