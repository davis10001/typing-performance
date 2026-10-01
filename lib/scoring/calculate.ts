import type { TestResult, TestSession } from "@/lib/typing-engine/types";

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateResult(session: TestSession): TestResult | null {
  if (session.phase !== "completed" || session.startedAt === null || session.endedAt === null) return null;

  const elapsedSeconds = Math.max(0, (session.endedAt - session.startedAt) / 1000);
  let correctChars = 0;
  for (let index = 0; index < session.typed.length; index += 1) {
    if (session.typed[index] === session.prompt[index]) correctChars += 1;
  }

  const elapsedMinutes = elapsedSeconds / 60;
  const hasUsableInput = session.totalInputChars > 0 && elapsedMinutes > 0;
  return {
    sessionId: session.id,
    durationSeconds: session.durationSeconds,
    elapsedSeconds: rounded(elapsedSeconds),
    wpm: hasUsableInput ? rounded(correctChars / 5 / elapsedMinutes) : null,
    rawWpm: hasUsableInput ? rounded(session.totalInputChars / 5 / elapsedMinutes) : null,
    accuracy: session.totalInputChars > 0
      ? rounded((session.correctKeystrokes / session.totalInputChars) * 100)
      : null,
    errors: session.errors,
    correctChars,
    typedChars: session.totalInputChars,
    totalKeystrokes: session.totalInputChars,
    anomalyFlags: session.anomalyFlags,
  };
}
