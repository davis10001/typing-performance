import { describe, expect, it } from "vitest";
import {
  evaluateCourseAttempt,
  KTOUCH_DEFAULT_REQUIRED_ACCURACY_PERCENT,
  KTOUCH_DEFAULT_REQUIRED_CPM,
  resolveCourseAccess,
} from "@/lib/learning/course-engine";

describe("KTouch-compatible course attempt evaluation", () => {
  it("uses the locked source defaults", () => {
    expect(KTOUCH_DEFAULT_REQUIRED_CPM).toBe(180);
    expect(KTOUCH_DEFAULT_REQUIRED_ACCURACY_PERCENT).toBe(98);
  });

  it("passes at both exact default boundaries", () => {
    expect(evaluateCourseAttempt({ correctCharacters: 49, errorCount: 1, elapsedMilliseconds: 16_333 }))
      .toMatchObject({ accuracy: 0.98, charactersPerMinute: 180, passed: true });
  });

  it("fails when speed is one CPM below the boundary", () => {
    expect(evaluateCourseAttempt({ correctCharacters: 179, errorCount: 0, elapsedMilliseconds: 60_000 }).passed).toBe(false);
  });

  it("preserves KTouch's one-decimal percentage rounding at the accuracy boundary", () => {
    const roundedTo98Percent = evaluateCourseAttempt({ correctCharacters: 1_959, errorCount: 41, elapsedMilliseconds: 60_000 });
    expect(roundedTo98Percent.accuracy).toBe(0.9795);
    expect(roundedTo98Percent.passed).toBe(true);

    const roundedBelow98Percent = evaluateCourseAttempt({ correctCharacters: 1_958, errorCount: 42, elapsedMilliseconds: 60_000 });
    expect(roundedBelow98Percent.passed).toBe(false);
  });

  it("matches KTouch's empty and error-only accuracy semantics", () => {
    expect(evaluateCourseAttempt({ correctCharacters: 0, errorCount: 0, elapsedMilliseconds: 0 }))
      .toEqual({ accuracy: 1, charactersPerMinute: 0, passed: false });
    expect(evaluateCourseAttempt({ correctCharacters: 0, errorCount: 1, elapsedMilliseconds: 1_000 }))
      .toEqual({ accuracy: 0, charactersPerMinute: 0, passed: false });
  });
});

describe("KTouch-compatible course access", () => {
  it("unlocks exactly the next lesson for a beginner who passes the frontier", () => {
    expect(resolveCourseAccess(15, 0, 0, true, "beginner")).toEqual({
      lastUnlockedLessonIndex: 1,
      nextLessonIndex: 1,
      nextLessonUnlocked: true,
    });
  });

  it("does not unlock for failure or replaying an earlier lesson", () => {
    expect(resolveCourseAccess(15, 1, 1, false, "beginner")).toMatchObject({
      lastUnlockedLessonIndex: 1, nextLessonIndex: null, nextLessonUnlocked: false,
    });
    expect(resolveCourseAccess(15, 0, 3, true, "beginner")).toMatchObject({
      lastUnlockedLessonIndex: 3, nextLessonIndex: 1, nextLessonUnlocked: false,
    });
  });

  it("starts advanced learners with every lesson available without claiming an unlock", () => {
    expect(resolveCourseAccess(15, 8, 0, false, "advanced")).toEqual({
      lastUnlockedLessonIndex: 14,
      nextLessonIndex: 9,
      nextLessonUnlocked: false,
    });
  });

  it("does not offer a next lesson at the end of a course", () => {
    expect(resolveCourseAccess(15, 14, 14, true, "beginner")).toEqual({
      lastUnlockedLessonIndex: 14,
      nextLessonIndex: null,
      nextLessonUnlocked: false,
    });
  });
});
