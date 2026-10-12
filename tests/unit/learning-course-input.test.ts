import { describe, expect, it } from "vitest";
import { CourseInputSession } from "@/lib/learning/course-input";

describe("CourseInputSession", () => {
  it("requires a KTouch-style correction and retains the error", () => {
    const session = new CourseInputSession("abc");
    session.append("a");
    expect(session.append("x")).toMatchObject({ actual: "ax", correctCharacters: 1, errorCount: 1, completed: false });
    session.backspace();
    session.append("bc");
    expect(session.snapshot).toEqual({ actual: "abc", correctCharacters: 3, errorCount: 1, errorsByExpectedKey: { b: 1 }, completed: true });
  });

  it("does not remove logged statistics when deleting", () => {
    const session = new CourseInputSession("ab cd");
    session.append("ab x");
    const before = session.snapshot;
    session.backspace(true);
    expect(session.snapshot.correctCharacters).toBe(before.correctCharacters);
    expect(session.snapshot.errorCount).toBe(before.errorCount);
  });

  it("treats the return key as the source newline", () => {
    const session = new CourseInputSession("a\nb");
    session.append("a");
    session.append("\n");
    session.append("b");
    expect(session.snapshot.completed).toBe(true);
  });

  it("counts mistakes against the expected lesson key after corrections", () => {
    const session = new CourseInputSession("jf");
    session.append("x");
    session.backspace();
    session.append("jz");
    session.backspace();
    session.append("f");
    expect(session.snapshot.errorsByExpectedKey).toEqual({ j: 1, f: 1 });
  });

  it("holds the cursor at a space and clears its live error after a correct space", () => {
    const session = new CourseInputSession("ab cd");
    session.append("abx");
    expect(session.snapshot).toMatchObject({ actual: "abx", completed: false, errorCount: 1, errorsByExpectedKey: { " ": 1 } });
    session.append(" ");
    expect(session.snapshot.actual).toBe("abx ");
    session.backspace();
    expect(session.snapshot.actual).toBe("abx");
    session.append(" cd");
    expect(session.snapshot).toMatchObject({ actual: "abx cd", completed: true, correctCharacters: 6, errorCount: 1 });
  });
});
