import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { auditCourse } from "@/lib/learning/course-audit";
import { englishQwertyCourse } from "@/lib/learning/course-content";

describe("bundled KTouch English course", () => {
  it("passes the KTouch content rules after one recorded minimum repair", () => {
    expect(englishQwertyCourse.lessons).toHaveLength(15);
    expect(auditCourse(englishQwertyCourse.lessons)).toEqual([]);
    expect(englishQwertyCourse.repairs).toEqual([expect.objectContaining({ lessonId: "caps1", append: "Q X Y" })]);
  });

  it("keeps every source lesson unchanged except the documented append", () => {
    const source = readFileSync("vendor/ktouch/courses/gb.xml", "utf8");
    expect(createHash("sha256").update(source).digest("hex")).toBe(englishQwertyCourse.source.sha256);
    const sourceTexts = [...source.matchAll(/<lesson>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<\/lesson>/g)]
      .map((match) => match[1]);
    expect(sourceTexts).toHaveLength(englishQwertyCourse.lessons.length);
    sourceTexts.forEach((sourceText, index) => {
      const outputText = englishQwertyCourse.lessons[index].text;
      expect(outputText).toBe(index === sourceTexts.length - 1 ? `${sourceText}\nQ X Y` : sourceText);
    });
  });
});
