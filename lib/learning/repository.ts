import { z } from "zod";

export const LEARNING_STORAGE_PREFIX = "typing-performance:learning:v1";
export type LearningMode = "guided" | "course";
export type LearningScope = {
  mode: LearningMode;
  engineRevision: string;
  contentRevision: string;
  layout: string;
};
type LearningStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const envelopeSchema = z.strictObject({
  schemaVersion: z.literal(1),
  mode: z.enum(["guided", "course"]),
  engineRevision: z.string().min(1),
  contentRevision: z.string().min(1),
  layout: z.string().min(1),
  sequence: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  state: z.unknown(),
});

export type LearningRead<T> =
  | { status: "empty"; token: null }
  | { status: "ready"; token: string; sequence: number; state: T }
  | { status: "invalid" | "incompatible"; token: string }
  | { status: "unavailable" };

function storageKey(mode: LearningMode): string {
  return `${LEARNING_STORAGE_PREFIX}:${mode}`;
}

function decode<T>(raw: string | null, scope: LearningScope, stateSchema: z.ZodType<T>): LearningRead<T> {
  if (raw === null) return { status: "empty", token: null };
  try {
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === "object" && "schemaVersion" in value && value.schemaVersion !== 1) {
      return { status: "incompatible", token: raw };
    }
    const parsed = envelopeSchema.safeParse(value);
    if (!parsed.success) return { status: "invalid", token: raw };
    const data = parsed.data;
    if (data.mode !== scope.mode || data.engineRevision !== scope.engineRevision ||
      data.contentRevision !== scope.contentRevision || data.layout !== scope.layout) {
      return { status: "incompatible", token: raw };
    }
    const state = stateSchema.safeParse(data.state);
    return state.success
      ? { status: "ready", token: raw, sequence: data.sequence, state: state.data }
      : { status: "invalid", token: raw };
  } catch {
    return { status: "invalid", token: raw };
  }
}

export function loadLearning<T>(storage: LearningStorage, scope: LearningScope, stateSchema: z.ZodType<T>): LearningRead<T> {
  try {
    return decode(storage.getItem(storageKey(scope.mode)), scope, stateSchema);
  } catch {
    return { status: "unavailable" };
  }
}

/** Detects stale writes, not an atomic transaction. UI adapters must serialize with Web Locks where available. */
export function saveLearning<T>(
  storage: LearningStorage,
  scope: LearningScope,
  stateSchema: z.ZodType<T>,
  state: T,
  expectedToken: string | null,
): { status: "saved"; token: string } | { status: "conflict" | "invalid" | "incompatible" | "unavailable" } {
  try {
    const currentRaw = storage.getItem(storageKey(scope.mode));
    if (currentRaw !== expectedToken) return { status: "conflict" };
    const current = decode(currentRaw, scope, stateSchema);
    if (current.status !== "empty" && current.status !== "ready") return { status: current.status };
    const parsed = stateSchema.safeParse(state);
    if (!parsed.success) return { status: "invalid" };
    if (!z.json().safeParse(parsed.data).success) return { status: "invalid" };
    const envelope = {
      schemaVersion: 1,
      ...scope,
      sequence: current.status === "ready" ? current.sequence + 1 : 0,
      state: parsed.data,
    };
    let raw: string;
    try {
      raw = JSON.stringify(envelope);
    } catch {
      return { status: "invalid" };
    }
    // Verify that the serialized envelope still satisfies the engine's state contract.
    if (decode(raw, scope, stateSchema).status !== "ready") return { status: "invalid" };
    storage.setItem(storageKey(scope.mode), raw);
    return { status: "saved", token: raw };
  } catch {
    return { status: "unavailable" };
  }
}

/** Called only after the UI's explicit reset action; never touches test history. */
export function clearLearningMode(
  storage: LearningStorage, mode: LearningMode, expectedToken: string | null,
): { status: "cleared" | "conflict" | "unavailable" } {
  try {
    if (storage.getItem(storageKey(mode)) !== expectedToken) return { status: "conflict" };
    storage.removeItem(storageKey(mode));
    return { status: "cleared" };
  } catch {
    return { status: "unavailable" };
  }
}
