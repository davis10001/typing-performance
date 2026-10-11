import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LCG } from "@keybr/rand";
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

  it("uses the real model, word list and US keyboard for the initial round", () => {
    const round = createGuidedRound(createEnglishGuidedLesson(model), [], LCG(1));
    expect(round.availableCharacters).toHaveLength(6);
    expect(round.focusCharacter).toBe(round.availableCharacters[0]);
    expect(round.text.replaceAll(" ", "").length).toBeGreaterThanOrEqual(100);
    const allowed = new Set(round.availableCharacters);
    expect([...round.text.replaceAll(" ", "")].every((character) => allowed.has(character))).toBe(true);
  });

  it("does not disguise a missing model as an empty lesson", async () => {
    await expect(loadEnglishGuidedLesson(async () => new Response(null, { status: 404 })))
      .rejects.toThrow("Unable to load the Keybr English model (404)");
  });
});
