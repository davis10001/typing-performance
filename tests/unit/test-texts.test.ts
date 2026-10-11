import { describe, expect, it } from "vitest";
import { testTextSchema, testTexts } from "@/lib/content/test-texts";
import { composeTestPrompt, nextTextIndex } from "@/lib/content/prompt-selection";
import { getKeyGuidance } from "@/lib/typing-guide/keyboard";

describe("test text contract", () => {
  it("keeps a source reference for every published text", () => {
    expect(testTexts.length).toBeGreaterThan(0);
    for (const text of testTexts) expect(text.sourceRef).toBeTruthy();
  });

  it("rejects unlicensed or incomplete text", () => {
    expect(() => testTextSchema.parse({ id: "x", language: "en", text: "hello" })).toThrow();
    expect(() => testTextSchema.parse({ ...testTexts[0], sourceRef: "" })).toThrow();
    expect(() => testTextSchema.parse({ ...testTexts[0], difficulty: "expert" })).toThrow();
  });

  it("has distinct, sufficiently long content at every difficulty", () => {
    expect(new Set(testTexts.map((item) => item.id)).size).toBe(testTexts.length);
    for (const difficulty of ["easy", "standard", "advanced"] as const) {
      const texts = testTexts.filter((item) => item.difficulty === difficulty);
      expect(texts.length).toBeGreaterThanOrEqual(10);
      const prompt = composeTestPrompt(texts, Math.floor(texts.length / 2));
      expect(prompt.length).toBeGreaterThanOrEqual(12_000);
      for (const item of texts) expect(prompt.split(item.text).length - 1).toBe(1);
    }
  });

  it("uses characters covered by the finger guide", () => {
    for (const item of testTexts) {
      for (const character of new Set(item.text)) expect(getKeyGuidance(character), `${item.id}: ${character}`).not.toBeNull();
    }
  });

  it("chooses an unused opening passage until the pool is exhausted", () => {
    const standard = testTexts.filter((item) => item.difficulty === "standard");
    const recent = standard.slice(0, 5).map((item) => item.id);
    expect(nextTextIndex(standard, recent)).toBe(5);
  });
});
