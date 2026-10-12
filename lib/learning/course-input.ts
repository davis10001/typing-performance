export type CourseInputSnapshot = {
  actual: string;
  completed: boolean;
  correctCharacters: number;
  errorCount: number;
  errorsByExpectedKey: Record<string, number>;
};

/**
 * Keeps KTouch's cumulative error statistics while aligning typed characters
 * to the lesson text. A wrong key at a space does not shift the passage.
 */
export class CourseInputSession {
  #actual = "";
  #cursorIndex = 0;
  #uncorrectedErrors = 0;
  #history: { advanced: boolean; wrong: boolean }[] = [];
  #correctCharacters = 0;
  #errorCount = 0;
  #errorsByExpectedKey: Record<string, number> = {};

  constructor(readonly text: string) {}

  get snapshot(): CourseInputSnapshot {
    return {
      actual: this.#actual,
      completed: this.#cursorIndex === this.text.length && this.#uncorrectedErrors === 0,
      correctCharacters: this.#correctCharacters,
      errorCount: this.#errorCount,
      errorsByExpectedKey: { ...this.#errorsByExpectedKey },
    };
  }

  append(character: string): CourseInputSnapshot {
    if (this.#cursorIndex === this.text.length || character.length === 0) return this.snapshot;
    for (const input of character) {
      if (this.#cursorIndex >= this.text.length) break;
      const expected = this.text[this.#cursorIndex];
      const wrong = input !== expected;
      const advanced = expected !== " " || !wrong;
      if (!wrong) this.#correctCharacters += 1;
      else {
        this.#errorCount += 1;
        this.#errorsByExpectedKey[expected] = (this.#errorsByExpectedKey[expected] ?? 0) + 1;
      }
      this.#actual += input;
      this.#history.push({ advanced, wrong });
      if (advanced) {
        this.#cursorIndex += 1;
        if (wrong) this.#uncorrectedErrors += 1;
      }
    }
    return this.snapshot;
  }

  backspace(word = false): CourseInputSnapshot {
    if (this.#actual.length === 0) return this.snapshot;
    const trimmed = word ? this.#actual.replace(/\S+\s*$/, "") : this.#actual.slice(0, -1);
    const remaining = trimmed.length === this.#actual.length ? this.#actual.length - 1 : trimmed.length;
    while (this.#actual.length > remaining) {
      this.#actual = this.#actual.slice(0, -1);
      const last = this.#history.pop();
      if (last?.advanced) {
        this.#cursorIndex -= 1;
        if (last.wrong) this.#uncorrectedErrors -= 1;
      }
    }
    return this.snapshot;
  }
}
