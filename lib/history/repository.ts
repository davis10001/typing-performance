import { z } from "zod";
import type { TestResult } from "@/lib/typing-engine/types";

const STORAGE_KEY = "typing-performance:results:v1";
const MAX_RESULTS = 20;

export const storedResultSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  completedAt: z.string().datetime(),
  durationSeconds: z.number().positive(),
  wpm: z.number().nonnegative().nullable(),
  rawWpm: z.number().nonnegative().nullable(),
  accuracy: z.number().min(0).max(100).nullable(),
  errors: z.number().int().nonnegative(),
  anomalyFlags: z.array(z.enum(["paste", "drop", "blur", "hidden", "composition"])),
});

export type StoredResultSummary = z.infer<typeof storedResultSchema>;

export function loadHistory(storage: Storage): StoredResultSummary[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values)) return [];
    return values.flatMap((value) => {
      const parsed = storedResultSchema.safeParse(value);
      return parsed.success ? [parsed.data] : [];
    }).slice(0, MAX_RESULTS);
  } catch {
    return [];
  }
}

export function saveHistory(storage: Storage, result: TestResult, completedAt: Date): boolean {
  const summary: StoredResultSummary = {
    schemaVersion: 1,
    id: result.sessionId,
    completedAt: completedAt.toISOString(),
    durationSeconds: result.durationSeconds,
    wpm: result.wpm,
    rawWpm: result.rawWpm,
    accuracy: result.accuracy,
    errors: result.errors,
    anomalyFlags: result.anomalyFlags,
  };
  try {
    const next = [summary, ...loadHistory(storage).filter((item) => item.id !== summary.id)].slice(0, MAX_RESULTS);
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export function clearHistory(storage: Storage): boolean {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
