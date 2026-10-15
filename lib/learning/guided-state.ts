import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import { z } from "zod";

const sampleSchema = z.strictObject({
  codePoint: z.number().int().min(0).max(0x10ffff),
  hitCount: z.number().int().nonnegative(),
  missCount: z.number().int().nonnegative(),
  timeToType: z.union([z.literal(0), z.number().min(40).max(12_000)]),
});

const resultSchema = z.strictObject({
  attemptId: z.string().min(1),
  layoutId: z.string().min(1),
  textTypeId: z.string().min(1),
  timeStamp: z.number().int().nonnegative(),
  length: z.number().int().nonnegative(),
  time: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  histogram: z.array(sampleSchema),
});

const guidedResultsSchema = z.array(resultSchema);
const guidedStateV2Schema = z.strictObject({
  strategyRevision: z.literal(2),
  minimumKeyCount: z.number().int().min(4).max(26).default(4),
  results: guidedResultsSchema,
});
const legacyGuidedStateSchema = z.strictObject({ results: guidedResultsSchema })
  .transform(() => ({ strategyRevision: 2 as const, minimumKeyCount: 4, results: [] }));

export const guidedStateSchema = z.union([guidedStateV2Schema, legacyGuidedStateSchema]);
export type GuidedState = z.infer<typeof guidedStateSchema>;

export function createGuidedState(): GuidedState {
  return { strategyRevision: 2, minimumKeyCount: 4, results: [] };
}

export function advanceGuidedState(state: GuidedState, currentKeyCount: number): GuidedState {
  const parsed = guidedStateSchema.parse(state);
  const minimumKeyCount = Math.min(26, Math.max(parsed.minimumKeyCount, Math.trunc(currentKeyCount) + 1));
  return { ...parsed, minimumKeyCount };
}

export function rewindGuidedState(state: GuidedState, resultCount: number, minimumKeyCount = 4): GuidedState {
  const parsed = guidedStateSchema.parse(state);
  const end = Math.max(0, Math.min(Math.trunc(resultCount), parsed.results.length));
  return {
    ...parsed,
    minimumKeyCount: Math.max(4, Math.min(26, Math.trunc(minimumKeyCount))),
    results: parsed.results.slice(0, end),
  };
}

export function recordGuidedResult(
  state: GuidedState,
  attemptId: string,
  result: Result,
): { status: "recorded" | "duplicate" | "invalid"; state: GuidedState } {
  const parsed = guidedStateSchema.parse(state);
  if (!attemptId) return { status: "invalid", state: parsed };
  if (parsed.results.some((item) => item.attemptId === attemptId)) return { status: "duplicate", state: parsed };
  if (!result.validate()) return { status: "invalid", state: parsed };
  const stored = resultSchema.safeParse({
    attemptId,
    layoutId: result.layout.id,
    textTypeId: result.textType.id,
    timeStamp: result.timeStamp,
    length: result.length,
    time: result.time,
    errors: result.errors,
    histogram: [...result.histogram],
  });
  if (!stored.success) return { status: "invalid", state: parsed };
  return { status: "recorded", state: { ...parsed, results: [...parsed.results, stored.data] } };
}

export function restoreGuidedResults(state: GuidedState): Result[] {
  return guidedStateSchema.parse(state).results.map((stored) => new Result(
    Layout.ALL.get(stored.layoutId),
    TextType.ALL.get(stored.textTypeId),
    stored.timeStamp,
    stored.length,
    stored.time,
    stored.errors,
    new Histogram(stored.histogram),
  ));
}
