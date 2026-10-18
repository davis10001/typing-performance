import { describe, expect, it } from "vitest";
import {
  aggregateExpectedKeyErrors,
  appendParagraphAttempt,
  appendParagraphRetry,
  attemptsForRun,
  createParagraphState,
  rankParagraphProblemKeys,
  startParagraphRun,
  type ParagraphAttempt,
} from "@/lib/learning/paragraph-state";

function attempt(overrides: Partial<ParagraphAttempt> = {}): ParagraphAttempt {
  return {
    attemptId: "attempt-1",
    runId: "run-1",
    setId: "set-1",
    paragraphId: "paragraph-1",
    correctCharacters: 100,
    errorCount: 2,
    elapsedMilliseconds: 30_000,
    errorsByExpectedKey: { e: 2 },
    completedAt: 1,
    ...overrides,
  };
}

describe("paragraph practice state", () => {
  it("ranks letter mistakes for adaptive practice and combines capitals", () => {
    const state = {
      ...createParagraphState(),
      attempts: [attempt({ errorsByExpectedKey: { E: 2, e: 3, r: 4, ",": 9, " ": 7 } })],
    };
    expect(rankParagraphProblemKeys(state)).toEqual([
      { character: "e", errors: 5 },
      { character: "r", errors: 4 },
    ]);
  });

  it("advances a three-paragraph run and marks it complete", () => {
    let state = startParagraphRun(createParagraphState(), "run-1", "set-1");
    state = appendParagraphAttempt(state, attempt(), 3);
    expect(state.activeRun?.nextIndex).toBe(1);

    state = appendParagraphAttempt(state, attempt({ attemptId: "attempt-2", paragraphId: "paragraph-2" }), 3);
    state = appendParagraphAttempt(state, attempt({ attemptId: "attempt-3", paragraphId: "paragraph-3" }), 3);
    expect(state.activeRun).toBeNull();
    expect(state.lastCompletedRunId).toBe("run-1");
    expect(attemptsForRun(state, "run-1")).toHaveLength(3);
  });

  it("records a retry without advancing the active run", () => {
    let state = startParagraphRun(createParagraphState(), "run-1", "set-1");
    state = appendParagraphAttempt(state, attempt(), 3);
    state = appendParagraphRetry(state, attempt({ attemptId: "retry-1", errorCount: 0, errorsByExpectedKey: {} }));
    expect(state.activeRun?.nextIndex).toBe(1);
    expect(state.attempts).toHaveLength(2);
  });

  it("aggregates expected-key errors for the set summary", () => {
    const totals = aggregateExpectedKeyErrors([
      attempt(),
      attempt({ attemptId: "attempt-2", errorsByExpectedKey: { e: 1, " ": 3 } }),
    ]);
    expect(totals).toEqual({ e: 3, " ": 3 });
  });
});
