import { z } from "zod";

const duration = z.union([z.literal(60), z.literal(120), z.literal(180), z.literal(300), z.literal(600)]);
const page = z.enum(["typing-test", "1-minute-typing-test", "2-minute-typing-test", "3-minute-typing-test", "5-minute-typing-test", "10-minute-typing-test"]);
const anomaly = z.enum(["paste", "drop", "blur", "hidden", "composition"]);

export const eventSchema = z.discriminatedUnion("name", [
  z.strictObject({ name: z.literal("test_view"), page, configured_duration: duration }),
  z.strictObject({ name: z.literal("test_start"), duration, entry_page: page }),
  z.strictObject({ name: z.literal("test_complete"), duration, wpm_bucket: z.enum(["none", "0-19", "20-39", "40-59", "60-79", "80+"]), accuracy_bucket: z.enum(["none", "0-59", "60-79", "80-89", "90-94", "95-100"]), anomaly_flags: z.array(anomaly) }),
  z.strictObject({ name: z.literal("result_retest"), from_duration: duration, to_duration: duration }),
  z.strictObject({ name: z.literal("benchmark_click"), target_page: z.enum(["average-typing-speed", "how-wpm-is-calculated"]) }),
  z.strictObject({ name: z.literal("landing_view"), page: z.enum(["average-typing-speed", "how-wpm-is-calculated", "good-typing-speed", "learn", "learn-practice", "learn-courses", "learn-paragraphs", "faq"]) }),
  z.strictObject({ name: z.literal("result_next_step"), step: z.enum(["understand_speed", "practice", "retest"]) }),
  z.strictObject({ name: z.literal("speed_interpretation"), source: z.enum(["test", "history", "manual"]) }),
  z.strictObject({ name: z.literal("paragraph_complete"), accuracy_bucket: z.enum(["0-59", "60-79", "80-89", "90-94", "95-100"]) }),
  z.strictObject({ name: z.literal("history_clear"), count_bucket: z.enum(["0", "1", "2-5", "6-20"]) }),
]);

export type TelemetryEvent = z.infer<typeof eventSchema>;
export type OperationalErrorCode = "storage_read" | "storage_write" | "storage_clear" | "scoring";
export type WebVitalName = "CLS" | "FCP" | "INP" | "LCP" | "TTFB";

export type TelemetryTransport = {
  event: (value: TelemetryEvent) => void;
  error: (code: OperationalErrorCode) => void;
  vital: (name: WebVitalName, value: number, page: string) => void;
};

const noOpTransport: TelemetryTransport = {
  event: () => {},
  error: () => {},
  vital: () => {},
};

export function createTelemetry(transport: TelemetryTransport = noOpTransport) {
  return {
    event(value: TelemetryEvent): void {
      const parsed = eventSchema.safeParse(value);
      if (!parsed.success) return;
      try { transport.event(parsed.data); } catch { /* analytics must not interrupt a test */ }
    },
    error(code: OperationalErrorCode): void {
      try { transport.error(code); } catch { /* monitoring must not interrupt a test */ }
    },
    vital(name: WebVitalName, value: number, pathname: string): void {
      if (!Number.isFinite(value)) return;
      const pagePath = pathname.split("?")[0].split("#")[0];
      try { transport.vital(name, value, pagePath); } catch { /* monitoring must not interrupt a test */ }
    },
  };
}

let currentTelemetry = createTelemetry();

export const telemetry = {
  event(value: TelemetryEvent): void { currentTelemetry.event(value); },
  error(code: OperationalErrorCode): void { currentTelemetry.error(code); },
  vital(name: WebVitalName, value: number, pathname: string): void { currentTelemetry.vital(name, value, pathname); },
};

export function setTelemetryTransport(transport: TelemetryTransport | null): void {
  currentTelemetry = createTelemetry(transport ?? noOpTransport);
}

export function wpmBucket(value: number | null): Extract<TelemetryEvent, { name: "test_complete" }>["wpm_bucket"] {
  if (value === null) return "none";
  if (value < 20) return "0-19";
  if (value < 40) return "20-39";
  if (value < 60) return "40-59";
  if (value < 80) return "60-79";
  return "80+";
}

export function accuracyBucket(value: number | null): Extract<TelemetryEvent, { name: "test_complete" }>["accuracy_bucket"] {
  if (value === null) return "none";
  if (value < 60) return "0-59";
  if (value < 80) return "60-79";
  if (value < 90) return "80-89";
  if (value < 95) return "90-94";
  return "95-100";
}

export function countBucket(count: number): Extract<TelemetryEvent, { name: "history_clear" }>["count_bucket"] {
  if (count <= 0) return "0";
  if (count === 1) return "1";
  if (count <= 5) return "2-5";
  return "6-20";
}
