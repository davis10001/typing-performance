import { describe, expect, it } from "vitest";
import {
  appendCourseAttempt,
  courseStateSchema,
  createCourseState,
  selectCourseLesson,
  unlockCourseLesson,
} from "@/lib/learning/course-state";

const attempt = {
  attemptId: "attempt-1",
  lessonId: "lesson-1",
  correctCharacters: 100,
  errorCount: 1,
  elapsedMilliseconds: 30_000,
  completedAt: 1_800_000_000_000,
};

describe("course learning state", () => {
  it("starts both progress pointers at the first source lesson", () => {
    expect(createCourseState("lesson-1", "beginner")).toEqual({
      learner: "beginner",
      lastUnlockedLessonId: "lesson-1",
      lastSelectedLessonId: "lesson-1",
      attempts: [],
    });
  });

  it("keeps attempt summaries without storing typed lesson text", () => {
    const state = appendCourseAttempt(createCourseState("lesson-1", "beginner"), attempt);
    expect(courseStateSchema.parse(state).attempts).toEqual([attempt]);
    expect(JSON.stringify(state)).not.toContain("typedText");
  });

  it("deduplicates repeated completion callbacks by attempt id", () => {
    const once = appendCourseAttempt(createCourseState("lesson-1", "beginner"), attempt);
    expect(appendCourseAttempt(once, attempt)).toEqual(once);
  });

  it("updates selection independently from the unlock frontier", () => {
    const selected = selectCourseLesson(createCourseState("lesson-1", "advanced"), "lesson-5");
    expect(selected.lastSelectedLessonId).toBe("lesson-5");
    expect(selected.lastUnlockedLessonId).toBe("lesson-1");
    expect(unlockCourseLesson(selected, "lesson-6")).toMatchObject({
      lastSelectedLessonId: "lesson-5",
      lastUnlockedLessonId: "lesson-6",
    });
  });

  it("rejects malformed or privacy-expanding persisted state", () => {
    expect(courseStateSchema.safeParse({ ...createCourseState("lesson-1", "beginner"), rawTypedText: "secret" }).success)
      .toBe(false);
  });
});
