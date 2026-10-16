import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function installAudioContextSpy(page: Page) {
  await page.addInitScript(() => {
    class FakeAudioContext {
      sampleRate = 48_000;
      currentTime = 0;
      state = "running";
      destination = {};

      createBuffer(_channels: number, length: number) {
        const samples = new Float32Array(length);
        return { getChannelData: () => samples };
      }

      createBufferSource() {
        return {
          buffer: null,
          playbackRate: { value: 1 },
          connect: <T>(node: T) => node,
          start: () => sessionStorage.setItem("typing-sound-starts", String(Number(sessionStorage.getItem("typing-sound-starts") ?? "0") + 1)),
        };
      }

      createBiquadFilter() {
        return { type: "bandpass", frequency: { value: 0 }, Q: { value: 0 }, connect: <T>(node: T) => node };
      }

      createGain() {
        return {
          gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
          connect: <T>(node: T) => node,
        };
      }

      resume() { return Promise.resolve(); }
      close() { return Promise.resolve(); }
    }

    Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext });
  });
}

test("Practice offers distinct routes to adaptive rounds and lessons", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Practice typing");
  await expect(page.locator(".practice-paths article")).toHaveCount(2);
  await expect(page.getByRole("link", { name: /Start adaptive practice/ })).toHaveAttribute("href", "/learn/practice");
  await expect(page.getByRole("link", { name: /Browse lessons/ })).toHaveAttribute("href", "/learn/courses");
  await expect(page.getByRole("link", { name: /Choose a paragraph/ })).toHaveCount(0);
  await page.getByRole("link", { name: /Browse lessons/ }).click();
  await expect(page.locator(".course-card")).toHaveCount(15);
  await expect(page.locator(".course-card--next")).toHaveCount(1);
  await expect(page.locator(".course-card").nth(14)).toHaveAttribute("href", "/learn/courses/caps1");
  const courseColumns = await page.locator(".course-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(courseColumns).toBe(page.viewportSize()!.width > 900 ? 3 : page.viewportSize()!.width > 680 ? 2 : 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("continuous practice loads the locked Keybr engine and rejects paste", async ({ page }) => {
  await page.goto("/learn/practice");
  await expect(page.getByText("Loading practice…")).toBeHidden({ timeout: 20_000 });
  await expect(page.getByText(/^Focus /)).toBeVisible();
  const input = page.getByRole("textbox", { name: "Type the exercise here" });
  await expect(input).toBeFocused();
  const before = await page.locator(".learning-passage .typed-current").textContent();
  await input.evaluate((element) => {
    element.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true }));
  });
  await expect(page.locator(".learning-passage .typed-current")).toHaveText(before ?? "");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Practice plays typing sounds and respects the shared Tester preference", async ({ page }) => {
  await installAudioContextSpy(page);
  await page.goto("/learn/courses/jf1");
  const input = page.getByRole("textbox", { name: "Type the exercise here" });
  const expected = await page.locator(".learning-passage .typed-current").textContent();
  await input.press(expected!);
  await input.press("Backspace");
  expect(await page.evaluate(() => Number(sessionStorage.getItem("typing-sound-starts")))).toBe(2);

  await page.evaluate(() => localStorage.setItem("typing-level:typing-sound:v1", "off"));
  await page.reload();
  const mutedExpected = await page.locator(".learning-passage .typed-current").textContent();
  await page.getByRole("textbox", { name: "Type the exercise here" }).press(mutedExpected!);
  expect(await page.evaluate(() => Number(sessionStorage.getItem("typing-sound-starts")))).toBe(2);
});

test("continuous practice completes once and saves a Keybr result", async ({ page }) => {
  await page.goto("/learn/practice");
  await expect(page.getByText("Loading practice…")).toBeHidden({ timeout: 20_000 });
  const prompt = await page.locator(".learning-passage").textContent();
  expect(prompt?.length).toBeGreaterThan(10);
  // Keybr rejects per-key samples faster than 40 ms as physically implausible.
  await page.getByRole("textbox", { name: "Type the exercise here" }).pressSequentially(prompt!, { delay: 60 });
  await expect(page.getByRole("heading", { name: "Here's how you did." })).toBeVisible();
  await expect(page.locator(".guided-result-note")).toContainText("Focus key");
  await expect(page.locator(".learning-result-metrics")).toContainText(/\d+\.\d%/);
  await expect(page.locator(".learning-result-metrics")).toContainText(/accuracy · \d+ \/ \d+ correct/);
  await expect(page.locator(".learning-result-metrics")).toContainText("mistyped positions");
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("typing-performance:learning:v1:guided"))).not.toBeNull();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:learning:v1:guided") ?? "{}"));
  expect(saved.state.results).toHaveLength(1);
  await page.getByRole("button", { name: "Reset continuous practice progress" }).click();
  await expect(page.locator(".learning-practice-surface")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("typing-performance:learning:v1:guided") ?? "{}").state?.results?.length)).toBe(0);
  const firstStage = page.locator(".learning-stage-button").first();
  await firstStage.hover();
  await expect(firstStage.getByRole("tooltip")).toBeVisible();
  await firstStage.click();
  await expect(page.locator(".learning-practice-surface")).toBeVisible();
});

test("continuous practice lets a learner continue after missing the recommended speed", async ({ page }) => {
  await page.goto("/learn/practice");
  await expect(page.getByText("Loading practice…")).toBeHidden({ timeout: 20_000 });
  const prompt = await page.locator(".learning-passage").textContent();
  expect(prompt).toBeTruthy();

  await page.getByRole("textbox", { name: "Type the exercise here" }).evaluate((element, text) => {
    [...text].forEach((character, index) => {
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: character === "\n" ? "Enter" : character,
      });
      Object.defineProperty(event, "timeStamp", { value: (index + 1) * 400 });
      element.dispatchEvent(event);
    });
  }, prompt!);

  await expect(page.getByRole("heading", { name: "Here's how you did." })).toBeVisible();
  await expect(page.getByText(/practice F again, or continue to L now/i)).toBeVisible();
  const continueButton = page.getByRole("button", { name: /Continue to L/ });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.getByRole("heading", { name: "Focus L" })).toBeVisible();
});

test("fixed courses are freely selectable and preserve KTouch correction", async ({ page }) => {
  await page.goto("/learn/courses");
  await expect(page.locator(".course-card")).toHaveCount(15);
  await expect(page.locator(".course-card").nth(1)).not.toHaveClass(/is-locked/);
  await page.locator(".course-card").nth(1).click();
  await expect(page).toHaveURL(/\/learn\/courses\/kd1$/);
  await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to lessons" })).toHaveAttribute("href", "/learn/courses");
  await expect(page.locator(".learning-toolbar")).not.toContainText("New keys");
  const courseStageKeys = page.locator(".virtual-key.is-stage-key");
  await expect(courseStageKeys).toHaveCount(2);
  expect((await courseStageKeys.allTextContents()).sort()).toEqual(["D", "K"]);
  await expect(page.locator('.virtual-key[data-key-code="KeyJ"] .virtual-key-label')).toHaveText("J");
  expect(await page.locator(".learning-toolbar").evaluate((element) => element.getBoundingClientRect().height)).toBe(56);
  const input = page.getByRole("textbox", { name: "Type the exercise here" });
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
  await expect(page.locator(".learning-focus-note")).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("fixed lesson space errors stay in place and clear when the space is retyped", async ({ page }) => {
  await page.goto("/learn/courses/jf1");
  const passage = page.locator(".learning-passage");
  const prompt = await passage.textContent();
  expect(prompt).not.toBeNull();
  const firstSpace = prompt!.indexOf(" ");
  const space = passage.locator(`[data-learning-index="${firstSpace}"]`);
  const nextCharacter = passage.locator(`[data-learning-index="${firstSpace + 1}"]`);
  const input = page.getByRole("textbox", { name: "Type the exercise here" });
  await input.pressSequentially(prompt!.slice(0, firstSpace));
  const nextBefore = await nextCharacter.boundingBox();
  await input.press("x");
  await expect(space).toHaveClass(/typed-space-error/);
  await expect(space).toHaveClass(/typed-current/);
  await expect(space).toHaveText(" ");
  await expect(passage.locator(".typed-error")).toHaveCount(0);
  const nextAfter = await nextCharacter.boundingBox();
  expect(nextBefore).not.toBeNull();
  expect(nextAfter).not.toBeNull();
  expect(Math.abs(nextAfter!.x - nextBefore!.x)).toBeLessThan(1);
  await input.press(" ");
  await expect(space).not.toHaveClass(/typed-space-error/);
  await input.press("Backspace");
  await expect(space).toHaveClass(/typed-space-error/);
  await input.press(" ");
  await expect(space).not.toHaveClass(/typed-space-error/);
  await expect(nextCharacter).toHaveClass(/typed-current/);
});

test("learning text advances by line without a manually scrollable passage", async ({ page }) => {
  await page.goto("/learn/courses/kd1");
  const passage = page.locator(".learning-passage");
  const input = page.getByRole("textbox", { name: "Type the exercise here" });
  const prompt = await passage.textContent();
  expect(prompt?.length).toBeGreaterThan(160);
  await expect(passage).toHaveCSS("overflow", "hidden");
  await expect(passage).toHaveAttribute("data-window-start", "0");

  const lastVisibleLineStart = await passage.evaluate((element) => {
    const characters = Array.from(element.querySelectorAll<HTMLElement>("[data-learning-index]"));
    const lineTops = [...new Set(characters.map((character) => character.offsetTop))];
    const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
    const visibleLines = Math.max(1, Math.floor(element.clientHeight / lineHeight));
    const lastVisibleTop = lineTops[visibleLines - 1];
    return Number(characters.find((character) => character.offsetTop === lastVisibleTop)?.dataset.learningIndex);
  });
  expect(lastVisibleLineStart).toBeGreaterThan(0);

  const prefix = prompt!.slice(0, lastVisibleLineStart).split("\n");
  for (let index = 0; index < prefix.length; index += 1) {
    await input.pressSequentially(prefix[index]);
    if (index < prefix.length - 1) await input.press("Enter");
  }

  // Keep one upcoming line visible instead of waiting for the caret to pass below the viewport.
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
  const input = page.getByRole("textbox", { name: "Type the exercise here" });
  await input.focus();
  await page.keyboard.type(prompt![0] === "x" ? "z" : "x");
  await page.keyboard.press("Backspace");
  const lines = prompt!.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    await page.keyboard.type(lines[index]);
    if (index < lines.length - 1) await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("heading", { name: "Lesson 01 complete." })).toBeVisible();
  await expect(page.locator(".lesson-result-summary")).toContainText("Your accuracy and pace both reached the lesson targets");
  await expect(page.locator(".course-result-keys")).toContainText("1 mistake");
  await expect(page.locator(".lesson-confetti span")).toHaveCount(30);
  await expect(page.locator(".lesson-progress")).toHaveAccessibleName("1 of 15 lessons completed");
  await expect(page.locator(".lesson-next")).toContainText("k and d");
  await expect(page.getByRole("link", { name: "Start next lesson" })).toHaveAttribute("href", "/learn/courses/kd1");
  await expect(page.locator(".learning-result-actions").getByRole("button", { name: "Try again" })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("typing-performance:learning:v1:course"))).not.toBeNull();
  await page.goto("/learn/courses");
  await expect(page.locator(".course-card").nth(0)).toHaveClass(/course-card--completed/);
  await expect(page.locator(".course-card").nth(0)).toContainText("Practice again");
  await expect(page.locator(".course-card").nth(1)).toHaveClass(/course-card--next/);
  await expect(page.locator(".course-card").nth(1)).toBeVisible();
  await expect(page.locator(".course-card").nth(14)).toBeVisible();
});

test("a lesson that misses a goal shows its result and recovery choices", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  test.skip(testInfo.project.name !== "desktop", "Long end-to-end completion is covered once on desktop.");
  await page.goto("/learn/courses/jf1");
  const passage = page.locator(".learning-passage");
  const prompt = await passage.textContent();
  expect(prompt).not.toBeNull();
  const input = page.getByRole("textbox", { name: "Type the exercise here" });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await input.evaluate(async (element, text) => {
    element.focus();
    let uncorrectedMistakes = 0;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (uncorrectedMistakes < 20 && character !== " " && character !== "\n") {
        const wrongCharacter = character === "x" ? "z" : "x";
        element.dispatchEvent(new KeyboardEvent("keydown", { key: wrongCharacter, bubbles: true, cancelable: true }));
        uncorrectedMistakes += 1;
      } else {
        element.dispatchEvent(new KeyboardEvent("keydown", {
          key: character === "\n" ? "Enter" : character,
          bubbles: true,
          cancelable: true,
        }));
      }
      if (index % 20 === 19) await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }, prompt!);

  const result = page.locator(".lesson-result-card");
  await expect(page.getByRole("heading", { name: "Lesson 01 complete." })).toBeVisible();
  await expect(result).toHaveClass(/needs-practice/);
  await expect(result).toContainText("Goal 98% not met");
  await expect(result.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(result.getByRole("link", { name: "Start next lesson" })).toHaveAttribute("href", "/learn/courses/kd1");
  await expect(result.getByRole("link", { name: "Start next lesson" })).toHaveClass(/button-primary/);
  await expect(page.locator(".lesson-confetti")).toHaveCount(0);
  await expect.poll(async () => result.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.top >= 0 && bounds.top < window.innerHeight;
  })).toBe(true);
  await page.goto("/learn/courses");
  await expect(page.locator(".course-card").nth(0)).toHaveClass(/course-card--completed/);
  await expect(page.locator(".course-card").nth(0)).toContainText("Completed");
});

test("learning reset preserves typing-test history", async ({ page }) => {
  await page.goto("/privacy");
  await page.evaluate(() => {
    localStorage.setItem("typing-performance:learning:v1:guided", "guided-progress");
    localStorage.setItem("typing-performance:learning:v1:course", "course-progress");
    localStorage.setItem("typing-performance:results:v1", "test-history");
  });
  await page.getByRole("button", { name: "Clear practice progress" }).click();
  await page.getByRole("group", { name: "Clear practice progress" }).getByRole("button", { name: "Clear practice progress" }).click();
  await expect(page.getByRole("status")).toContainText("saved typing test results are still here");
  const values = await page.evaluate(() => ({
    guided: localStorage.getItem("typing-performance:learning:v1:guided"),
    course: localStorage.getItem("typing-performance:learning:v1:course"),
    history: localStorage.getItem("typing-performance:results:v1"),
  }));
  expect(values).toEqual({ guided: null, course: null, history: "test-history" });
});
