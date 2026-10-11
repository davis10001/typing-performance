import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const durations = [
  { slug: "1-minute-typing-test", seconds: 60 },
  { slug: "2-minute-typing-test", seconds: 120 },
  { slug: "3-minute-typing-test", seconds: 180 },
  { slug: "5-minute-typing-test", seconds: 300 },
  { slug: "10-minute-typing-test", seconds: 600 },
] as const;

test("home uses a logo-only header, footer navigation, and duration-specific buttons", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site-header a")).toHaveCount(1);
  const homeLink = page.locator(".site-header").getByRole("link", { name: "TypingLevel home" });
  await expect(homeLink).toBeVisible();
  await expect(homeLink.locator("img")).toHaveAttribute("src", /typing-level-logo/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/images/typing-level-icon.png");
  await expect(page.getByRole("navigation", { name: "Footer navigation" }).getByRole("link")).toHaveCount(5);
  await expect(page.getByText("No completed tests in this browser yet.", { exact: false })).toBeVisible();
  for (const duration of durations) {
    const card = page.locator(".home-duration-card").filter({ hasText: `${duration.seconds / 60} MIN` });
    await expect(card.getByRole("link", { name: new RegExp(`START ${duration.seconds / 60} MIN TEST`) })).toHaveAttribute("href", `/${duration.slug}`);
  }
  await expect(page.getByRole("heading", { name: "05 WAYS TO TEST." })).toBeVisible();
  await expect(page.locator(".home-duration-card")).toHaveCount(5);
  await expect(page.locator(".hero-key-art")).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Illustration of two hands typing on floating keys" })).toHaveAttribute("src", "/images/typing-hands-hero-cutout.png");
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
  await expect(page.locator(".home-stats-list-row").nth(0)).toContainText("1 MIN50303");
  await expect(page.locator(".home-stats-list-row").nth(1)).toContainText("2 MIN36361");
  await expect(page.locator(".home-stats-list-row").nth(2)).toContainText("3 MIN50502");
  await expect(page.locator(".home-stats-list-row").nth(3)).toContainText("5 MIN——0");
  await expect(page.locator(".home-stats-list-row").nth(4)).toContainText("10 MIN50502");
  await expect(page.locator(".home-stats-axis")).toContainText("50 WPM");
  await expect(page.getByText("No public benchmark is included in this launch.")).toBeVisible();
  await expect(page.locator(".home-stat-row").nth(0).locator(".average")).toHaveAttribute("style", "width: 100%;");
});

test("typing sound can be muted and the preference persists", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  const sound = page.getByRole("switch", { name: "Typing sound" });
  const guide = page.getByRole("switch", { name: "Show finger guide" });
  await expect(sound.locator("svg")).toHaveCount(1);
  await expect(guide.locator("svg")).toHaveCount(1);
  await expect(sound).toHaveCSS("width", "44px");
  await expect(guide).toHaveCSS("width", "44px");
  await expect(sound).toHaveAttribute("aria-checked", "true");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  await input.pressSequentially("a");
  await expect(input).toHaveValue("a");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-checked", "false");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("a");
  await page.keyboard.type("b");
  await expect(input).toHaveValue("ab");
  expect(await page.evaluate(() => localStorage.getItem("typing-level:typing-sound:v1"))).toBe("off");
  await page.reload();
  await expect(sound).toHaveAttribute("aria-checked", "false");
});

test("word errors preserve the expected letter while space errors show actual input", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  const passage = page.locator(".typing-passage");
  const prompt = await passage.textContent();
  expect(prompt).not.toBeNull();
  const word = /[A-Za-z]{2,}(?=[,.!?]? )/.exec(prompt!);
  expect(word).not.toBeNull();
  const typoIndex = word!.index + 1;
  const firstSpace = prompt!.indexOf(" ", word!.index + word![0].length);
  const wrongCharacter = prompt![typoIndex].toLowerCase() === "x" ? "z" : "x";
  const input = page.getByRole("textbox", { name: "Type the passage here" });

  await input.pressSequentially(`${prompt!.slice(0, typoIndex)}${wrongCharacter}${prompt!.slice(typoIndex + 1, firstSpace)}xy `);

  await expect(passage.locator(".typed-error")).toHaveCount(1);
  await expect(passage.locator(".typed-error")).toHaveText(prompt![typoIndex]);
  await expect(passage.locator(".typed-extra")).toHaveText("xy");
  await expect(passage.locator(".typed-current")).toHaveText(prompt![firstSpace + 1]);

  await input.press("Backspace");
  await expect(passage.locator(".typed-current")).toHaveText(" ");
  await input.press("Backspace");
  await expect(passage.locator(".typed-extra")).toHaveText("x");
  await input.press("Backspace");
  await expect(passage.locator(".typed-extra")).toHaveCount(0);
});

test("typing text size changes only the passage and persists", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  const sizes = page.getByRole("group", { name: "Typing text size" });
  const passage = page.locator(".typing-passage");
  const compact = page.viewportSize()!.width <= 680;
  await expect(sizes.getByRole("button", { name: "Medium text size" })).toHaveAttribute("aria-pressed", "true");
  await expect(passage).toHaveCSS("font-size", compact ? "26px" : "30px");
  await sizes.getByRole("button", { name: "Large text size" }).click();
  await expect(passage).toHaveCSS("font-size", compact ? "30px" : "34px");
  await expect(page.getByRole("textbox", { name: "Type the passage here" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await page.reload();
  await expect(sizes.getByRole("button", { name: "Large text size" })).toHaveAttribute("aria-pressed", "true");
  await sizes.getByRole("button", { name: "Small text size" }).click();
  await expect(passage).toHaveCSS("font-size", compact ? "22px" : "26px");
});

for (const duration of durations) {
  test(`${duration.seconds / 60}-minute test completes, saves locally, and retests`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/${duration.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Typing Test");
    await expect(page.getByRole("group", { name: "Choose test duration" })).toBeVisible();
    await expect(page.getByRole("timer")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /how wpm works/i })).toBeVisible();

    const input = page.getByRole("textbox", { name: "Type the passage here" });
    await expect(page.locator(".typing-passage")).toBeVisible();
    const openingCharacter = (await page.locator(".typing-passage").textContent())![0];
    await expect(page.locator(".typing-stage")).toBeVisible();
    await expect(input).toHaveCSS("opacity", "0");
    await expect(page.getByRole("button", { name: "START TYPING TEST" })).toHaveCount(0);
    await expect(page.locator(".typed-current")).toHaveCount(1);
    await expect(input).toBeFocused();
    await expect(input).toHaveJSProperty("readOnly", false);
    await input.pressSequentially("hello");
    await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "running");
    await expect(page.getByRole("group", { name: "Choose test duration" })).toHaveCount(0);
    await expect(page.getByRole("timer")).toHaveText(`${String(duration.seconds / 60).padStart(2, "0")}:00`);
    await expect(input).toHaveValue("hello");
    await expect(page.locator(".typed-error").first()).toHaveText(openingCharacter);
    await expect(page.locator(".typed-current")).toHaveCount(1);
    await page.clock.fastForward(1_100);
    const secondsAfterFirstTick = duration.seconds - 1;
    await expect(page.getByRole("timer")).toHaveText(
      `${String(Math.floor(secondsAfterFirstTick / 60)).padStart(2, "0")}:${String(secondsAfterFirstTick % 60).padStart(2, "0")}`,
    );

    await page.clock.fastForward(duration.seconds * 1000 + 100);
    await expect(page.getByRole("timer")).toHaveText("00:00");
    await expect(page.getByRole("heading", { name: /wpm/i })).toBeVisible();
    await expect(input).toHaveCount(0);
    await expect(page.locator(".history-section")).toHaveCount(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:results:v1") ?? "[]"));
    expect(saved).toHaveLength(1);
    expect(saved[0].durationSeconds).toBe(duration.seconds);
    await page.getByRole("button", { name: new RegExp(`RETEST ${duration.seconds / 60} MIN`) }).click();
    await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
    await expect(page.getByRole("textbox", { name: "Type the passage here" })).toBeFocused();
  });
}

test("reload and retest present different opening text", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("typing-level:recent-texts:v1") ?? "[]").length)).toBe(1);
  const first = await page.locator(".typing-passage").textContent();

  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("typing-level:recent-texts:v1") ?? "[]").length)).toBe(2);
  const second = await page.locator(".typing-passage").textContent();
  expect(second).not.toBe(first);

  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("x");
  await page.clock.fastForward(60_100);
  await page.getByRole("button", { name: "RETEST 1 MIN" }).click();
  const third = await page.locator(".typing-passage").textContent();
  expect(third).not.toBe(second);
});

test("changing duration keeps the current passage and guide state", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("typing-level:finger-guide:v1", "on"));
  await page.goto("/3-minute-typing-test");
  const passage = page.locator(".typing-passage");
  const before = await passage.textContent();
  const guideBefore = await page.locator(".keyboard-guide-heading").textContent();

  await page.getByRole("link", { name: "5 MIN", exact: true }).click();
  await expect(page).toHaveURL(/\/5-minute-typing-test$/);
  await expect(page.getByRole("link", { name: "5 MIN", exact: true })).toHaveClass(/selected/);
  await expect(passage).toHaveText(before ?? "");
  await expect(page.locator(".keyboard-guide-heading")).toHaveText(guideBefore ?? "");
  await expect(page.getByRole("textbox", { name: "Type the passage here" })).toBeFocused();
});

test("difficulty and New Testing change text, then the toolbar switches when typing starts", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  const standard = page.getByRole("button", { name: "Standard", exact: true });
  const advanced = page.getByRole("button", { name: "Advanced", exact: true });
  const newTesting = page.getByRole("button", { name: "New Testing" });
  await expect(standard).toHaveAttribute("aria-pressed", "true");
  await standard.focus();
  await expect(page.locator(".typed-current")).toHaveCount(1);
  const standardText = await page.locator(".typing-passage").textContent();

  await advanced.click();
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  const firstAdvanced = await page.locator(".typing-passage").textContent();
  expect(firstAdvanced).not.toBe(standardText);
  await newTesting.click();
  const secondAdvanced = await page.locator(".typing-passage").textContent();
  expect(secondAdvanced).not.toBe(firstAdvanced);
  await expect(advanced).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("x");
  await expect(advanced).toHaveCount(0);
  await expect(newTesting).toBeVisible();
  await expect(page.getByRole("timer")).toBeVisible();
  await newTesting.click();
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("timer")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("x");
  await page.clock.fastForward(60_100);
  await page.getByRole("button", { name: "RETEST 1 MIN" }).click();
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  await expect(newTesting).toBeEnabled();

  await page.reload();
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
});

test("paste is rejected and local history can be cleared from home statistics", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  await expect(input).toBeFocused();
  await input.evaluate((element) => {
    element.dispatchEvent(new Event("paste", { bubbles: true, cancelable: true }));
  });
  await expect(page.getByRole("status")).toContainText("Paste isn't available");
  await expect(input).toHaveValue("");
  await input.pressSequentially("test");
  await page.clock.fastForward(60_100);
  await page.goto("/");
  await expect(page.locator(".home-stats-list-row").first()).toContainText("1 MIN");
  await page.getByRole("button", { name: "Clear local history" }).click();
  await page.getByRole("button", { name: "Clear results" }).click();
  await expect(page.getByText("No completed tests in this browser yet.", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("typing-performance:results:v1"))).toBeNull();
  await page.reload();
  await expect(page.getByText("No completed tests in this browser yet.", { exact: false })).toBeVisible();
});

test("an idle test does not start the timer or save a score", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  await page.clock.fastForward(60_100);
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
  await expect(page.getByRole("group", { name: "Test status" })).toHaveCount(0);
  await expect(page.locator(".history-section")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("typing-performance:results:v1"))).toBeNull();
  await expect(page.locator(".typed-current")).toHaveCount(1);
});

test("finger guide follows the next character and remembers its toggle", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    if (localStorage.getItem("typing-level:finger-guide:v1") === null) {
      localStorage.setItem("typing-level:finger-guide:v1", "on");
    }
  });
  await page.goto("/1-minute-typing-test");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  const toggle = page.getByRole("switch", { name: "Show finger guide" });

  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".virtual-key.is-active")).toHaveCount(2);
  await expect(page.locator(".virtual-key.is-active").filter({ hasText: "A" })).toHaveCount(1);
  await expect(page.locator(".virtual-key.is-modifier")).toHaveText("SHIFT");
  await expect(page.locator(".guide-finger, .guide-fingertip-target")).toHaveCount(0);
  await expect(page.locator(".keyboard-guide-visual")).toHaveAttribute("data-hand-state", "target");
  await expect(page.locator(".photo-hand-left")).toHaveAttribute("data-target-key", "KeyA");
  await expect(page.locator(".photo-hand-right")).toHaveAttribute("data-target-key", "ShiftRight");
  await expect(page.locator(".photo-hand-left")).toHaveClass(/hand-pose-pinky/);
  await expect(page.locator(".photo-hand-right")).toHaveClass(/hand-pose-pinky/);
  await expect(page.locator(".photo-hand-sprite-accent")).toHaveCount(2);

  const keyboardBefore = await page.locator(".virtual-keyboard").boundingBox();
  const leftHandBefore = await page.locator(".photo-hand-left").boundingBox();
  const rightHandBefore = await page.locator(".photo-hand-right").boundingBox();
  expect(keyboardBefore).not.toBeNull();
  expect(leftHandBefore).not.toBeNull();
  expect(rightHandBefore).not.toBeNull();
  expect(leftHandBefore!.width / keyboardBefore!.width).toBeGreaterThanOrEqual(0.37);
  expect(leftHandBefore!.width / keyboardBefore!.width).toBeLessThanOrEqual(0.45);
  expect(rightHandBefore!.width / keyboardBefore!.width).toBeGreaterThanOrEqual(0.37);
  expect(rightHandBefore!.width / keyboardBefore!.width).toBeLessThanOrEqual(0.45);

  await input.pressSequentially("A");
  await expect(page.locator(".keyboard-guide-visual")).toHaveAttribute("data-hand-state", "target");
  await expect(page.locator(".keyboard-guide-heading")).toContainText("SPACE");
  await expect(page.locator(".virtual-key.is-active")).toHaveText("SPACE");
  await expect(page.locator(".photo-hand-left")).toHaveAttribute("data-target-key", "KeyF");
  await expect(page.locator(".photo-hand-right")).toHaveAttribute("data-target-key", "Space");
  await expect(page.locator(".photo-hand-right")).toHaveClass(/hand-pose-thumb/);
  await expect(page.locator(".photo-hand-sprite-accent")).toHaveCount(1);
  await expect(page.locator(".keyboard-hands")).toHaveCount(1);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(page.locator(".keyboard-guide-visual")).toHaveCount(0);
  await expect(input).toBeFocused();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("typing-level:finger-guide:v1"))).toBe("off");

  await page.reload();
  await expect(page.getByRole("switch", { name: "Show finger guide" })).toHaveAttribute("aria-checked", "false");
});

test("finger guide starts collapsed on a compact viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/1-minute-typing-test");
  await expect(page.getByRole("switch", { name: "Show finger guide" })).toHaveAttribute("aria-checked", "false");
  await expect(page.locator(".keyboard-guide-visual")).toHaveCount(0);
});

test("New Testing restores first-key start without keeping old text", async ({ page }) => {
  await page.goto("/2-minute-typing-test");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  const previousText = await page.locator(".typing-passage").textContent();
  await input.pressSequentially("a");
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "running");
  await page.getByRole("button", { name: "New Testing" }).click();
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
  await expect(page.getByRole("timer")).toHaveCount(0);
  expect(await page.locator(".typing-passage").textContent()).not.toBe(previousText);
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await input.pressSequentially("b");
  await expect(input).toHaveValue("b");
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "running");
});

test("public routes expose unique titles and canonical URLs", async ({ page, request }) => {
  for (const slug of ["typing-test", ...durations.map((item) => item.slug), "average-wpm", "average-typing-speed", "privacy"]) {
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
  expect(await sitemap.text()).toContain("/privacy");
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
  await expect(page.getByRole("group", { name: "Choose test duration" })).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(horizontalOverflow).toBe(false);
  const viewport = page.viewportSize();
  const chamber = await page.locator(".typing-chamber").boundingBox();
  expect(viewport).not.toBeNull();
  expect(chamber).not.toBeNull();
  expect(chamber!.y).toBeLessThan(viewport!.height / 2);
  const alignment = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(".typing-stage")!;
    const chamber = document.querySelector<HTMLElement>(".typing-chamber")!;
    const captureInput = document.querySelector<HTMLElement>(".typing-capture-input")!;
    const passage = document.querySelector<HTMLElement>(".typing-passage")!;
    const toolbar = document.querySelector<HTMLElement>(".test-toolbar")!;
    const guideToggle = document.querySelector<HTMLElement>(".keyboard-guide-toggle")!;
    const selectedDuration = document.querySelector<HTMLElement>(".duration-card.selected")!;
    const selectedDifficulty = document.querySelector<HTMLElement>('.difficulty-option[aria-pressed="true"]')!;
    const instructions = document.querySelector<HTMLElement>("#typing-instructions")!;
    const guide = document.querySelector<HTMLElement>(".keyboard-guide");
    const guideVisual = document.querySelector<HTMLElement>(".keyboard-guide-visual");
    const handBounds = Array.from(document.querySelectorAll<HTMLElement>(".photo-hand"), (hand) => hand.getBoundingClientRect());
    const shellStyles = getComputedStyle(document.querySelector<HTMLElement>(".test-shell")!);
    return {
      controlsInToolbar: toolbar.contains(document.querySelector(".duration-cards")) && toolbar.contains(selectedDifficulty) && toolbar.contains(document.querySelector(".keyboard-guide-toggle")) && toolbar.contains(document.querySelector(".new-testing")),
      toolbarHeight: toolbar.getBoundingClientRect().height,
      guideToggleBorderWidth: getComputedStyle(guideToggle).borderWidth,
      selectedDurationColor: getComputedStyle(selectedDuration).color,
      selectedDifficultyColor: getComputedStyle(selectedDifficulty).color,
      selectedDurationBackground: getComputedStyle(selectedDuration).backgroundColor,
      shellPaddingLeft: parseFloat(shellStyles.paddingLeft),
      shellPaddingRight: parseFloat(shellStyles.paddingRight),
      leftGap: Math.abs(stage.getBoundingClientRect().left - toolbar.getBoundingClientRect().left),
      rightGap: Math.abs(stage.getBoundingClientRect().right - chamber.getBoundingClientRect().right),
      stageTop: stage.getBoundingClientRect().top,
      chamberPaddingTop: parseFloat(getComputedStyle(chamber).paddingTop),
      statusRemoved: document.querySelector(".test-status") === null,
      chamberBackground: getComputedStyle(chamber).backgroundColor,
      captureOpacity: getComputedStyle(captureInput).opacity,
      passageColor: getComputedStyle(passage).color,
      passageFontSize: parseFloat(getComputedStyle(passage).fontSize),
      passageVisibleLines: passage.getBoundingClientRect().height / parseFloat(getComputedStyle(passage).lineHeight),
      passageCharacters: passage.textContent?.length ?? 0,
      passageHasClippedOverflow: passage.scrollHeight > passage.clientHeight,
      passageOverflow: getComputedStyle(passage).overflow,
      passageLineHeight: parseFloat(getComputedStyle(passage).lineHeight),
      guideBorderTopWidth: guide ? getComputedStyle(guide).borderTopWidth : null,
      instructionsAreScreenReaderOnly: instructions.classList.contains("sr-only"),
      handTopGap: guideVisual && handBounds.length > 0
        ? Math.min(...handBounds.map((bounds) => bounds.top)) - guideVisual.getBoundingClientRect().top
        : null,
      handsLayerBottomGap: guideVisual
        ? guideVisual.getBoundingClientRect().bottom
          - document.querySelector<HTMLElement>(".keyboard-hands")!.getBoundingClientRect().bottom
        : null,
      handsLayerOverflow: guideVisual
        ? getComputedStyle(document.querySelector<HTMLElement>(".keyboard-hands")!).overflow
        : null,
    };
  });
  expect(alignment.controlsInToolbar).toBe(true);
  if (viewport!.width > 900) expect(alignment.toolbarHeight).toBe(56);
  expect(alignment.guideToggleBorderWidth).toBe("0px");
  expect(alignment.selectedDurationColor).toBe(alignment.selectedDifficultyColor);
  expect(alignment.selectedDurationBackground).toBe("rgba(0, 0, 0, 0)");
  expect(alignment.leftGap).toBeLessThanOrEqual(1);
  expect(alignment.rightGap).toBeLessThanOrEqual(1);
  const expectedPageGutter = viewport!.width <= 680 ? 12 : viewport!.width <= 900 ? 32 : 50;
  expect(alignment.shellPaddingLeft).toBe(expectedPageGutter);
  expect(alignment.shellPaddingRight).toBe(alignment.shellPaddingLeft);
  expect(alignment.stageTop).toBeLessThan(viewport!.height * 0.65);
  expect(alignment.chamberBackground).toBe("rgba(0, 0, 0, 0)");
  expect(alignment.captureOpacity).toBe("0");
  expect(alignment.passageColor).toBe("rgb(120, 120, 120)");
  expect(alignment.passageFontSize).toBe(viewport!.width <= 680 ? 26 : 30);
  expect(alignment.passageVisibleLines).toBeGreaterThanOrEqual(5);
  expect(alignment.passageVisibleLines).toBeLessThan(5.1);
  expect(alignment.passageCharacters).toBeGreaterThanOrEqual(520);
  expect(alignment.passageHasClippedOverflow).toBe(true);
  expect(alignment.passageOverflow).toBe("hidden");
  expect(alignment.passageLineHeight).toBeGreaterThanOrEqual(viewport!.width <= 680 ? 42.8 : 50.9);
  if (alignment.guideBorderTopWidth !== null) expect(alignment.guideBorderTopWidth).toBe("0px");
  expect(alignment.chamberPaddingTop).toBe(8);
  expect(alignment.statusRemoved).toBe(true);
  expect(alignment.instructionsAreScreenReaderOnly).toBe(true);
  if (alignment.handTopGap !== null) expect(alignment.handTopGap).toBeGreaterThanOrEqual(0);
  if (alignment.handsLayerBottomGap !== null) expect(Math.abs(alignment.handsLayerBottomGap)).toBeLessThanOrEqual(1);
  if (alignment.handsLayerOverflow !== null) expect(alignment.handsLayerOverflow).toBe("hidden");
  await expect(page.getByRole("button", { name: "START TYPING TEST" })).toHaveCount(0);
  await expect(page.locator(".typed-current")).toHaveCount(1);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test("top-level sections share one responsive page gutter", async ({ page }) => {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const expected = viewport!.width <= 680 ? 12 : viewport!.width <= 900 ? 32 : 50;
  const routes = [
    {
      path: "/",
      checks: [
        [".site-header", "padding"],
        [".site-footer", "padding"],
        [".home-hero", "margin"],
        [".marquee-strip", "margin"],
        [".home-tests", "padding"],
        [".home-understand", "margin"],
      ],
    },
    {
      path: "/5-minute-typing-test",
      checks: [
        [".test-shell", "padding"],
        [".test-explainer", "margin"],
        [".faq-section", "padding"],
      ],
    },
    {
      path: "/average-wpm",
      checks: [
        [".content-hero", "margin"],
        [".content-article", "padding"],
        [".content-cta", "margin"],
      ],
    },
  ] as const;

  for (const route of routes) {
    await page.goto(route.path);
    const values = await page.evaluate((checks) => checks.map(([selector, kind]) => {
      const styles = getComputedStyle(document.querySelector<HTMLElement>(selector)!);
      return {
        selector,
        left: parseFloat(kind === "margin" ? styles.marginLeft : styles.paddingLeft),
        right: parseFloat(kind === "margin" ? styles.marginRight : styles.paddingRight),
      };
    }), route.checks);

    for (const value of values) {
      expect.soft(value.left, `${route.path} ${value.selector} left gutter`).toBe(expected);
      expect.soft(value.right, `${route.path} ${value.selector} right gutter`).toBe(expected);
    }
  }
});

test("keyboard flow and running/result states pass accessibility checks", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/1-minute-typing-test");
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
  await expect(page.getByRole("textbox", { name: "Type the passage here" })).toBeFocused();
  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("test");
  await page.clock.fastForward(60_100);
  await expect(page.getByRole("heading", { name: /wpm/i })).toBeVisible();
  await expect(page.getByText("Recent results could not be saved in this browser.", { exact: false })).toBeVisible();
  await expect(page.locator(".history-section")).toHaveCount(0);
  await page.getByRole("button", { name: "RETEST 1 MIN" }).click();
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
});
