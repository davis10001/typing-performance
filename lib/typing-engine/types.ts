export type TestPhase = "ready" | "countdown" | "running" | "completed" | "abandoned";
export type AnomalyFlag = "paste" | "drop" | "blur" | "hidden" | "composition";

export type TestSession = {
  id: string;
  phase: TestPhase;
  durationSeconds: number;
  prompt: string;
  typed: string;
  startedAt: number | null;
  endedAt: number | null;
  totalInputChars: number;
  correctKeystrokes: number;
  errors: number;
  backspaces: number;
  anomalyFlags: AnomalyFlag[];
};

export type TestResult = {
  sessionId: string;
  durationSeconds: number;
  elapsedSeconds: number;
  wpm: number | null;
  rawWpm: number | null;
  accuracy: number | null;
  errors: number;
  correctChars: number;
  typedChars: number;
  totalKeystrokes: number;
  anomalyFlags: AnomalyFlag[];
};
