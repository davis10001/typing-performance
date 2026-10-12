import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const durations = [
  { slug: "1-minute-typing-test", seconds: 60 },
  { slug: "2-minute-typing-test", seconds: 120 },
  { slug: "3-minute-typing-test", seconds: 180 },
  { slug: "5-minute-typing-test", seconds: 300 },
  { slug: "10-minute-typing-test", seconds: 600 },
] as const;

test("home opens on the typing test with one row of text navigation", async ({ page }) => {
  await page.goto("/");
  const homeLink = page.locator(".site-header").getByRole("link", { name: "TypingLevel home" });
  await expect(homeLink).toBeVisible();
  await expect(homeLink.locator("img")).toHaveAttribute("src", /typing-level-logo/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/images/typing-level-icon.png");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation).toHaveText("TestPracticeCompeteSoonFAQ");
  await expect(navigation.locator("a")).toHaveCount(3);
  await expect(navigation.getByRole("link", { name: "Test" })).toHaveAttribute("href", "/");
  await expect(navigation.getByRole("link", { name: "Practice" })).toHaveAttribute("href", "/learn");
  await expect(navigation.getByRole("link", { name: "Compete, coming soon" })).toHaveAttribute("aria-disabled", "true");
  await expect(navigation.getByRole("link", { name: "Compete, coming soon" })).not.toHaveAttribute("href");
  await expect(navigation.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq");
  await expect(navigation.locator("button, svg, img")).toHaveCount(0);
  const footerNavigation = page.getByRole("navigation", { name: "Footer navigation" });
  await expect(page.locator(".footer-brand img")).toHaveAttribute("src", /typing-level-logo/);
  await expect(page.getByRole("img", { name: "TypingLevel" })).toBeVisible();
  await expect(footerNavigation.getByRole("link", { name: "PRIVACY" })).toHaveAttribute("href", "/privacy");
  await expect(footerNavigation.getByRole("link", { name: "START A TEST" })).toBeHidden();
  await expect(footerNavigation.getByRole("link", { name: "WPM EXPLAINED" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Free typing test");
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
  await expect(page.getByRole("group", { name: "Choose test duration" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Type the passage here" })).toBeFocused();
  await expect(page.locator(".home-stats")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "WHAT IS A GOOD TYPING SPEED?" })).toBeVisible();
  await expect(page.getByText("the average was 52 WPM", { exact: false })).toBeVisible();
  await expect(page.getByRole("img", { name: /Most study participants typed between 30 and 60 WPM/ })).toBeVisible();
  await expect(page.locator(".benchmark-school tbody tr")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Study source" })).toHaveAttribute("href", /aalto\.fi/);
  await expect(page.getByRole("heading", { name: "UNDERSTAND YOUR RESULT." })).toBeVisible();
  await expect(page.getByRole("link", { name: "How scoring works" })).toHaveAttribute("href", "/average-wpm");
  const geometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header")!.getBoundingClientRect();
    const logo = document.querySelector<HTMLElement>(".header-wordmark")!.getBoundingClientRect();
    const nav = document.querySelector<HTMLElement>(".site-nav")!.getBoundingClientRect();
    return {
      headerBottom: header.bottom,
      logoTop: logo.top,
      navTop: nav.top,
      logoRight: logo.right,
      navLeft: nav.left,
      navRight: nav.right,
      headerRight: header.right,
    };
  });
  expect(Math.abs(geometry.logoTop - geometry.navTop)).toBeLessThan(20);
  expect(geometry.navLeft).toBeGreaterThan(geometry.logoRight);
  expect(geometry.navRight).toBeLessThan(geometry.headerRight);
  expect(geometry.navTop).toBeLessThan(geometry.headerBottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("FAQ navigation opens a standalone page with answers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-faq")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.locator(".site-header")).toHaveCSS("border-bottom-width", "0px");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TYPING FAQ.");
  const footerNavigation = page.getByRole("navigation", { name: "Footer navigation" });
  await expect(footerNavigation.getByRole("link")).toHaveCount(2);
  await expect(footerNavigation.getByRole("link", { name: "START A TEST" })).toBeVisible();
  await expect(page.locator(".faq-entry")).toHaveCount(8);
  await expect(page.locator(".faq-list details, .faq-list summary")).toHaveCount(0);
  await expect(page.locator(".faq-list")).toHaveCSS("border-top-width", "0px");
  await expect(page.locator(".faq-entry").first()).toHaveCSS("border-width", "1px");
  await expect(page.locator(".faq-entry").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const firstCard = await page.locator(".faq-entry").first().boundingBox();
  const secondCard = await page.locator(".faq-entry").nth(1).boundingBox();
  const thirdCard = await page.locator(".faq-entry").nth(2).boundingBox();
  const hero = await page.locator(".faq-page .content-hero").boundingBox();
  const firstQuestion = await page.locator(".faq-entry").first().locator("h2").boundingBox();
  const firstAnswer = await page.locator(".faq-entry").first().locator("p").boundingBox();
  const heroTitle = await page.locator("#faq-title").boundingBox();
  expect(firstCard).not.toBeNull();
  expect(secondCard).not.toBeNull();
  expect(thirdCard).not.toBeNull();
  expect(hero).not.toBeNull();
  expect(firstQuestion).not.toBeNull();
  expect(firstAnswer).not.toBeNull();
  expect(heroTitle).not.toBeNull();
  expect(firstAnswer!.y).toBeGreaterThanOrEqual(firstQuestion!.y + firstQuestion!.height);
  expect(Math.abs(firstAnswer!.x - firstQuestion!.x)).toBeLessThan(1);
  expect(Math.abs(firstCard!.x - hero!.x)).toBeLessThan(1);
  expect(Math.abs(firstQuestion!.x - heroTitle!.x)).toBeLessThan(5);
  if (page.viewportSize()!.width > 1000) {
    expect(Math.abs(firstCard!.y - secondCard!.y)).toBeLessThan(1);
    expect(secondCard!.x).toBeGreaterThan(firstCard!.x + firstCard!.width);
    expect(Math.abs(firstCard!.x - thirdCard!.x)).toBeLessThan(1);
    expect(thirdCard!.y).toBeGreaterThan(firstCard!.y + firstCard!.height);
  } else {
    expect(Math.abs(firstCard!.x - secondCard!.x)).toBeLessThan(1);
    expect(secondCard!.y).toBeGreaterThan(firstCard!.y + firstCard!.height);
  }
  await expect(page.getByRole("heading", { name: "What is the average typing speed?" })).toBeVisible();
  await expect(page.getByText("the average was 52 WPM", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How do mistakes and backspaces affect my WPM?" })).toBeVisible();
  await expect(page.getByText("Backspace removes the last character", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "See how WPM works." })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("home test saves a result without showing a statistics module", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  await input.pressSequentially("a");
  await page.clock.fastForward(60_100);
  await expect(page.locator("#result-title")).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:results:v1") ?? "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].durationSeconds).toBe(60);
  await expect(page.locator(".home-stats")).toHaveCount(0);
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

test("space errors mark the space without shifting passage text", async ({ page }) => {
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
  const nextCharacter = passage.locator(`[data-prompt-index="${firstSpace + 1}"]`);
  await input.pressSequentially(`${prompt!.slice(0, typoIndex)}${wrongCharacter}${prompt!.slice(typoIndex + 1, firstSpace)}`);
  const nextBefore = await nextCharacter.boundingBox();
  await input.pressSequentially("xy");

  await expect(passage.locator(".typed-error")).toHaveCount(1);
  await expect(passage.locator(".typed-error")).toHaveText(prompt![typoIndex]);
  const space = passage.locator(`[data-prompt-index="${firstSpace}"]`);
  await expect(space).toHaveClass(/typed-space-error/);
  await expect(space).toHaveText(" ");
  await expect(passage.locator(".typed-extra")).toHaveCount(0);
  await expect(space).toHaveClass(/typed-current/);
  const nextAfter = await nextCharacter.boundingBox();
  expect(nextBefore).not.toBeNull();
  expect(nextAfter).not.toBeNull();
  expect(Math.abs(nextAfter!.x - nextBefore!.x)).toBeLessThan(1);
  expect(Math.abs(nextAfter!.y - nextBefore!.y)).toBeLessThan(1);

  await input.pressSequentially(" ");
  await expect(passage.locator(".typed-current")).toHaveText(prompt![firstSpace + 1]);
  await expect(space).not.toHaveClass(/typed-space-error/);

  await input.press("Backspace");
  await expect(passage.locator(".typed-current")).toHaveText(" ");
  await expect(space).toHaveClass(/typed-space-error/);
  await input.pressSequentially(" ");
  await expect(space).not.toHaveClass(/typed-space-error/);
  await input.press("Backspace");
  await input.press("Backspace");
  await expect(space).toHaveClass(/typed-space-error/);
  await input.press("Backspace");
  await expect(space).not.toHaveClass(/typed-space-error/);
});

test("typing passage advances by rendered lines and restores the previous window", async ({ page }) => {
  test.slow();
  await page.goto("/1-minute-typing-test");
  const passage = page.locator(".typing-passage");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  const prompt = await passage.textContent();
  expect(prompt).not.toBeNull();

  const initialLineStarts = await passage.locator("[data-prompt-index]").evaluateAll((characters) => {
    const starts: number[] = [];
    let previousTop: number | null = null;
    for (const character of characters as HTMLElement[]) {
      if (character.offsetTop === previousTop) continue;
      starts.push(Number(character.dataset.promptIndex));
      previousTop = character.offsetTop;
    }
    return starts;
  });
  expect(initialLineStarts.length).toBeGreaterThan(5);

  await input.pressSequentially(prompt!.slice(0, initialLineStarts[2]));
  await expect(passage).toHaveAttribute("data-window-start", "0");
  const thirdLinePosition = await passage.locator(".typed-current").evaluate((current) => {
    const passage = current.parentElement!;
    const tops = [...new Set(Array.from(passage.querySelectorAll<HTMLElement>("[data-prompt-index]"), (character) => character.offsetTop))];
    return tops.indexOf((current as HTMLElement).offsetTop);
  });
  expect(thirdLinePosition).toBe(2);

  await input.pressSequentially(prompt!.slice(initialLineStarts[2], initialLineStarts[5]));
  await expect(passage).toHaveAttribute("data-window-start", String(initialLineStarts[2]));
  const shiftedCaretPosition = await passage.locator(".typed-current").evaluate((current) => {
    const passage = current.parentElement!;
    const tops = [...new Set(Array.from(passage.querySelectorAll<HTMLElement>("[data-prompt-index]"), (character) => character.offsetTop))];
    return tops.indexOf((current as HTMLElement).offsetTop);
  });
  expect(shiftedCaretPosition).toBe(3);

  const backspacesToPreviousWindow = initialLineStarts[5] - initialLineStarts[2] + 1;
  for (let index = 0; index < backspacesToPreviousWindow; index += 1) await input.press("Backspace");
  await expect(passage).toHaveAttribute("data-window-start", String(initialLineStarts[1]));
});

test("typing text size changes only the passage and persists", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  const sizes = page.getByRole("group", { name: "Typing text size" });
  const passage = page.locator(".typing-passage");
  const compact = page.viewportSize()!.width <= 680;
  await expect(sizes.getByRole("button", { name: "Small text size" })).toHaveText("S");
  await expect(sizes.getByRole("button", { name: "Medium text size" })).toHaveText("M");
  await expect(sizes.getByRole("button", { name: "Large text size" })).toHaveText("L");
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

test("the running test shows correct WPM beside the timer", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".test-page-wpm")).toHaveCount(0);
  const opening = (await page.locator(".typing-passage").textContent())!.slice(0, 10);
  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially(opening);
  const currentWpm = async () => Number((await page.locator(".test-page-wpm").textContent())?.split(" ")[0]);
  await expect.poll(currentWpm).toBeGreaterThan(0);
  const initialWpm = await currentWpm();
  await page.clock.fastForward(5_000);
  await expect.poll(currentWpm).toBeLessThan(initialWpm);
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.locator(".test-page-wpm")).toHaveCount(0);
});

test("the result chart tracks pace during one test", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const opening = (await page.locator(".typing-passage").textContent())!.slice(0, 12);
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  await input.pressSequentially(opening.slice(0, 6));
  await page.clock.fastForward(1_100);
  await input.pressSequentially(opening[6] === "x" ? "q" : "x");
  await input.press("Backspace");
  await input.pressSequentially(opening.slice(6));
  await input.pressSequentially((await page.locator(".typing-passage").textContent())![12] === "x" ? "q" : "x");
  await page.clock.fastForward(1_100);
  await page.clock.fastForward(60_100);
  await expect(page.getByRole("figure", { name: "Your pace during this test" })).toBeVisible();
  const line = await page.locator(".result-pace-correct").getAttribute("d");
  expect((line?.match(/ L /g) ?? []).length).toBeGreaterThan(2);
  await expect(page.locator(".result-pace-error-fixed")).toHaveCount(1);
  await expect(page.locator(".result-pace-error-remaining")).toHaveCount(1);
  await expect(page.locator(".result-pace-insight")).toContainText("1 corrected with Backspace, 1 left in the final text");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.locator(".result-card").getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".result-pace")).toHaveCount(0);
});

for (const duration of durations) {
  test(`${duration.seconds / 60}-minute test completes, saves locally, and retests`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/${duration.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${duration.seconds / 60} Minute Typing Test`);
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
    const timer = page.getByRole("timer");
    const secondsRemaining = async () => {
      const clockText = await timer.textContent();
      const match = /^(\d+):(\d{2})$/.exec(clockText ?? "");
      expect(match).not.toBeNull();
      return Number(match![1]) * 60 + Number(match![2]);
    };
    await expect.poll(secondsRemaining).toBeGreaterThan(duration.seconds - 10);
    const initialSecondsRemaining = await secondsRemaining();
    await expect(input).toHaveValue("hello");
    await expect(page.locator(".typed-error").first()).toHaveText(openingCharacter);
    await expect(page.locator(".typed-current")).toHaveCount(1);
    await page.clock.fastForward(1_100);
    await expect.poll(secondsRemaining).toBeLessThan(initialSecondsRemaining);

    await page.clock.fastForward(duration.seconds * 1000 + 100);
    await expect(page.getByRole("timer")).toHaveText("00:00");
    await expect(page.getByRole("heading", { name: /wpm/i })).toBeVisible();
    await expect(page.getByRole("figure", { name: "Your pace during this test" })).toBeVisible();
    await expect(input).toHaveCount(0);
    await expect(page.locator(".history-section")).toHaveCount(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:results:v1") ?? "[]"));
    expect(saved).toHaveLength(1);
    expect(saved[0].durationSeconds).toBe(duration.seconds);
    await page.locator(".result-card").getByRole("button", { name: "Try again" }).click();
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
  await page.locator(".result-card").getByRole("button", { name: "Try again" }).click();
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

test("difficulty and Restart change text, then the toolbar switches when typing starts", async ({ page }) => {
  await page.clock.install();
  await page.goto("/1-minute-typing-test");
  const standard = page.getByRole("button", { name: "Standard", exact: true });
  const advanced = page.getByRole("button", { name: "Advanced", exact: true });
  const reset = page.getByRole("button", { name: "Restart" });
  await expect(standard).toHaveAttribute("aria-pressed", "true");
  await standard.focus();
  await expect(page.locator(".typed-current")).toHaveCount(1);
  const standardText = await page.locator(".typing-passage").textContent();

  await advanced.click();
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  const firstAdvanced = await page.locator(".typing-passage").textContent();
  expect(firstAdvanced).not.toBe(standardText);
  await reset.click();
  const secondAdvanced = await page.locator(".typing-passage").textContent();
  expect(secondAdvanced).not.toBe(firstAdvanced);
  await expect(advanced).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("x");
  await expect(advanced).toHaveCount(0);
  await expect(reset).toBeVisible();
  await expect(page.getByRole("timer")).toBeVisible();
  await reset.click();
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("timer")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially("x");
  await page.clock.fastForward(60_100);
  await page.locator(".result-card").getByRole("button", { name: "Try again" }).click();
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  await expect(reset).toBeEnabled();

  await page.reload();
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
});

test("paste is rejected and local history can be cleared from Privacy", async ({ page }) => {
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
  await page.goto("/privacy");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:results:v1") ?? "[]"))).toHaveLength(1);
  await page.getByRole("button", { name: "Clear local history" }).click();
  await page.getByRole("button", { name: "Clear results" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved results removed from this browser.");
  expect(await page.evaluate(() => localStorage.getItem("typing-performance:results:v1"))).toBeNull();
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem("typing-performance:results:v1"))).toBeNull();
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

test("Restart restores first-key start without keeping old text", async ({ page }) => {
  await page.goto("/2-minute-typing-test");
  const input = page.getByRole("textbox", { name: "Type the passage here" });
  const previousText = await page.locator(".typing-passage").textContent();
  await input.pressSequentially("a");
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "running");
  await page.getByRole("button", { name: "Restart" }).click();
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
  for (const slug of [...durations.map((item) => item.slug), "faq", "average-wpm", "average-typing-speed", "privacy"]) {
    await page.goto(`/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${slug}$`));
    await expect(page).toHaveTitle(/TypingLevel/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  }
  await page.goto("/");
  const homeCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(new URL(homeCanonical!).pathname).toBe("/");
  await page.goto("/typing-test");
  await expect(page).toHaveURL(/\/$/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/2-minute-typing-test");
  expect(sitemapText).toContain("/10-minute-typing-test");
  expect(sitemapText).toContain("/privacy");
  expect(sitemapText).toContain("/faq");
  expect(sitemapText).not.toContain("/typing-test<");
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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("YOUR WPM");
    await expect(page.getByRole("heading", { name: "HOW IS WPM CALCULATED?" })).toBeVisible();
    await expect(page.getByRole("link", { name: /test your wpm/i })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("primary route has no horizontal overflow or blocking accessibility violations", async ({ page }) => {
  await page.goto("/1-minute-typing-test");
  await expect(page.getByRole("group", { name: "Choose test duration" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to typing test" })).toHaveAttribute("href", "/");
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(horizontalOverflow).toBe(false);
  const viewport = page.viewportSize();
  const chamber = await page.locator(".typing-chamber").boundingBox();
  expect(viewport).not.toBeNull();
  expect(chamber).not.toBeNull();
  expect(chamber!.y).toBeLessThan(viewport!.height * (viewport!.width <= 680 ? 0.65 : 0.5));
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
  expect(alignment.passageVisibleLines).toBeGreaterThanOrEqual(4);
  expect(alignment.passageVisibleLines).toBeLessThan(4.1);
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
        [".test-shell", "padding"],
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
  await page.locator(".result-card").getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".test-shell")).toHaveAttribute("data-phase", "ready");
});
