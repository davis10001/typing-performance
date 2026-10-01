import { describe, expect, it } from "vitest";
import type { StoredResultSummary } from "@/lib/history/repository";
import { summarizeWpmByDuration } from "@/lib/history/stats";

function result(id: string, durationSeconds: number, wpm: number | null): StoredResultSummary {
  return {
    schemaVersion: 1,
    id,
    completedAt: "2026-10-01T00:00:00.000Z",
    durationSeconds,
    wpm,
    rawWpm: wpm,
    accuracy: 100,
    errors: 0,
    anomalyFlags: [],
  };
}

describe("local WPM statistics by duration", () => {
  it("keeps duration groups separate and computes mean and median", () => {
    expect(summarizeWpmByDuration([
      result("a", 60, 20), result("b", 60, 30), result("c", 60, 100),
      result("d", 180, 40), result("e", 180, 60), result("f", 300, 0),
    ])).toEqual([
      { durationSeconds: 60, count: 3, averageWpm: 50, medianWpm: 30 },
      { durationSeconds: 180, count: 2, averageWpm: 50, medianWpm: 50 },
      { durationSeconds: 300, count: 1, averageWpm: 0, medianWpm: 0 },
    ]);
  });

  it("excludes unscored attempts and does not manufacture values for empty groups", () => {
    expect(summarizeWpmByDuration([result("a", 60, null)])).toEqual([
      { durationSeconds: 60, count: 0, averageWpm: null, medianWpm: null },
      { durationSeconds: 180, count: 0, averageWpm: null, medianWpm: null },
      { durationSeconds: 300, count: 0, averageWpm: null, medianWpm: null },
    ]);
  });
});
