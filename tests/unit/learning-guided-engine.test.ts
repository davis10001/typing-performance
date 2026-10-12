import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Layout } from "@keybr/keyboard";
import { LCG } from "@keybr/rand";
import { Result, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import {
  createEnglishGuidedLesson,
  createGuidedRound,
  KEYBR_MODEL_URL,
  loadEnglishGuidedLesson,
} from "@/lib/learning/guided-engine";

const model = readFileSync("vendor/keybr/packages/keybr-phonetic-model/assets/model-en.data");

describe("English Keybr Guided adapter", () => {
  it("loads the shipped, hash-verified model asset", async () => {
    const lesson = await loadEnglishGuidedLesson(async (url) => {
      expect(url).toBe(KEYBR_MODEL_URL);
      return new Response(model, { status: 200 });
    });
    expect(lesson.letters.length).toBe(26);
  });

  it("starts with four course-ordered keys and repeats early drills", () => {
    const round = createGuidedRound(createEnglishGuidedLesson(model), [], LCG(1));
    expect(round.availableCharacters).toEqual(["j", "f", "k", "d"]);
    expect(round.focusCharacter).toBe("f");
    expect(round.text.replaceAll(" ", "").length).toBeGreaterThanOrEqual(100);
    const allowed = new Set(round.availableCharacters);
    expect([...round.text.replaceAll(" ", "")].every((character) => allowed.has(character))).toBe(true);
    const words = round.text.split(" ");
    expect(words.every((word, index) => index % 2 === 0 || word === words[index - 1])).toBe(true);
  });

  it("returns to varied words when the active key set has enough vocabulary", () => {
    const lesson = createEnglishGuidedLesson(model);
    const results: Result[] = [];
    let round = createGuidedRound(lesson, results, LCG(1));
    for (let index = 0; index < 4; index += 1) {
      const histogram = new Histogram(round.availableCharacters.map((character) => ({
        codePoint: character.codePointAt(0)!, hitCount: 20, missCount: 0, timeToType: 300,
      })));
      results.push(new Result(Layout.EN_US, TextType.GENERATED, index + 1, 120, 20_000, 0, histogram));
      round = createGuidedRound(lesson, results, LCG(index + 2));
    }

    expect(round.availableCharacters).toEqual(["j", "f", "k", "d", "l", "s", "c", "a"]);
    expect(round.focusCharacter).toBe("a");
    const words = round.text.split(" ");
    expect(words.some((word, index) => index % 2 === 1 && word !== words[index - 1])).toBe(true);
  });

  it("does not disguise a missing model as an empty lesson", async () => {
    await expect(loadEnglishGuidedLesson(async () => new Response(null, { status: 404 })))
      .rejects.toThrow("Unable to load the Keybr English model (404)");
  });
});
