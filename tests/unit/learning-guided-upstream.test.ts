import { describe, expect, it } from "vitest";
import { Layout, loadKeyboard } from "@keybr/keyboard";
import { FakePhoneticModel } from "@keybr/phonetic-model";
import { makeKeyStatsMap } from "@keybr/result";
import { Settings } from "@keybr/settings";
import { GuidedLesson } from "@/vendor/keybr/packages/keybr-lesson/lib/guided";
import { lessonProps } from "@/vendor/keybr/packages/keybr-lesson/lib/settings";

const keyboard = loadKeyboard(Layout.EN_US);

describe("vendored Keybr Guided source", () => {
  it("starts with six frequency-ordered letters and focuses the weakest", () => {
    const model = new FakePhoneticModel(["uno", "due", "tre"]);
    const lesson = new GuidedLesson(new Settings(), keyboard, model, []);
    const keys = lesson.update(makeKeyStatsMap(lesson.letters, []));
    expect(keys.findIncludedKeys().map(({ letter }) => letter.codePoint)).toEqual(
      FakePhoneticModel.letters.slice(0, 6).map(({ codePoint }) => codePoint),
    );
    expect(keys.findFocusedKey()?.letter).toBe(FakePhoneticModel.letter1);
  });

  it("matches the original pseudo-word fixed trajectory", () => {
    const model = new FakePhoneticModel(["uno", "due", "tre"]);
    const settings = new Settings().set(lessonProps.guided.naturalWords, false);
    const lesson = new GuidedLesson(settings, keyboard, model, []);
    const text = lesson.generate(lesson.update(makeKeyStatsMap(lesson.letters, [])), model.rng);
    expect(text).toBe(
      "uno due tre uno due tre uno due tre uno due tre uno due tre uno due tre " +
      "uno due tre uno due tre uno due tre uno due tre uno due tre uno",
    );
  });

  it("uses generated words when the default natural-word pool is empty", () => {
    const model = new FakePhoneticModel(["uno", "due", "tre"]);
    const lesson = new GuidedLesson(new Settings(), keyboard, model, []);
    const text = lesson.generate(lesson.update(makeKeyStatsMap(lesson.letters, [])), model.rng);
    expect(text.replaceAll(" ", "").length).toBeGreaterThanOrEqual(100);
    expect(new Set(text.split(" "))).toEqual(new Set(["uno", "due", "tre"]));
  });
});
