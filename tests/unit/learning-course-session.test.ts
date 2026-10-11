import { describe, expect, it } from "vitest";
import { englishQwertyCourse } from "@/lib/learning/course-content";
import { completeCourseAttempt } from "@/lib/learning/course-session";
import { createCourseState } from "@/lib/learning/course-state";

const first = englishQwertyCourse.lessons[0];
const second = englishQwertyCourse.lessons[1];
const passingAttempt = {
  attemptId: "attempt-1",
  lessonId: first.id,
  correctCharacters: 49,
  errorCount: 1,
  elapsedMilliseconds: 16_333,
  completedAt: 1_800_000_000_000,
};

describe("fixed course session", () => {
  it("records a passing beginner attempt and unlocks exactly one lesson", () => {
    const completion = completeCourseAttempt(
      englishQwertyCourse,
      createCourseState(first.id, "beginner"),
      passingAttempt,
    );
    expect(completion.result.passed).toBe(true);
    expect(completion.nextLessonUnlocked).toBe(true);
    expect(completion.nextLessonId).toBe(second.id);
    expect(completion.state.lastUnlockedLessonId).toBe(second.id);
    expect(completion.state.attempts).toHaveLength(1);
  });

  it("records a failed attempt without unlocking", () => {
    const completion = completeCourseAttempt(
      englishQwertyCourse,
      createCourseState(first.id, "beginner"),
      { ...passingAttempt, errorCount: 2 },
    );
    expect(completion.result.passed).toBe(false);
    expect(completion.nextLessonId).toBeNull();
    expect(completion.state.lastUnlockedLessonId).toBe(first.id);
  });

  it("rejects a beginner attempt for a locked lesson", () => {
    expect(() => completeCourseAttempt(
      englishQwertyCourse,
      createCourseState(first.id, "beginner"),
      { ...passingAttempt, lessonId: second.id },
    )).toThrow(`Locked lesson: ${second.id}`);
  });

  it("allows an advanced learner to start any lesson without manufacturing unlock progress", () => {
    const lesson = englishQwertyCourse.lessons[8];
    const completion = completeCourseAttempt(
      englishQwertyCourse,
      createCourseState(first.id, "advanced"),
      { ...passingAttempt, lessonId: lesson.id },
    );
    expect(completion.nextLessonId).toBe(englishQwertyCourse.lessons[9].id);
    expect(completion.nextLessonUnlocked).toBe(false);
    expect(completion.state.lastUnlockedLessonId).toBe(first.id);
  });
});
