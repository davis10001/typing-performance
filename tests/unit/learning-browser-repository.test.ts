import { describe, expect, it } from "vitest";
import { z } from "zod";
import { updateLearning } from "@/lib/learning/browser-repository";
import { LEARNING_STORAGE_PREFIX, type LearningScope } from "@/lib/learning/repository";

const schema = z.strictObject({ count: z.number().int().nonnegative() });
const scope: LearningScope = { mode: "guided", engineRevision: "engine", contentRevision: "content", layout: "us" };

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe("browser learning repository", () => {
  it("serializes read-modify-write with the mode-specific Web Lock", async () => {
    const storage = memoryStorage();
    const requested: string[] = [];
    const locks = { request: async <T>(name: string, callback: () => Promise<T> | T) => {
      requested.push(name);
      return callback();
    } };
    const result = await updateLearning({
      storage, scope, stateSchema: schema, initialState: () => ({ count: 0 }),
      update: ({ count }) => ({ count: count + 1 }), locks,
    });
    expect(result).toMatchObject({ status: "saved", state: { count: 1 } });
    expect(requested).toEqual(["typing-performance:learning:guided"]);
  });

  it("uses optimistic conflict detection when Web Locks are unavailable", async () => {
    const storage = memoryStorage();
    const key = `${LEARNING_STORAGE_PREFIX}:guided`;
    let reads = 0;
    const racingStorage = {
      getItem: (requestedKey: string) => {
        reads++;
        if (reads === 2) storage.setItem(key, "newer-tab-value");
        return storage.getItem(requestedKey);
      },
      setItem: storage.setItem,
      removeItem: storage.removeItem,
    };
    const result = await updateLearning({
      storage: racingStorage, scope, stateSchema: schema, initialState: () => ({ count: 0 }),
      update: ({ count }) => ({ count: count + 1 }),
    });
    expect(result.status).toBe("conflict");
    expect(storage.values.get(key)).toBe("newer-tab-value");
  });

  it("preserves incompatible data instead of resetting it", async () => {
    const storage = memoryStorage();
    const key = `${LEARNING_STORAGE_PREFIX}:guided`;
    storage.values.set(key, JSON.stringify({ schemaVersion: 2, state: {} }));
    const result = await updateLearning({
      storage, scope, stateSchema: schema, initialState: () => ({ count: 0 }), update: (state) => state,
    });
    expect(result.status).toBe("incompatible");
    expect(storage.values.get(key)).toContain('"schemaVersion":2');
  });
});
