import { describe, expect, it } from "vitest";
import { getKeyGuidance } from "@/lib/typing-guide/keyboard";

describe("finger guide key mapping", () => {
  it("maps lowercase letters to their touch-typing finger", () => {
    expect(getKeyGuidance("f")).toMatchObject({
      primaryKey: "KeyF",
      modifierKey: null,
      fingers: ["left-index"],
      instruction: "Left index finger",
    });
  });

  it("uses the opposite hand for shift", () => {
    expect(getKeyGuidance("A")).toMatchObject({
      primaryKey: "KeyA",
      modifierKey: "ShiftRight",
      fingers: ["left-pinky", "right-pinky"],
    });
    expect(getKeyGuidance("?")).toMatchObject({
      primaryKey: "Slash",
      modifierKey: "ShiftLeft",
      fingers: ["right-pinky", "left-pinky"],
    });
  });

  it("makes whitespace visible and assigns it to a thumb", () => {
    expect(getKeyGuidance(" ")).toMatchObject({
      displayCharacter: "SPACE",
      primaryKey: "Space",
      fingers: ["right-thumb"],
    });
  });

  it("returns no guidance for unsupported characters", () => {
    expect(getKeyGuidance("\n")).toBeNull();
    expect(getKeyGuidance(null)).toBeNull();
  });
});
