import type { LearningCourse } from "./course-content";
import { evaluateCourseAttempt, resolveCourseAccess, type CourseAttemptResult } from "./course-engine";
import {
  appendCourseAttempt,
  type CourseAttempt,
  type CourseState,
  unlockCourseLesson,
} from "./course-state";

export type CompleteCourseAttempt = Omit<CourseAttempt, "lessonId"> & { lessonId: string };

export type CourseCompletion = {
  state: CourseState;
  result: CourseAttemptResult;
  nextLessonId: string | null;
  nextLessonUnlocked: boolean;
};

export function completeCourseAttempt(
  course: LearningCourse,
  state: CourseState,
  attempt: CompleteCourseAttempt,
): CourseCompletion {
  const lessonIndex = course.lessons.findIndex(({ id }) => id === attempt.lessonId);
  if (lessonIndex < 0) throw new RangeError(`Unknown lesson: ${attempt.lessonId}`);
  const lastUnlockedLessonIndex = course.lessons.findIndex(({ id }) => id === state.lastUnlockedLessonId);
  if (lastUnlockedLessonIndex < 0) throw new RangeError(`Unknown unlock frontier: ${state.lastUnlockedLessonId}`);
  if (state.learner === "beginner" && lessonIndex > lastUnlockedLessonIndex) {
    throw new RangeError(`Locked lesson: ${attempt.lessonId}`);
  }

  const result = evaluateCourseAttempt(attempt);
  const access = resolveCourseAccess(
    course.lessons.length,
    lessonIndex,
    lastUnlockedLessonIndex,
    result.passed,
    state.learner,
  );
  let nextState = appendCourseAttempt(state, attempt);
  if (access.nextLessonUnlocked) {
    nextState = unlockCourseLesson(nextState, course.lessons[access.lastUnlockedLessonIndex].id);
  }
  return {
    state: nextState,
    result,
    nextLessonId: access.nextLessonIndex == null ? null : course.lessons[access.nextLessonIndex].id,
    nextLessonUnlocked: access.nextLessonUnlocked,
  };
}
