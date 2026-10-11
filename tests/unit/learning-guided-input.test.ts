import { Feedback } from "@keybr/textinput";
import { describe, expect, it, vi } from "vitest";
import { GuidedInputSession, KEYBR_GUIDED_INPUT_DEFAULTS } from "@/lib/learning/guided-input";

function append(session: GuidedInputSession, char: string, timeStamp: number, timeToType = 100) {
  return session.onInput({ inputType: "appendChar", codePoint: char.codePointAt(0)!, timeStamp, timeToType });
}

describe("GuidedInputSession", () => {
  it("uses the locked Keybr practice defaults", () => {
    expect(KEYBR_GUIDED_INPUT_DEFAULTS).toEqual({ stopOnError: true, forgiveErrors: true, spaceSkipsWords: false });
  });

  it("preserves original typo recovery and completes only on the expected text", () => {
    const session = new GuidedInputSession("abcd");
    expect(append(session, "a", 100).feedback).toBe(Feedback.Succeeded);
    expect(append(session, "x", 200).feedback).toBe(Feedback.Failed);
    const recovered = append(session, "b", 300);
    expect(recovered.feedback).toBe(Feedback.Recovered);
    expect(recovered.position).toBe(2);
    append(session, "c", 400);
    expect(append(session, "d", 500).completed).toBe(true);
  });

  it("keeps a wrong space from skipping a word", () => {
    const session = new GuidedInputSession("abc def");
    append(session, "a", 100);
    expect(append(session, " ", 200).position).toBe(1);
    expect(session.snapshot.completed).toBe(false);
  });

  it("maps backspace to the original clear behavior", () => {
    const session = new GuidedInputSession("abc");
    append(session, "x", 100);
    session.onInput({ inputType: "clearChar", codePoint: 0, timeStamp: 200, timeToType: 100 });
    expect(append(session, "a", 300).feedback).toBe(Feedback.Recovered);
  });

  it("maps control-backspace to Keybr clearWord", () => {
    const session = new GuidedInputSession("abc def");
    append(session, "a", 100);
    append(session, "b", 200);
    append(session, "c", 300);
    append(session, " ", 400);
    append(session, "d", 500);
    session.onInput({ inputType: "clearWord", codePoint: 0, timeStamp: 600, timeToType: 0 });
    expect(session.snapshot.position).toBe(4);
  });

  it("creates one upstream Result and ignores repeated completion callbacks", () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);
    const session = new GuidedInputSession("abcdefghijk");
    for (let index = 0; index < session.text.length; index += 1) append(session, session.text[index], (index + 1) * 200, 200);
    const result = session.takeResult();
    expect(result).not.toBeNull();
    expect(result?.length).toBe(11);
    expect(result?.time).toBe(2000);
    expect(result?.histogram.complexity).toBe(10); // Keybr excludes the trigger character.
    expect(result?.validate()).toBe(true);
    expect(session.takeResult()).toBeNull();
    expect(() => append(session, "z", 3000)).not.toThrow();
    expect(session.takeResult()).toBeNull();
  });
});
