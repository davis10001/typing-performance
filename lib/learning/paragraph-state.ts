import { z } from "zod";

const errorMapSchema = z.record(z.string(), z.number().int().nonnegative());

const paragraphAttemptSchema = z.strictObject({
  attemptId: z.string().min(1),
  runId: z.string().min(1),
  setId: z.string().min(1),
  paragraphId: z.string().min(1),
  correctCharacters: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  elapsedMilliseconds: z.number().int().nonnegative(),
  errorsByExpectedKey: errorMapSchema,
  completedAt: z.number().int().nonnegative(),
});

const activeRunSchema = z.strictObject({
  runId: z.string().min(1),
  setId: z.string().min(1),
  nextIndex: z.number().int().nonnegative(),
  attemptIds: z.array(z.string().min(1)),
});

export const paragraphStateSchema = z.strictObject({
  activeRun: activeRunSchema.nullable(),
  lastCompletedRunId: z.string().min(1).nullable(),
  attempts: z.array(paragraphAttemptSchema).max(120),
});

export type ParagraphState = z.infer<typeof paragraphStateSchema>;
export type ParagraphAttempt = z.infer<typeof paragraphAttemptSchema>;
export type ParagraphRun = z.infer<typeof activeRunSchema>;

export function createParagraphState(): ParagraphState {
  return { activeRun: null, lastCompletedRunId: null, attempts: [] };
}

export function startParagraphRun(state: ParagraphState, runId: string, setId: string): ParagraphState {
  const parsed = paragraphStateSchema.parse(state);
  if (!runId || !setId) throw new TypeError("runId and setId are required");
  return { ...parsed, activeRun: { runId, setId, nextIndex: 0, attemptIds: [] } };
}

export function appendParagraphAttempt(
  state: ParagraphState,
  attempt: ParagraphAttempt,
  paragraphCount: number,
): ParagraphState {
  const parsed = paragraphStateSchema.parse(state);
  const nextAttempt = paragraphAttemptSchema.parse(attempt);
  if (!Number.isSafeInteger(paragraphCount) || paragraphCount < 1) throw new RangeError("paragraphCount must be positive");
  if (parsed.attempts.some(({ attemptId }) => attemptId === nextAttempt.attemptId)) return parsed;

  const current = parsed.activeRun;
  if (!current || current.runId !== nextAttempt.runId || current.setId !== nextAttempt.setId) {
    throw new RangeError("Attempt does not belong to the active paragraph run");
  }

  const nextIndex = current.nextIndex + 1;
  const attemptIds = [...current.attemptIds, nextAttempt.attemptId];
  const completed = nextIndex >= paragraphCount;
  return {
    activeRun: completed ? null : { ...current, nextIndex, attemptIds },
    lastCompletedRunId: completed ? current.runId : parsed.lastCompletedRunId,
    attempts: [...parsed.attempts, nextAttempt].slice(-120),
  };
}

export function appendParagraphRetry(state: ParagraphState, attempt: ParagraphAttempt): ParagraphState {
  const parsed = paragraphStateSchema.parse(state);
  const nextAttempt = paragraphAttemptSchema.parse(attempt);
  if (parsed.attempts.some(({ attemptId }) => attemptId === nextAttempt.attemptId)) return parsed;
  const knownRun = parsed.activeRun?.runId === nextAttempt.runId || parsed.lastCompletedRunId === nextAttempt.runId;
  if (!knownRun) throw new RangeError("Retry does not belong to a known paragraph run");
  return { ...parsed, attempts: [...parsed.attempts, nextAttempt].slice(-120) };
}

export function attemptsForRun(state: ParagraphState, runId: string): ParagraphAttempt[] {
  return paragraphStateSchema.parse(state).attempts.filter((attempt) => attempt.runId === runId);
}

export function completedParagraphIds(state: ParagraphState): Set<string> {
  return new Set(paragraphStateSchema.parse(state).attempts.map(({ paragraphId }) => paragraphId));
}

export function aggregateExpectedKeyErrors(attempts: readonly ParagraphAttempt[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const attempt of attempts) {
    for (const [key, count] of Object.entries(attempt.errorsByExpectedKey)) {
      totals[key] = (totals[key] ?? 0) + count;
    }
  }
  return totals;
}

export type ParagraphProblemKey = {
  character: string;
  errors: number;
};

/** Rank letter mistakes for adaptive practice. Capitals share the same physical key. */
export function rankParagraphProblemKeys(state: ParagraphState, limit = 4): ParagraphProblemKey[] {
  if (!Number.isSafeInteger(limit) || limit < 0) throw new RangeError("limit must be a nonnegative integer");
  const totals = aggregateExpectedKeyErrors(paragraphStateSchema.parse(state).attempts);
  const letters = new Map<string, number>();
  for (const [key, count] of Object.entries(totals)) {
    const character = key.toLowerCase();
    if (!/^[a-z]$/.test(character)) continue;
    letters.set(character, (letters.get(character) ?? 0) + count);
  }
  return [...letters]
    .map(([character, errors]) => ({ character, errors }))
    .sort((a, b) => b.errors - a.errors || a.character.localeCompare(b.character))
    .slice(0, limit);
}
