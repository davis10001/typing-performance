import { describe, expect, it } from "vitest";
import { buildTestPrompt, testTextSchema, testTexts } from "@/lib/content/test-texts";

describe("test text contract", () => {
  it("keeps a source reference for every published text", () => {
    expect(testTexts.length).toBeGreaterThan(0);
    for (const text of testTexts) expect(text.sourceRef).toBeTruthy();
  });

  it("rejects unlicensed or incomplete text", () => {
    expect(() => testTextSchema.parse({ id: "x", language: "en", text: "hello" })).toThrow();
    expect(() => testTextSchema.parse({ ...testTexts[0], sourceRef: "" })).toThrow();
  });

  it("builds enough prompt characters for a timed test", () => {
    expect(buildTestPrompt(12_000).length).toBeGreaterThanOrEqual(12_000);
  });
});
