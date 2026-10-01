import { describe, expect, it, vi } from "vitest";
import { accuracyBucket, countBucket, createTelemetry, eventSchema, setTelemetryTransport, telemetry, wpmBucket } from "@/lib/telemetry/adapter";
import { analyticsConfigReady, readAnalyticsChoice, redactTelemetryUrl, saveAnalyticsChoice } from "@/lib/telemetry/privacy";

describe("privacy-limited telemetry", () => {
  it("rejects free text and identity fields at runtime", () => {
    expect(eventSchema.safeParse({ name: "test_start", duration: 60, entry_page: "typing-test", typed_text: "secret" }).success).toBe(false);
    expect(eventSchema.safeParse({ name: "test_complete", duration: 60, wpm_bucket: "20-39", accuracy_bucket: "90-94", anomaly_flags: [], email: "name@example.com" }).success).toBe(false);
  });

  it("accepts only buckets and survives a broken provider", () => {
    const event = vi.fn(() => { throw new Error("offline"); });
    const telemetry = createTelemetry({ event, error: () => {}, vital: () => {} });
    expect(() => telemetry.event({ name: "test_complete", duration: 60, wpm_bucket: wpmBucket(42), accuracy_bucket: accuracyBucket(98), anomaly_flags: [] })).not.toThrow();
    expect(event).toHaveBeenCalledWith({ name: "test_complete", duration: 60, wpm_bucket: "40-59", accuracy_bucket: "95-100", anomaly_flags: [] });
    expect(countBucket(3)).toBe("2-5");
  });

  it("strips query and fragment data from a web-vital path", () => {
    const vital = vi.fn();
    createTelemetry({ event: () => {}, error: () => {}, vital }).vital("LCP", 2000, "/typing-test?email=secret#fragment");
    expect(vital).toHaveBeenCalledWith("LCP", 2000, "/typing-test");
  });

  it("keeps the live transport no-op until activated and removes it on revoke", () => {
    const event = vi.fn();
    const payload = { name: "test_start" as const, duration: 60 as const, entry_page: "typing-test" as const };
    telemetry.event(payload);
    setTelemetryTransport({ event, error: () => {}, vital: () => {} });
    telemetry.event(payload);
    setTelemetryTransport(null);
    telemetry.event(payload);
    expect(event).toHaveBeenCalledTimes(1);
  });

  it("requires an opt-in configuration and strips URL query data", () => {
    expect(analyticsConfigReady("off", "G-TEST123", "https://example.com/privacy")).toBe(false);
    expect(analyticsConfigReady("opt-in", "G-TEST123", "https://example.com/privacy")).toBe(true);
    expect(analyticsConfigReady("opt-in", "G-TEST123", "http://example.com/privacy")).toBe(false);
    expect(analyticsConfigReady("opt-in", "G-TEST123", "https://")).toBe(false);
    expect(redactTelemetryUrl({ type: "pageview", url: "https://typinglevel.com/typing-test?text=private#input" })).toEqual({ type: "pageview", url: "https://typinglevel.com/typing-test" });
  });

  it("persists only the user's analytics choice", () => {
    const storage = new Map<string, string>();
    const mock = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => { storage.set(key, value); } } as Storage;
    expect(readAnalyticsChoice(mock)).toBe("pending");
    saveAnalyticsChoice(mock, "declined");
    expect(readAnalyticsChoice(mock)).toBe("declined");
    expect([...storage.values()]).toEqual(["declined"]);
  });
});
