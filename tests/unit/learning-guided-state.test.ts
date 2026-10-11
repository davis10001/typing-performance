import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import { createEnglishGuidedLesson, createGuidedRound } from "@/lib/learning/guided-engine";
import {
  createGuidedState,
  guidedStateSchema,
  recordGuidedResult,
  restoreGuidedResults,
} from "@/lib/learning/guided-state";

const model = readFileSync("vendor/keybr/packages/keybr-phonetic-model/assets/model-en.data");

describe("Guided learning state", () => {
  it("round-trips a valid Keybr result and preserves next-key unlocking", () => {
    const lesson = createEnglishGuidedLesson(model);
    const initial = createGuidedRound(lesson, []);
    const histogram = new Histogram(initial.availableCharacters.map((character) => ({
      codePoint: character.codePointAt(0)!, hitCount: 20, missCount: 0, timeToType: 300,
    })));
    const result = new Result(Layout.EN_US, TextType.GENERATED, 1_800_000_000_000, 120, 20_000, 0, histogram);
    const recorded = recordGuidedResult(createGuidedState(), "attempt-1", result);
    expect(recorded.status).toBe("recorded");
    const restored = restoreGuidedResults(JSON.parse(JSON.stringify(recorded.state)));
    const next = createGuidedRound(lesson, restored);
    expect(next.availableCharacters).toHaveLength(7);
    expect(next.focusCharacter).toBe(next.availableCharacters[6]);
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
    expect(guidedStateSchema.safeParse({ results: [], rawTypedText: "private" }).success).toBe(false);
  });
});
