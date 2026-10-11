import type { z } from "zod";
import { loadLearning, saveLearning, type LearningRead, type LearningScope } from "./repository";

type LearningStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T> | T): Promise<T>;
};

export type LearningUpdate<T> =
  | { status: "saved"; state: T; token: string }
  | { status: "conflict" | "invalid" | "incompatible" | "unavailable" };

export async function updateLearning<T>(options: {
  storage: LearningStorage;
  scope: LearningScope;
  stateSchema: z.ZodType<T>;
  initialState: () => T;
  update: (state: T) => T;
  locks?: LockManagerLike;
}): Promise<LearningUpdate<T>> {
  const run = (): LearningUpdate<T> => {
    const current: LearningRead<T> = loadLearning(options.storage, options.scope, options.stateSchema);
    if (current.status === "invalid" || current.status === "incompatible" || current.status === "unavailable") {
      return { status: current.status };
    }
    const state = options.update(current.status === "ready" ? current.state : options.initialState());
    const saved = saveLearning(
      options.storage,
      options.scope,
      options.stateSchema,
      state,
      current.status === "ready" ? current.token : null,
    );
    return saved.status === "saved"
      ? { status: "saved", state, token: saved.token }
      : { status: saved.status };
  };

  return options.locks == null
    ? run()
    : options.locks.request(`typing-performance:learning:${options.scope.mode}`, run);
}
