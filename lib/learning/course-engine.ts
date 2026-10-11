export const KTOUCH_DEFAULT_REQUIRED_CPM = 180;
export const KTOUCH_DEFAULT_REQUIRED_ACCURACY_PERCENT = 98;

export type CourseAttemptStats = {
  correctCharacters: number;
  errorCount: number;
  elapsedMilliseconds: number;
};

export type CourseAttemptResult = {
  accuracy: number;
  charactersPerMinute: number;
  passed: boolean;
};

export type CourseAccess = {
  lastUnlockedLessonIndex: number;
  nextLessonIndex: number | null;
  nextLessonUnlocked: boolean;
};

function nonNegativeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative safe integer`);
  return value;
}

/**
 * Mirrors KTouch TrainingStats and ScoreScreen at the locked source revision.
 * Accuracy is rounded to one decimal percentage point only for the pass boundary.
 */
export function evaluateCourseAttempt(
  stats: CourseAttemptStats,
  requiredAccuracyPercent = KTOUCH_DEFAULT_REQUIRED_ACCURACY_PERCENT,
  requiredCharactersPerMinute = KTOUCH_DEFAULT_REQUIRED_CPM,
): CourseAttemptResult {
  const correctCharacters = nonNegativeInteger(stats.correctCharacters, "correctCharacters");
  const errorCount = nonNegativeInteger(stats.errorCount, "errorCount");
  const elapsedMilliseconds = nonNegativeInteger(stats.elapsedMilliseconds, "elapsedMilliseconds");
  const accuracy = correctCharacters === 0
    ? (errorCount === 0 ? 1 : 0)
    : 1 - errorCount / (errorCount + correctCharacters);
  const charactersPerMinute = elapsedMilliseconds === 0
    ? 0
    : Math.floor(correctCharacters * 60_000 / elapsedMilliseconds);
  const passed = Math.round(1000 * accuracy) >= Math.round(10 * requiredAccuracyPercent)
    && charactersPerMinute >= requiredCharactersPerMinute;
  return { accuracy, charactersPerMinute, passed };
}

/** Mirrors KTouch's beginner sequential unlock and advanced all-unlocked behavior. */
export function resolveCourseAccess(
  lessonCount: number,
  lessonIndex: number,
  savedLastUnlockedLessonIndex: number,
  passed: boolean,
  learner: "beginner" | "advanced",
): CourseAccess {
  nonNegativeInteger(lessonCount, "lessonCount");
  nonNegativeInteger(lessonIndex, "lessonIndex");
  nonNegativeInteger(savedLastUnlockedLessonIndex, "savedLastUnlockedLessonIndex");
  if (lessonCount === 0 || lessonIndex >= lessonCount) throw new RangeError("lessonIndex must identify a lesson");

  if (learner === "advanced") {
    return {
      lastUnlockedLessonIndex: lessonCount - 1,
      nextLessonIndex: lessonIndex + 1 < lessonCount ? lessonIndex + 1 : null,
      nextLessonUnlocked: false,
    };
  }

  const currentLastUnlocked = Math.min(savedLastUnlockedLessonIndex, lessonCount - 1);
  const nextLessonUnlocked = passed
    && lessonIndex === currentLastUnlocked
    && lessonIndex + 1 < lessonCount;
  const lastUnlockedLessonIndex = nextLessonUnlocked ? currentLastUnlocked + 1 : currentLastUnlocked;
  return {
    lastUnlockedLessonIndex,
    nextLessonIndex: lessonIndex + 1 <= lastUnlockedLessonIndex ? lessonIndex + 1 : null,
    nextLessonUnlocked,
  };
}
