import { describe, expect, it } from "vitest";
import { auditCourse, type CourseLesson } from "@/lib/learning/course-audit";

const lesson = (id: string, newCharacters: string, text: string): CourseLesson => ({ id, title: id, newCharacters, text });

describe("learning course source audit", () => {
  it("does not accept an empty course", () => {
    expect(auditCourse([])).toEqual([{ lessonId: "", code: "empty-course" }]);
  });

  it("accepts cumulative keys, review lessons and layout whitespace", () => {
    expect(auditCourse([
      lesson("one", "jf", "j f\njf"), lesson("two", "kd", "kj fd"), lesson("review", "", "jf kd\r\n"),
    ])).toEqual([]);
  });

  it("detects a key introduced by a later lesson without rewriting content", () => {
    const lessons = [lesson("one", "jf", "jf"), lesson("two", "kd", "rd kd"), lesson("three", "r", "r")];
    expect(auditCourse(lessons)).toEqual([{ lessonId: "two", code: "untaught-characters", characters: ["r"] }]);
    expect(lessons[1].text).toBe("rd kd");
  });

  it("does not silently treat capitalization or punctuation as learned", () => {
    expect(auditCourse([lesson("one", "jf", "Jf.")])).toContainEqual({
      lessonId: "one", code: "untaught-characters", characters: [".", "J"],
    });
  });

  it("reports missing content and duplicate identities", () => {
    const issues = auditCourse([lesson("one", "jf", "jf"), lesson("one", "k", " ")]);
    expect(issues.map(({ code }) => code)).toEqual(["duplicate-id", "empty-text", "unpractised-new-characters"]);
  });
});
