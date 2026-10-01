import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const durations = [
  { slug: "1-minute-typing-test", seconds: 60, title: /1 minute typing test/i },
  { slug: "3-minute-typing-test", seconds: 180, title: /3 minute typing test/i },
  { slug: "5-minute-typing-test", seconds: 300, title: /5 minute typing test/i },
] as const;

for (const duration of durations) {
  test(`${duration.seconds / 60}-minute test completes, saves locally, and retests`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/${duration.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(duration.title);
    await expect(page.getByRole("link", { name: /how wpm works/i })).toBeVisible();

    const start = page.getByRole("button", { name: "START TYPING TEST" });
    await expect(start).toBeVisible();
    await start.click();
    await expect(page.getByRole("status")).toContainText("countdown");
    await page.clock.runFor(3000);

    const input = page.getByRole("textbox", { name: "Type the passage here" });
    await expect(input).toBeFocused();
    await input.pressSequentially("hello");
    await expect(input).toHaveValue("hello");

    await page.clock.fastForward(duration.seconds * 1000 + 100);
    await expect(page.getByRole("heading", { name: /wpm/i })).toBeVisible();
    await expect(input).toHaveCount(0);
    await expect(page.locator(".history-item")).toHaveCount(1);
    await page.getByRole("button", { name: new RegExp(`RETEST ${duration.seconds / 60} MIN`) }).click();
    await expect(page.getByRole("status")).toContainText("countdown");
  });
}

test("paste is rejected and recent history can be cleared", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  await page.getByRole("button", { name: "START TYPING TEST" }).click();
  await page.clock.runFor(3000);
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  await input.evaluate((element) => {
    element.dispatchEvent(new Event("paste", { bubbles: true, cancelable: true }));
  });
  await expect(page.getByRole("status")).toContainText("Paste isn't available");
  await expect(input).toHaveValue("");
  await input.pressSequentially("test");
  await page.clock.fastForward(60_100);
  await page.getByRole("button", { name: "Clear local history" }).click();
  await page.getByRole("button", { name: "Clear results" }).click();
  await expect(page.locator(".history-item")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Your completed tests in this browser will appear here.")).toBeVisible();
});

test("an empty attempt produces no saved score", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  await page.getByRole("button", { name: "START TYPING TEST" }).click();
  await page.clock.runFor(3000);
  await page.clock.fastForward(60_100);
  await expect(page.getByRole("heading", { name: "No score recorded." })).toBeVisible();
  await expect(page.locator(".history-item")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "RETEST 1 MIN" })).toBeVisible();
});

test("public routes expose unique titles and canonical URLs", async ({ page, request }) => {
  for (const slug of ["typing-test", ...durations.map((item) => item.slug), "average-wpm", "average-typing-speed"]) {
    await page.goto(`/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${slug}$`));
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/5-minute-typing-test");
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
});

test("primary route has no horizontal overflow or blocking accessibility violations", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(horizontalOverflow).toBe(false);
  await expect(page.getByRole("button", { name: "START TYPING TEST" })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});
