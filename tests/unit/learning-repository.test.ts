import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import {
  clearLearningMode, LEARNING_STORAGE_PREFIX, loadLearning, saveLearning, type LearningScope,
} from "@/lib/learning/repository";

// Synthetic engine state: these fields are not an invented teaching algorithm.
const stateSchema = z.strictObject({ completedAttemptIds: z.array(z.string()) });
const scope: LearningScope = { mode: "guided", engineRevision: "source-a", contentRevision: "content-a", layout: "us" };
const key = `${LEARNING_STORAGE_PREFIX}:guided`;
const values = new Map<string, string>();
const localStorage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); },
  removeItem: (key: string) => { values.delete(key); },
  clear: () => values.clear(),
};

beforeEach(() => localStorage.clear());

describe("learning progress storage", () => {
  it("round-trips engine state and keeps course/test state isolated", () => {
    localStorage.setItem("typing-performance:results:v1", "test-history");
    expect(saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: ["a"] }, null).status).toBe("saved");
    expect(saveLearning(localStorage, { ...scope, mode: "course" }, stateSchema, { completedAttemptIds: ["b"] }, null).status).toBe("saved");
    const read = loadLearning(localStorage, scope, stateSchema);
    expect(read.status).toBe("ready");
    if (read.status !== "ready") throw new Error("Expected saved progress");
    expect(read.state.completedAttemptIds).toEqual(["a"]);
    expect(clearLearningMode(localStorage, "guided", read.token).status).toBe("cleared");
    expect(loadLearning(localStorage, { ...scope, mode: "course" }, stateSchema).status).toBe("ready");
    expect(localStorage.getItem("typing-performance:results:v1")).toBe("test-history");
  });

  it("does not overwrite newer progress from a stale reader", () => {
    const first = saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: ["a"] }, null);
    if (first.status !== "saved") throw new Error("Expected saved progress");
    const second = saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: ["a", "b"] }, first.token);
    expect(second.status).toBe("saved");
    expect(saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: ["stale"] }, first.token).status).toBe("conflict");
    expect(clearLearningMode(localStorage, "guided", first.token).status).toBe("conflict");
  });

  it.each(["engineRevision", "contentRevision", "layout"] as const)("preserves progress when %s changes", (field) => {
    const saved = saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: ["a"] }, null);
    if (saved.status !== "saved") throw new Error("Expected saved progress");
    const changed = { ...scope, [field]: "different" };
    expect(loadLearning(localStorage, changed, stateSchema).status).toBe("incompatible");
    expect(saveLearning(localStorage, changed, stateSchema, { completedAttemptIds: [] }, saved.token).status).toBe("incompatible");
    expect(localStorage.getItem(key)).toBe(saved.token);
  });

  it.each(["broken-json", JSON.stringify({ schemaVersion: 2, state: {} })])("preserves unreadable data: %s", (raw) => {
    localStorage.setItem(key, raw);
    expect(["invalid", "incompatible"]).toContain(loadLearning(localStorage, scope, stateSchema).status);
    expect(["invalid", "incompatible"]).toContain(saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: [] }, raw).status);
    expect(localStorage.getItem(key)).toBe(raw);
    expect(clearLearningMode(localStorage, "guided", raw).status).toBe("cleared");
  });

  it("refuses states rejected by the engine schema", () => {
    expect(saveLearning(localStorage, scope, stateSchema, { completedAttemptIds: ["a"], rawTypedText: "private" } as { completedAttemptIds: string[] }, null).status).toBe("invalid");
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("reports storage failure without claiming that progress was saved or cleared", () => {
    const storage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("quota"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(loadLearning(storage, scope, stateSchema).status).toBe("unavailable");
    expect(saveLearning(storage, scope, stateSchema, { completedAttemptIds: [] }, null).status).toBe("unavailable");
    expect(clearLearningMode(storage, "guided", null).status).toBe("unavailable");
  });

  it("reports quota failure after a successful read", () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => undefined };
    expect(saveLearning(storage, scope, stateSchema, { completedAttemptIds: [] }, null).status).toBe("unavailable");
  });

  it("rejects non-JSON state instead of silently converting dates", () => {
    const dateState = z.strictObject({ date: z.date() });
    expect(saveLearning(localStorage, scope, dateState, { date: new Date() }, null).status).toBe("invalid");
    expect(localStorage.getItem(key)).toBeNull();
  });
});
