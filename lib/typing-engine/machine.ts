import type { AnomalyFlag, TestSession } from "./types";
import { alignTypingInput } from "./alignment";

export function createSession(id: string, durationSeconds: number, prompt: string): TestSession {
  if (!id || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || !prompt) {
    throw new Error("A test needs an ID, positive duration, and prompt.");
  }
  return {
    id,
    phase: "ready",
    durationSeconds,
    prompt,
    typed: "",
    startedAt: null,
    endedAt: null,
    totalInputChars: 0,
    correctKeystrokes: 0,
    errors: 0,
    backspaces: 0,
    anomalyFlags: [],
  };
}

export function beginCountdown(session: TestSession): TestSession {
  return session.phase === "ready" ? { ...session, phase: "countdown" } : session;
}

export function beginRunning(session: TestSession, now: number): TestSession {
  if ((session.phase !== "ready" && session.phase !== "countdown") || !Number.isFinite(now)) return session;
  return { ...session, phase: "running", startedAt: now };
}

export function deadline(session: TestSession): number | null {
  return session.startedAt === null ? null : session.startedAt + session.durationSeconds * 1000;
}

export function completeSession(session: TestSession, now: number): TestSession {
  if (session.phase !== "running" || session.startedAt === null || !Number.isFinite(now)) return session;
  const end = Math.max(session.startedAt, Math.min(now, deadline(session)!));
  return { ...session, phase: "completed", endedAt: end };
}

export function abandonSession(session: TestSession): TestSession {
  return session.phase === "completed" || session.phase === "abandoned"
    ? session
    : { ...session, phase: "abandoned" };
}

export function recordAnomaly(session: TestSession, anomaly: AnomalyFlag): TestSession {
  if (session.phase !== "running") return session;
  if (session.anomalyFlags.includes(anomaly)) return session;
  return { ...session, anomalyFlags: [...session.anomalyFlags, anomaly] };
}

export function applyCharacter(session: TestSession, character: string, now: number): TestSession {
  if (session.phase !== "running" || session.startedAt === null) return session;
  if (!Number.isFinite(now)) return session;
  if (now >= deadline(session)!) return completeSession(session, now);
  const { cursorIndex } = alignTypingInput(session.prompt, session.typed);
  if (character.length !== 1 || cursorIndex >= session.prompt.length) return session;

  const isCorrect = character === session.prompt[cursorIndex];
  return {
    ...session,
    typed: session.typed + character,
    totalInputChars: session.totalInputChars + 1,
    correctKeystrokes: session.correctKeystrokes + Number(isCorrect),
    errors: session.errors + Number(!isCorrect),
  };
}

export function applyBackspace(session: TestSession, now: number): TestSession {
  if (session.phase !== "running" || session.startedAt === null) return session;
  if (!Number.isFinite(now)) return session;
  if (now >= deadline(session)!) return completeSession(session, now);
  if (session.typed.length === 0) return session;
  return {
    ...session,
    typed: session.typed.slice(0, -1),
    backspaces: session.backspaces + 1,
  };
}
