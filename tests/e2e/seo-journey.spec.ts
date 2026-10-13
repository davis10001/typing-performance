import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("speed guide shows the benchmark and invites a first test by default", async ({ page }) => {
  await page.goto("/good-typing-speed");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link", { name: "Typing Speed" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".content-hero")).toContainText("maintain accurately and consistently");
  await expect(page.getByRole("heading", { name: "What is a good typing speed?" })).toBeVisible();
  await expect(page.getByRole("img", { name: /A WPM scale/ })).toBeVisible();
  await expect(page.locator("#benchmark-bar-caption")).toContainText("self-selected online sample");
  await expect(page.locator("#benchmark-bar-caption")).toContainText("not a universal pass or fail line");
  await expect(page.getByRole("heading", { name: "A quick way to read your score" })).toBeVisible();
  await expect(page.locator(".benchmark-range-grid > p")).toHaveCount(4);
  await expect(page.locator(".benchmark-school")).toHaveCount(0);
  await expect(page.locator(".benchmark-footer")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Your typing report will appear here." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Preview of an unfilled typing report" })).toContainText("Correct speed");
  await expect(page.locator(".speed-followup + .home-benchmark")).toHaveCount(1);
  await expect(page.locator(".speed-duration-picker")).toHaveCSS("border-top-width", "0px");
  await expect(page.getByRole("link", { name: /Take a 1-minute test/ })).toHaveAttribute("href", "/1-minute-typing-test");
  await expect(page.getByRole("navigation", { name: "Typing test lengths" }).getByRole("link")).toHaveCount(5);
  await expect(page.getByRole("link", { name: "Average typing speed" })).toHaveAttribute("href", "/average-typing-speed");
  await expect(page.getByRole("link", { name: "How WPM is calculated" })).toHaveAttribute("href", "/how-wpm-is-calculated");
  await expect(page.getByRole("heading", { name: "What counts as good?" }).locator(".."))
    .toContainText("correct WPM, accuracy, and repeated tests at the same duration");
  await expect(page.locator(".speed-result")).toHaveCount(0);
  await expect(page.getByRole("spinbutton")).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("paragraph practice uses server-readable original text and counts corrected errors", async ({ page, request }) => {
  const response = await request.get("/learn/paragraphs");
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("A clear morning gives the city a different rhythm");
  await page.goto("/learn/paragraphs");
  const prompt = await page.locator(".paragraph-prompt").textContent();
  expect(prompt?.length).toBeGreaterThan(100);
  const input = page.getByRole("textbox", { name: "Type the paragraph here" });
  await input.fill("z");
  await input.fill("");
  await input.fill(prompt!);
  await expect(page.getByRole("heading", { name: "Paragraph complete" })).toBeVisible();
  await expect(page.locator(".paragraph-result")).toContainText("1 mistaken character");
  await expect(page.locator(".paragraph-result")).toContainText("0 still in the final text");
  await expect(page.getByRole("link", { name: "Take a timed test" })).toHaveAttribute("href", "/");
  await page.getByRole("button", { name: "Practice this again" }).click();
  await expect(input).toHaveValue("");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("a completed test carries its result into the speed guide", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const prompt = await page.locator(".typing-passage").textContent();
  await page.getByRole("textbox", { name: "Type the passage here" }).pressSequentially(prompt!.slice(0, 40));
  await page.clock.fastForward(60_100);
  const result = page.locator(".result-card");
  await expect(result.getByRole("link", { name: /Understand my speed/ })).toBeVisible();
  await expect(result.getByRole("link", { name: "What is average WPM?" })).toHaveAttribute("href", "/average-typing-speed");
  await expect(result.getByRole("link", { name: "How scoring works" })).toHaveAttribute("href", "/how-wpm-is-calculated");
  const score = await result.locator("#result-title").textContent();
  await result.getByRole("link", { name: /Understand my speed/ }).click();
  await expect(page).toHaveURL(/\/good-typing-speed$/);
  await expect(page.locator(".speed-result")).toContainText(score!.trim());
  await expect(page.getByRole("heading", { name: "Your typing report is ready." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Completed typing report" })).toContainText("Test length");
  await expect(page.locator(".speed-next")).toHaveCount(0);
});

test("average speed and WPM calculation pages separate benchmark and formula intent", async ({ page }) => {
  await page.goto("/average-typing-speed");
  await expect(page.locator(".content-hero")).toContainText("not the average for all U.S. adults or a universal pass line");
  await expect(page.getByText("52 correct WPM", { exact: false })).toBeVisible();
  await expect(page.getByText("99% accuracy", { exact: false })).toBeVisible();
  await expect(page.getByText("54 WPM five-minute result", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "How WPM is calculated" })).toHaveAttribute("href", "/how-wpm-is-calculated");

  await page.goto("/how-wpm-is-calculated");
  await expect(page.getByRole("heading", { level: 1, name: "HOW WPM IS CALCULATED." })).toBeVisible();
  await expect(page.getByText("240 ÷ 5 ÷ 1 = 48 correct WPM.")).toBeVisible();
  await expect(page.getByText("250 ÷ 5 ÷ 1 = 50 raw WPM.")).toBeVisible();
  await expect(page.getByText("240 ÷ 250 × 100 = 96% accuracy.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Average typing speed" })).toHaveAttribute("href", "/average-typing-speed");
});
