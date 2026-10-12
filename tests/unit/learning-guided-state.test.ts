import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import { createEnglishGuidedLesson, createGuidedMilestones, createGuidedRound } from "@/lib/learning/guided-engine";
import {
  createGuidedState,
  guidedStateSchema,
  recordGuidedResult,
  restoreGuidedResults,
  rewindGuidedState,
} from "@/lib/learning/guided-state";

const model = readFileSync("vendor/keybr/packages/keybr-phonetic-model/assets/model-en.data");

describe("Guided learning state", () => {
  it("round-trips a valid Keybr result and preserves next-key unlocking", () => {
    const lesson = createEnglishGuidedLesson(model);
    const initial = createGuidedRound(lesson, []);
    expect(initial.availableCharacters).toEqual(["j", "f", "k", "d"]);
    expect(initial.focusCharacter).toBe("f");
    expect(initial.text).not.toContain("?");
    expect([...initial.text].every((character) => character === " " || initial.availableCharacters.includes(character))).toBe(true);
    const initialWords = initial.text.split(" ");
    expect(initialWords.every((word, index) => index % 2 === 0 || word === initialWords[index - 1])).toBe(true);
    const histogram = new Histogram(initial.availableCharacters.map((character) => ({
      codePoint: character.codePointAt(0)!, hitCount: 20, missCount: 0, timeToType: 300,
    })));
    const result = new Result(Layout.EN_US, TextType.GENERATED, 1_800_000_000_000, 120, 20_000, 0, histogram);
    const recorded = recordGuidedResult(createGuidedState(), "attempt-1", result);
    expect(recorded.status).toBe("recorded");
    const restored = restoreGuidedResults(JSON.parse(JSON.stringify(recorded.state)));
    const next = createGuidedRound(lesson, restored);
    expect(next.availableCharacters).toHaveLength(5);
    expect(next.focusCharacter).toBe(next.availableCharacters[4]);
    const milestones = createGuidedMilestones(lesson, restored);
    expect(milestones.slice(0, 4).every(({ resultCount }) => resultCount === 0)).toBe(true);
    expect(milestones[4]).toEqual({ character: next.availableCharacters[4], resultCount: 1 });
    expect(rewindGuidedState(recorded.state, milestones[4].resultCount)).toEqual(recorded.state);
    expect(rewindGuidedState(recorded.state, 0)).toEqual(createGuidedState());
  });

  it("ignores duplicate completion callbacks and rejects invalid Keybr samples", () => {
    const validHistogram = new Histogram([97, 98, 99].map((codePoint) => ({
      codePoint, hitCount: 1, missCount: 0, timeToType: 300,
    })));
    const valid = new Result(Layout.EN_US, TextType.GENERATED, 1, 10, 1_000, 0, validHistogram);
    const once = recordGuidedResult(createGuidedState(), "same", valid);
    expect(recordGuidedResult(once.state, "same", valid)).toMatchObject({ status: "duplicate" });

    const tooShort = new Result(Layout.EN_US, TextType.GENERATED, 2, 9, 1_000, 0, validHistogram);
    expect(recordGuidedResult(once.state, "invalid", tooShort)).toMatchObject({ status: "invalid", state: once.state });
  });

  it("rejects raw typed text and unknown state fields", () => {
    expect(guidedStateSchema.safeParse({ strategyRevision: 2, results: [], rawTypedText: "private" }).success).toBe(false);
  });

  it("resets progress saved by the previous letter-order strategy", () => {
    expect(guidedStateSchema.parse({ results: [] })).toEqual(createGuidedState());
  });
});
