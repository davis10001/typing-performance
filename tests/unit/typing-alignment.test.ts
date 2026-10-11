import { describe, expect, it } from "vitest";
import { alignTypingInput } from "@/lib/typing-engine/alignment";

describe("typing input alignment", () => {
  it("keeps the expected character at an incorrect word position", () => {
    const alignment = alignTypingInput("cat dog", "cxt");

    expect(alignment.cursorIndex).toBe(3);
    expect(alignment.characterStates.get(1)).toBe("error");
    expect(alignment.correctCharacters).toBe(2);
  });

  it("collects actual extra input at a space until the space is typed", () => {
    const waitingForSpace = alignTypingInput("cat dog", "catxyz");
    expect(waitingForSpace.cursorIndex).toBe(3);
    expect(waitingForSpace.extraCharacters.get(3)).toBe("xyz");

    const advanced = alignTypingInput("cat dog", "catxyz ");
    expect(advanced.cursorIndex).toBe(4);
    expect(advanced.extraCharacters.get(3)).toBe("xyz");
    expect(advanced.characterStates.get(3)).toBe("correct");
  });

  it("removes space errors one character at a time when input is shortened", () => {
    expect(alignTypingInput("cat dog", "catxy").extraCharacters.get(3)).toBe("xy");
    expect(alignTypingInput("cat dog", "catx").extraCharacters.get(3)).toBe("x");
    expect(alignTypingInput("cat dog", "cat").extraCharacters.has(3)).toBe(false);
  });
});
