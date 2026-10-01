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
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/5-minute-typing-test");
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
});

test("SEO explanation remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: "http://127.0.0.1:3000" });
  try {
    const page = await context.newPage();
    await page.goto("/average-wpm");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("AVERAGE WPM");
    await expect(page.getByText("ONE WORD = FIVE CHARACTERS.")).toBeVisible();
    await expect(page.getByRole("link", { name: /test your wpm/i })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("primary route has no horizontal overflow or blocking accessibility violations", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(horizontalOverflow).toBe(false);
  await expect(page.getByRole("button", { name: "START TYPING TEST" })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("keyboard flow and running/result states pass accessibility checks", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/1-minute-typing-test");
  const start = page.getByRole("button", { name: "START TYPING TEST" });
  await start.focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(3000);
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  await expect(input).toBeFocused();
  await page.keyboard.type("x");
  await expect(input).toHaveValue("x");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.clock.fastForward(60_100);
  await expect(page.getByRole("status")).toContainText("Test complete");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(browserErrors).toEqual([]);
});

test("local storage write failure leaves result and retest usable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("typing-performance:")) throw new Error("Storage unavailable");
      return original.call(this, key, value);
    };
  });
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  await page.getByRole("button", { name: "START TYPING TEST" }).click();
  await page.clock.runFor(3000);
  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("test");
  await page.clock.fastForward(60_100);
  await expect(page.getByRole("heading", { name: /wpm/i })).toBeVisible();
  await expect(page.getByText("Recent results could not be saved in this browser.", { exact: false })).toBeVisible();
  await expect(page.locator(".history-item")).toHaveCount(0);
  await page.getByRole("button", { name: "RETEST 1 MIN" }).click();
  await expect(page.locator(".typing-chamber [role='status']")).toContainText("countdown");
});
