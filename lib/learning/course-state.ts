import { z } from "zod";

const attemptSchema = z.strictObject({
  attemptId: z.string().min(1),
  lessonId: z.string().min(1),
  correctCharacters: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  elapsedMilliseconds: z.number().int().nonnegative(),
  completedAt: z.number().int().nonnegative(),
});

export const courseStateSchema = z.strictObject({
  learner: z.enum(["beginner", "advanced"]),
  lastUnlockedLessonId: z.string().min(1),
  lastSelectedLessonId: z.string().min(1),
  attempts: z.array(attemptSchema),
});

export type CourseState = z.infer<typeof courseStateSchema>;
export type CourseAttempt = z.infer<typeof attemptSchema>;

export function createCourseState(firstLessonId: string, learner: CourseState["learner"]): CourseState {
  if (!firstLessonId) throw new TypeError("firstLessonId is required");
  return { learner, lastUnlockedLessonId: firstLessonId, lastSelectedLessonId: firstLessonId, attempts: [] };
}

/** Duplicate completion callbacks are ignored by attempt identity. */
export function appendCourseAttempt(state: CourseState, attempt: CourseAttempt): CourseState {
  const parsedState = courseStateSchema.parse(state);
  const parsedAttempt = attemptSchema.parse(attempt);
  if (parsedState.attempts.some(({ attemptId }) => attemptId === parsedAttempt.attemptId)) return parsedState;
  return { ...parsedState, attempts: [...parsedState.attempts, parsedAttempt] };
}

export function selectCourseLesson(state: CourseState, lessonId: string): CourseState {
  if (!lessonId) throw new TypeError("lessonId is required");
  return { ...courseStateSchema.parse(state), lastSelectedLessonId: lessonId };
}

export function unlockCourseLesson(state: CourseState, lessonId: string): CourseState {
  if (!lessonId) throw new TypeError("lessonId is required");
  return { ...courseStateSchema.parse(state), lastUnlockedLessonId: lessonId };
}
