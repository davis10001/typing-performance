import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const durations = [
  { slug: "1-minute-typing-test", seconds: 60, title: /1 minute typing test/i },
  { slug: "2-minute-typing-test", seconds: 120, title: /2 minute typing test/i },
  { slug: "3-minute-typing-test", seconds: 180, title: /3 minute typing test/i },
  { slug: "5-minute-typing-test", seconds: 300, title: /5 minute typing test/i },
  { slug: "10-minute-typing-test", seconds: 600, title: /10 minute typing test/i },
] as const;

test("home uses a logo-only header, footer navigation, and duration-specific buttons", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-header a")).toHaveCount(1);
  await expect(page.locator(".site-header").getByRole("link", { name: "TypingLevel home" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Footer navigation" }).getByRole("link")).toHaveCount(4);
  await expect(page.getByText("No completed tests in this browser yet.", { exact: false })).toBeVisible();
  for (const duration of durations) {
    const card = page.locator(".home-duration-card").filter({ hasText: `${duration.seconds / 60} MIN` });
    await expect(card.getByRole("link", { name: new RegExp(`START ${duration.seconds / 60} MIN TEST`) })).toHaveAttribute("href", `/${duration.slug}`);
  }
  await expect(page.getByRole("heading", { name: "05 WAYS TO TEST." })).toBeVisible();
  await expect(page.locator(".home-duration-card")).toHaveCount(5);
  const topTreatment = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".home-hero")!;
    const divider = document.querySelector<HTMLElement>(".marquee-strip")!;
    return {
      heroBackground: getComputedStyle(hero).backgroundColor,
      heroHeight: hero.getBoundingClientRect().height,
      dividerTransform: getComputedStyle(divider).transform,
    };
  });
  expect(topTreatment.heroBackground).toBe("rgba(0, 0, 0, 0)");
  expect(topTreatment.heroHeight).toBeLessThan(480);
  expect(topTreatment.dividerTransform).toBe("none");
  const geometry = await page.evaluate(() => {
    const selectors = [".home-hero", ".home-duration-grid", ".home-stats", ".home-understand"];
    const sections = selectors.map((selector) => {
      const rect = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    });
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".home-duration-card"), (card) => card.getBoundingClientRect());
    return {
      sections,
      cardWidths: cards.map((card) => card.width),
      cardsWithinGrid: cards.every((card) => card.left >= sections[1].left - 1 && card.right <= sections[1].right + 1),
    };
  });
  for (const item of geometry.sections.slice(1)) {
    expect(Math.abs(item.left - geometry.sections[0].left)).toBeLessThanOrEqual(1);
    expect(Math.abs(item.right - geometry.sections[0].right)).toBeLessThanOrEqual(1);
  }
  expect(geometry.cardsWithinGrid).toBe(true);
  for (const width of geometry.cardWidths) expect(Math.abs(width - geometry.cardWidths[0])).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("home chart reports only local scored results with comparable bars", async ({ page }) => {
  await page.addInitScript(() => {
    const scores = [
      [60, 20], [60, 30], [60, 100], [120, 36], [180, 40], [180, 60], [300, null], [600, 45], [600, 55],
    ];
    localStorage.setItem("typing-performance:results:v1", JSON.stringify(scores.map(([durationSeconds, wpm], index) => ({
      schemaVersion: 1,
      id: `attempt-${index}`,
      completedAt: "2026-10-01T00:00:00.000Z",
      durationSeconds,
      wpm,
      rawWpm: wpm,
      accuracy: 100,
      errors: 0,
      anomalyFlags: [],
    }))));
  });
  await page.goto("/");
  await expect(page.locator(".home-stat-row")).toHaveCount(5);
  await expect(page.locator(".home-stats-list-row").nth(0)).toContainText("1 MIN5030—3");
  await expect(page.locator(".home-stats-list-row").nth(1)).toContainText("2 MIN3636—1");
  await expect(page.locator(".home-stats-list-row").nth(2)).toContainText("3 MIN5050—2");
  await expect(page.locator(".home-stats-list-row").nth(3)).toContainText("5 MIN———0");
  await expect(page.locator(".home-stats-list-row").nth(4)).toContainText("10 MIN5050—2");
  await expect(page.locator(".home-stats-axis")).toContainText("50 WPM");
  await expect(page.getByText("Awaiting source review")).toBeVisible();
  await expect(page.locator(".home-stat-row").nth(0).locator(".average")).toHaveAttribute("style", "width: 100%;");
});

for (const duration of durations) {
  test(`${duration.seconds / 60}-minute test completes, saves locally, and retests`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/${duration.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(duration.title);
    await expect(page.getByRole("link", { name: /how wpm works/i })).toBeVisible();

    const input = page.getByRole("textbox", { name: "Type the passage here" });
    await expect(page.locator(".typing-passage")).toBeVisible();
    await expect(input).toBeVisible();
    await expect(input).toHaveJSProperty("readOnly", true);
    const start = page.getByRole("button", { name: "START TYPING TEST" });
    await expect(start).toBeVisible();
    await start.click();
    await expect(page.getByRole("status")).toContainText("countdown");
    await expect(input).toHaveJSProperty("readOnly", true);
    await page.clock.runFor(3000);

    await expect(input).toBeFocused();
    await expect(input).toHaveJSProperty("readOnly", false);
    expect((await input.boundingBox())?.height).toBeGreaterThanOrEqual(110);
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
    await expect(page).toHaveTitle(/TypingLevel/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/2-minute-typing-test");
  expect(await sitemap.text()).toContain("/10-minute-typing-test");
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");
});

test("analytics vendors are absent while opt-in mode is disabled", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  await expect(page.locator('script[src*="googletagmanager.com"], script[src*="/_vercel/"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Analytics choices" })).toHaveCount(0);
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
  const viewport = page.viewportSize();
  const chamber = await page.locator(".typing-chamber").boundingBox();
  expect(viewport).not.toBeNull();
  expect(chamber).not.toBeNull();
  expect(chamber!.y).toBeLessThan(viewport!.height / 2);
  const alignment = await page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(".test-page-intro h1")!;
    const description = document.querySelector<HTMLElement>(".test-page-intro p")!;
    const input = document.querySelector<HTMLElement>(".typing-input")!;
    const history = document.querySelector<HTMLElement>(".history-section")!;
    const historyStyle = getComputedStyle(history);
    return {
      descriptionBelowHeading: description.getBoundingClientRect().top >= heading.getBoundingClientRect().bottom,
      leftGap: Math.abs(input.getBoundingClientRect().left - (history.getBoundingClientRect().left + parseFloat(historyStyle.paddingLeft))),
      rightGap: Math.abs(input.getBoundingClientRect().right - (history.getBoundingClientRect().right - parseFloat(historyStyle.paddingRight))),
    };
  });
  expect(alignment.descriptionBelowHeading).toBe(true);
  expect(alignment.leftGap).toBeLessThanOrEqual(1);
  expect(alignment.rightGap).toBeLessThanOrEqual(1);
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
