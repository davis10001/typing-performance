import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Learn opens directly on continuous practice, then courses and guidance", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByText("Loading the Keybr learning model…")).toBeHidden({ timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn touch typing");
  await expect(page.getByRole("heading", { name: /^Focus / })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  expect(await page.locator(".learning-toolbar").evaluate((element) => element.getBoundingClientRect().height)).toBe(56);
  await expect(page.locator(".course-card")).toHaveCount(15);
  await expect(page.locator(".course-card--next")).toHaveCount(1);
  await expect(page.locator(".course-card--not-started")).toHaveCount(14);
  await expect(page.locator(".course-card").nth(14).getByRole("link")).toHaveAttribute("href", "/learn/courses/caps1");
  await expect(page.getByRole("heading", { name: "Two ways to learn touch typing." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("continuous practice loads the locked Keybr engine and rejects paste", async ({ page }) => {
  await page.goto("/learn/practice");
  await expect(page.getByText("Loading the Keybr learning model…")).toBeHidden({ timeout: 20_000 });
  await expect(page.getByText(/^Focus /)).toBeVisible();
  const input = page.getByRole("textbox", { name: "Type the learning exercise here" });
  await expect(input).toBeFocused();
  const before = await page.locator(".learning-passage .typed-current").textContent();
  await input.evaluate((element) => {
    element.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true }));
  });
  await expect(page.locator(".learning-passage .typed-current")).toHaveText(before ?? "");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("continuous practice completes once and saves a Keybr result", async ({ page }) => {
  await page.goto("/learn/practice");
  await expect(page.getByText("Loading the Keybr learning model…")).toBeHidden({ timeout: 20_000 });
  const prompt = await page.locator(".learning-passage").textContent();
  expect(prompt?.length).toBeGreaterThan(10);
  // Keybr rejects per-key samples faster than 40 ms as physically implausible.
  await page.getByRole("textbox", { name: "Type the learning exercise here" }).pressSequentially(prompt!, { delay: 60 });
  await expect(page.getByRole("heading", { name: "Keep the rhythm." })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("typing-performance:learning:v1:guided"))).not.toBeNull();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:learning:v1:guided") ?? "{}"));
  expect(saved.state.results).toHaveLength(1);
});

test("fixed courses are freely selectable and preserve KTouch correction", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.locator(".course-card")).toHaveCount(15);
  await expect(page.locator(".course-card").nth(1)).not.toHaveClass(/is-locked/);
  await page.locator(".course-card").nth(1).getByRole("link").click();
  await expect(page).toHaveURL(/\/learn\/courses\/kd1$/);
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  expect(await page.locator(".learning-toolbar").evaluate((element) => element.getBoundingClientRect().height)).toBe(56);
  const input = page.getByRole("textbox", { name: "Type the learning exercise here" });
  const expected = await page.locator(".learning-passage .typed-current").textContent();
  const wrong = expected === "x" ? "z" : "x";
  await input.press(wrong);
  await expect(page.locator(".learning-passage .typed-error")).toHaveCount(1);
  await input.press("Backspace");
  await expect(page.locator(".learning-passage .typed-error")).toHaveCount(0);
  await expect(page.locator(".learning-passage .typed-current")).toHaveText(expected ?? "");
  await input.press(expected!);
  await page.locator(".learning-toolbar h1").click();
  await expect(page.locator(".learning-passage .typed-correct")).toHaveCount(1);
  await expect(page.getByText(/Leaving the exercise pauses the lesson timer/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("learning text advances by line without a manually scrollable passage", async ({ page }) => {
  await page.goto("/learn/courses/kd1");
  const passage = page.locator(".learning-passage");
  const input = page.getByRole("textbox", { name: "Type the learning exercise here" });
  const prompt = await passage.textContent();
  expect(prompt?.length).toBeGreaterThan(160);
  await expect(passage).toHaveCSS("overflow", "hidden");
  await expect(passage).toHaveAttribute("data-window-start", "0");

  const prefix = prompt!.slice(0, 180).split("\n");
  for (let index = 0; index < prefix.length; index += 1) {
    await input.pressSequentially(prefix[index]);
    if (index < prefix.length - 1) await input.press("Enter");
  }

  await expect.poll(async () => Number(await passage.getAttribute("data-window-start"))).toBeGreaterThan(0);
  const currentIsVisible = await passage.evaluate((element) => {
    const current = element.querySelector<HTMLElement>(".typed-current");
    if (!current) return false;
    const passageBounds = element.getBoundingClientRect();
    const currentBounds = current.getBoundingClientRect();
    return currentBounds.top >= passageBounds.top && currentBounds.bottom <= passageBounds.bottom;
  });
  expect(currentIsVisible).toBe(true);
});

test("a passed course is marked complete while every lesson stays available", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  test.skip(testInfo.project.name !== "desktop", "Long end-to-end completion is covered once on desktop.");
  await page.goto("/learn/courses/jf1");
  const prompt = await page.locator(".learning-passage").textContent();
  expect(prompt).not.toBeNull();
  const input = page.getByRole("textbox", { name: "Type the learning exercise here" });
  await input.focus();
  const lines = prompt!.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    await page.keyboard.type(lines[index]);
    if (index < lines.length - 1) await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("heading", { name: "Lesson passed." })).toBeVisible();
  await expect(page.locator(".learning-result-actions").getByRole("button", { name: "Reset" })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("typing-performance:learning:v1:course"))).not.toBeNull();
  await page.goto("/learn/courses");
  await expect(page.locator(".course-card").nth(0)).toHaveClass(/course-card--completed/);
  await expect(page.locator(".course-card").nth(0)).toContainText("Practice again");
  await expect(page.locator(".course-card").nth(1)).toHaveClass(/course-card--next/);
  await expect(page.locator(".course-card").nth(1).getByRole("link")).toBeVisible();
  await expect(page.locator(".course-card").nth(14).getByRole("link")).toBeVisible();
});

test("learning reset preserves typing-test history", async ({ page }) => {
  await page.goto("/privacy");
  await page.evaluate(() => {
    localStorage.setItem("typing-performance:learning:v1:guided", "guided-progress");
    localStorage.setItem("typing-performance:learning:v1:course", "course-progress");
    localStorage.setItem("typing-performance:results:v1", "test-history");
  });
  await page.getByRole("button", { name: "Clear learning progress" }).click();
  await page.getByRole("group", { name: "Clear learning progress" }).getByRole("button", { name: "Clear learning progress" }).click();
  await expect(page.getByRole("status")).toContainText("typing-test results were not changed");
  const values = await page.evaluate(() => ({
    guided: localStorage.getItem("typing-performance:learning:v1:guided"),
    course: localStorage.getItem("typing-performance:learning:v1:course"),
    history: localStorage.getItem("typing-performance:results:v1"),
  }));
  expect(values).toEqual({ guided: null, course: null, history: "test-history" });
});
