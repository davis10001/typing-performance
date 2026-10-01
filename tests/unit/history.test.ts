import { describe, expect, it } from "vitest";
import { clearHistory, loadHistory, saveHistory } from "@/lib/history/repository";
import type { TestResult } from "@/lib/typing-engine/types";

const result: TestResult = {
  sessionId: "attempt-1",
  durationSeconds: 60,
  elapsedSeconds: 60,
  wpm: 50,
  rawWpm: 55,
  accuracy: 96,
  errors: 4,
  correctChars: 250,
  typedChars: 275,
  totalKeystrokes: 275,
  anomalyFlags: [],
};

describe("local history", () => {
  function memoryStorage(): Storage {
    const values = new Map<string, string>();
    return {
      get length() { return values.size; },
      clear() { values.clear(); },
      getItem(key: string) { return values.get(key) ?? null; },
      key(index: number) { return [...values.keys()][index] ?? null; },
      removeItem(key: string) { values.delete(key); },
      setItem(key: string, value: string) { values.set(key, value); },
    };
  }

  it("persists only a summary and can clear it", () => {
    const storage = memoryStorage();
    expect(saveHistory(storage, result, new Date("2026-10-01T00:00:00Z"))).toBe(true);
    expect(loadHistory(storage)).toHaveLength(1);
    expect(storage.getItem("typing-performance:results:v1")).not.toContain("correctChars");
    expect(clearHistory(storage)).toBe(true);
    expect(loadHistory(storage)).toEqual([]);
  });

  it("ignores malformed entries and tolerates storage errors", () => {
    const storage = memoryStorage();
    storage.setItem("typing-performance:results:v1", JSON.stringify([{}, { nope: true }]));
    expect(loadHistory(storage)).toEqual([]);
    const denied = {
      getItem: () => { throw new Error("denied"); },
      setItem: () => { throw new Error("denied"); },
      removeItem: () => { throw new Error("denied"); },
    } as unknown as Storage;
    expect(loadHistory(denied)).toEqual([]);
    expect(saveHistory(denied, result, new Date())).toBe(false);
    expect(clearHistory(denied)).toBe(false);
  });
});
