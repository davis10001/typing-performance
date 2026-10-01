import type { StoredResultSummary } from "@/lib/history/repository";

export const TEST_DURATIONS = [60, 180, 300] as const;

export type DurationWpmStats = {
  durationSeconds: (typeof TEST_DURATIONS)[number];
  count: number;
  averageWpm: number | null;
  medianWpm: number | null;
};

export function summarizeWpmByDuration(results: StoredResultSummary[]): DurationWpmStats[] {
  return TEST_DURATIONS.map((durationSeconds) => {
    const scores = results
      .filter((item) => item.durationSeconds === durationSeconds && item.wpm !== null && Number.isFinite(item.wpm))
      .map((item) => item.wpm as number)
      .sort((a, b) => a - b);
    const count = scores.length;
    if (count === 0) return { durationSeconds, count, averageWpm: null, medianWpm: null };
    const middle = Math.floor(count / 2);
    return {
      durationSeconds,
      count,
      averageWpm: scores.reduce((total, score) => total + score, 0) / count,
      medianWpm: count % 2 === 1 ? scores[middle] : (scores[middle - 1] + scores[middle]) / 2,
    };
  });
}
