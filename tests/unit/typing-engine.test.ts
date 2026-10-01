import { describe, expect, it } from "vitest";
import {
  abandonSession, applyBackspace, applyCharacter, beginCountdown, beginRunning,
  completeSession, createSession, recordAnomaly,
} from "@/lib/typing-engine/machine";
import { calculateResult } from "@/lib/scoring/calculate";

describe("typing engine", () => {
  it("follows one-way test states and freezes a completed result", () => {
    const ready = createSession("test-1", 60, "abc");
    const running = beginRunning(beginCountdown(ready), 1000);
    const completed = completeSession(applyCharacter(running, "a", 2000), 61_000);
    expect(completed.phase).toBe("completed");
    expect(applyCharacter(completed, "b", 61_001)).toBe(completed);
    expect(beginCountdown(completed)).toBe(completed);
    expect(abandonSession(completed)).toBe(completed);
  });

  it("calculates corrected characters without counting backspace as input", () => {
    const initial = beginRunning(beginCountdown(createSession("test-2", 60, "abc")), 0);
    const withMistake = applyCharacter(applyCharacter(initial, "a", 100), "x", 200);
    const corrected = applyCharacter(applyBackspace(withMistake, 300), "b", 400);
    const result = calculateResult(completeSession(corrected, 60_000));
    expect(result).toMatchObject({
      wpm: 0.4,
      rawWpm: 0.6,
      accuracy: 66.7,
      errors: 1,
      correctChars: 2,
      typedChars: 3,
    });
  });

  it("does not divide by zero or invent a score for no input", () => {
    const running = beginRunning(beginCountdown(createSession("test-3", 60, "abc")), 0);
    const result = calculateResult(completeSession(running, 0));
    expect(result).toMatchObject({ wpm: null, rawWpm: null, accuracy: null });
  });

  it("ignores input after the deadline and records anomalies once", () => {
    const running = beginRunning(beginCountdown(createSession("test-4", 60, "abc")), 0);
    const marked = recordAnomaly(recordAnomaly(running, "paste"), "paste");
    expect(marked.anomalyFlags).toEqual(["paste"]);
    expect(applyCharacter(marked, "a", 60_001)).toMatchObject({ phase: "completed", typed: "" });
  });

  it("ignores backspace on an empty buffer or with an invalid timestamp", () => {
    const running = beginRunning(beginCountdown(createSession("test-5", 60, "abc")), 0);
    expect(applyBackspace(running, 100)).toBe(running);
    const typed = applyCharacter(running, "a", 100);
    expect(applyBackspace(typed, Number.NaN)).toBe(typed);
    expect(applyBackspace(typed, 60_001)).toMatchObject({ phase: "completed", typed: "a" });
  });
});
