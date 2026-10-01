import { describe, expect, it, vi } from "vitest";
import { accuracyBucket, countBucket, createTelemetry, eventSchema, wpmBucket } from "@/lib/telemetry/adapter";

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
});
